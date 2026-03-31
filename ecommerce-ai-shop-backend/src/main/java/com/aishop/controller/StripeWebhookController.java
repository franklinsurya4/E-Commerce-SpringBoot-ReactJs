package com.aishop.controller;

import com.aishop.config.StripeConfig;
import com.aishop.model.Order;
import com.aishop.model.TrackingEvent;
import com.aishop.repository.OrderRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final OrderRepository orderRepository;
    private final StripeConfig stripeConfig;

    /**
     * Handles Stripe webhook events.
     *
     * When a checkout.session.completed event is received:
     * - Updates the order status from PENDING to CONFIRMED
     * - Stores the Stripe payment intent ID
     * - Adds a tracking event
     *
     * For local testing, use Stripe CLI:
     *   stripe listen --forward-to localhost:8080/api/stripe/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Verify the webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhookSecret());

            log.info("Stripe webhook received: {}", event.getType());

            switch (event.getType()) {
                case "checkout.session.completed" -> handleCheckoutComplete(event);
                case "checkout.session.expired" -> handleCheckoutExpired(event);
                default -> log.info("Unhandled Stripe event type: {}", event.getType());
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Stripe webhook error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    private void handleCheckoutComplete(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (session == null) {
            log.warn("Could not deserialize checkout session");
            return;
        }

        String orderId = session.getMetadata().get("orderId");
        if (orderId == null) {
            log.warn("No orderId in session metadata");
            return;
        }

        Order order = orderRepository.findById(Long.parseLong(orderId)).orElse(null);
        if (order == null) {
            log.warn("Order not found: {}", orderId);
            return;
        }

        // Update order with payment confirmation
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentId(session.getPaymentIntent());

        TrackingEvent trackingEvent = TrackingEvent.builder()
                .status("CONFIRMED")
                .description("Payment received via Stripe. Your order is confirmed!")
                .location("Payment Gateway")
                .build();
        order.addTrackingEvent(trackingEvent);

        orderRepository.save(order);
        log.info("Order {} confirmed via Stripe payment: {}", order.getOrderNumber(), session.getPaymentIntent());
    }

    private void handleCheckoutExpired(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (session == null) return;

        String orderId = session.getMetadata().get("orderId");
        if (orderId == null) return;

        Order order = orderRepository.findById(Long.parseLong(orderId)).orElse(null);
        if (order == null) return;

        // Only cancel if still pending (user never paid)
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CANCELLED);

            TrackingEvent trackingEvent = TrackingEvent.builder()
                    .status("CANCELLED")
                    .description("Payment session expired. Order cancelled.")
                    .location("Payment Gateway")
                    .build();
            order.addTrackingEvent(trackingEvent);

            // Restore stock
            order.getItems().forEach(item -> {
                var product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
            });

            orderRepository.save(order);
            log.info("Order {} cancelled due to expired Stripe session", order.getOrderNumber());
        }
    }
}