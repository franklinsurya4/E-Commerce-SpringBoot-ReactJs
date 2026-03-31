package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.*;
import com.aishop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final EmailService emailService;
    private final StripeService stripeService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");
    private static final BigDecimal FREE_SHIPPING = new BigDecimal("50.00");
    private static final BigDecimal SHIPPING = new BigDecimal("5.99");

    @Transactional
    public OrderDto placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException("User not found"));
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) throw new AppException("Cart is empty");

        // ══════════════════════════════════════════════
        //  FIX: Resolve address from addressId if provided
        // ══════════════════════════════════════════════
        String shipAddress = request.getShippingAddress();
        String shipCity = request.getShippingCity();
        String shipState = request.getShippingState();
        String shipZip = request.getShippingZip();
        String shipCountry = request.getShippingCountry();

        if (request.getAddressId() != null) {
            Address addr = addressRepository.findById(request.getAddressId()).orElse(null);
            if (addr != null) {
                shipAddress = addr.getStreet();
                shipCity = addr.getCity();
                shipState = addr.getState();
                shipZip = addr.getZipCode();
                shipCountry = addr.getCountry();
            }
        }

        // ── Determine payment method ──
        Order.PaymentMethod pm = parsePaymentMethod(request.getPaymentMethod());
        boolean isStripe = (pm == Order.PaymentMethod.STRIPE);

        Order order = Order.builder()
                .user(user)
                .shippingAddress(shipAddress)
                .shippingCity(shipCity)
                .shippingState(shipState)
                .shippingZip(shipZip)
                .shippingCountry(shipCountry)
                .paymentMethod(pm)
                .paymentId(request.getPaymentId())
                .status(isStripe ? Order.OrderStatus.PENDING : Order.OrderStatus.CONFIRMED)
                .estimatedDelivery(LocalDateTime.now().plusDays(5))
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStock() < ci.getQuantity()) throw new AppException("Insufficient stock for " + p.getName());
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);

            OrderItem oi = OrderItem.builder()
                    .product(p).productName(p.getName()).productImage(p.getImageUrl())
                    .price(p.getPrice()).quantity(ci.getQuantity())
                    .selectedSize(ci.getSelectedSize()).selectedColor(ci.getSelectedColor())
                    .build();
            order.addItem(oi);
            subtotal = subtotal.add(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING) >= 0 ? BigDecimal.ZERO : SHIPPING;
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCost(shipping);
        order.setTotal(subtotal.add(tax).add(shipping));

        // ── Tracking event ──
        String eventStatus = isStripe ? "PENDING" : "CONFIRMED";
        String eventDesc = isStripe
                ? "Order created. Awaiting payment via Stripe."
                : "Your order has been placed and confirmed.";

        TrackingEvent event = TrackingEvent.builder()
                .status(eventStatus)
                .description(eventDesc)
                .location("Processing Center")
                .build();
        order.addTrackingEvent(event);

        Order saved = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);

        // ── Stripe Checkout Session ──
        String stripeCheckoutUrl = null;
        if (isStripe) {
            try {
                stripeCheckoutUrl = stripeService.createCheckoutSession(saved);
                saved.setPaymentId("pending_stripe_" + saved.getOrderNumber());
                orderRepository.save(saved);
                log.info("Stripe checkout session created for order: {}", saved.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to create Stripe session for order: {}", saved.getOrderNumber(), e);
                for (OrderItem oi : saved.getItems()) {
                    Product p = oi.getProduct();
                    p.setStock(p.getStock() + oi.getQuantity());
                    productRepository.save(p);
                }
                saved.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(saved);
                throw new AppException("Failed to create payment session. Please try again.");
            }
        }

        // Send email for non-Stripe orders
        if (!isStripe) {
            try {
                emailService.sendOrderConfirmation(user.getEmail(), user.getFullName(), saved);
            } catch (Exception e) {
                log.warn("Failed to send order confirmation email", e);
            }
        }

        OrderDto dto = toDto(saved);
        dto.setStripeCheckoutUrl(stripeCheckoutUrl);
        return dto;
    }

    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto getOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException("Order not found"));
        return toDto(order);
    }

    public OrderDto trackOrder(String number) {
        Order order = orderRepository.findByTrackingNumber(number)
                .or(() -> orderRepository.findByOrderNumber(number))
                .orElseThrow(() -> new AppException("Order not found with: " + number));
        return toDto(order);
    }

    public OrderStats getOrderStats(Long userId) {
        return OrderStats.builder()
                .totalOrders(orderRepository.countByUserId(userId))
                .pendingOrders(orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.PENDING)
                        + orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.CONFIRMED)
                        + orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.PROCESSING))
                .shippedOrders(orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.SHIPPED)
                        + orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.OUT_FOR_DELIVERY))
                .deliveredOrders(orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED))
                .build();
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new AppException("Order not found"));
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);
        order.setStatus(newStatus);

        String description = switch (newStatus) {
            case PROCESSING -> "Your order is being prepared.";
            case SHIPPED -> { order.setShippedAt(LocalDateTime.now()); yield "Your order has been shipped!"; }
            case OUT_FOR_DELIVERY -> "Your order is out for delivery.";
            case DELIVERED -> { order.setDeliveredAt(LocalDateTime.now()); yield "Your order has been delivered!"; }
            case CANCELLED -> "Your order has been cancelled.";
            default -> "Order status updated to " + status;
        };

        TrackingEvent event = TrackingEvent.builder()
                .status(newStatus.name()).description(description).location("Distribution Center").build();
        order.addTrackingEvent(event);

        Order saved = orderRepository.save(order);

        try {
            emailService.sendOrderStatusUpdate(order.getUser().getEmail(), order.getUser().getFullName(), saved);
        } catch (Exception e) {
            log.warn("Failed to send status update email", e);
        }

        return toDto(saved);
    }

    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException("Order not found"));
        if (order.getStatus() == Order.OrderStatus.SHIPPED ||
                order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new AppException("Cannot cancel a shipped/delivered order");
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        for (OrderItem oi : order.getItems()) {
            Product p = oi.getProduct();
            p.setStock(p.getStock() + oi.getQuantity());
            productRepository.save(p);
        }
        TrackingEvent event = TrackingEvent.builder()
                .status("CANCELLED").description("Order cancelled by customer.").location("N/A").build();
        order.addTrackingEvent(event);
        return toDto(orderRepository.save(order));
    }

    private Order.PaymentMethod parsePaymentMethod(String method) {
        if (method == null) return Order.PaymentMethod.COD;
        try {
            return Order.PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Order.PaymentMethod.COD;
        }
    }

    private OrderDto toDto(Order o) {
        return OrderDto.builder()
                .id(o.getId()).orderNumber(o.getOrderNumber()).status(o.getStatus().name())
                .items(o.getItems().stream().map(this::toItemDto).collect(Collectors.toList()))
                .subtotal(o.getSubtotal()).tax(o.getTax()).shippingCost(o.getShippingCost()).total(o.getTotal())
                .shippingAddress(o.getShippingAddress()).shippingCity(o.getShippingCity())
                .shippingState(o.getShippingState()).shippingZip(o.getShippingZip())
                .shippingCountry(o.getShippingCountry())
                .paymentMethod(o.getPaymentMethod().name())
                .trackingNumber(o.getTrackingNumber()).trackingCarrier(o.getTrackingCarrier())
                .estimatedDelivery(o.getEstimatedDelivery())
                .shippedAt(o.getShippedAt()).deliveredAt(o.getDeliveredAt())
                .createdAt(o.getCreatedAt())
                .trackingEvents(o.getTrackingEvents().stream().map(e ->
                        TrackingEventDto.builder().status(e.getStatus()).description(e.getDescription())
                                .location(e.getLocation()).timestamp(e.getTimestamp()).build()
                ).collect(Collectors.toList()))
                .build();
    }

    private OrderItemDto toItemDto(OrderItem oi) {
        return OrderItemDto.builder()
                .id(oi.getId()).productId(oi.getProduct().getId())
                .productName(oi.getProductName()).productImage(oi.getProductImage())
                .price(oi.getPrice()).quantity(oi.getQuantity())
                .selectedSize(oi.getSelectedSize()).selectedColor(oi.getSelectedColor())
                .lineTotal(oi.getLineTotal()).build();
    }
}