package Com.E_Commerce.MarketPlace.Service;

import Com.E_Commerce.MarketPlace.Model.Order;
import Com.E_Commerce.MarketPlace.Model.OrderItem;
import Com.E_Commerce.MarketPlace.Repository.OrderRepository;
import Com.E_Commerce.MarketPlace.dto.OrderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final EmailService    emailService;

    @Transactional
    public Order placeOrder(OrderRequest req) {
        Order order = Order.builder()
                .customerName(req.getCustomerName())
                .customerEmail(req.getCustomerEmail())
                .deliveryAddress(req.getDeliveryAddress())
                .totalAmount(req.getTotalAmount())
                .status(Order.OrderStatus.CONFIRMED)
                .build();

        List<OrderItem> items = req.getItems().stream().map(dto ->
                OrderItem.builder()
                        .order(order)
                        .productId(dto.getProductId())
                        .productName(dto.getProductName())
                        .imageUrl(dto.getImageUrl())
                        .price(dto.getPrice())
                        .quantity(dto.getQuantity())
                        .category(dto.getCategory())
                        .build()
        ).toList();

        order.setItems(items);
        Order saved = orderRepository.save(order);
        emailService.sendOrderConfirmation(saved);   // ✅ CONFIRMED email
        return saved;
    }

    public List<Order> getOrdersByEmail(String email) {
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByPlacedAtDesc(email);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order shipOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.SHIPPED);
        Order saved = orderRepository.save(order);
        emailService.sendOrderShipped(saved);        // ✅ SHIPPED email
        return saved;
    }

    @Transactional
    public Order deliverOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.DELIVERED);
        Order saved = orderRepository.save(order);
        emailService.sendOrderDelivered(saved);      // ✅ DELIVERED email
        return saved;
    }

    @Transactional
    public Order cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        emailService.sendOrderCancelled(saved);      // ✅ CANCELLED email
        return saved;
    }
}