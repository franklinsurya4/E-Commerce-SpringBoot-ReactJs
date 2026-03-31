package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.model.User;
import com.aishop.repository.UserRepository;
import com.aishop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Place order — delegates to OrderService which reads from CART ──
    @PostMapping
    public ResponseEntity<Map<String, Object>> placeOrder(
            @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = getUser(userDetails);
            OrderDto order = orderService.placeOrder(user.getId(), request);
            response.put("success", true);
            response.put("message", "Order placed successfully");
            response.put("data", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ── Get all orders for current user ──
    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orderService.getUserOrders(user.getId()));
        return ResponseEntity.ok(response);
    }

    // ── Get order by ID ──
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = getUser(userDetails);
            response.put("success", true);
            response.put("data", orderService.getOrder(user.getId(), id));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        }
    }

    // ── Stats ──
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orderService.getOrderStats(user.getId()));
        return ResponseEntity.ok(response);
    }

    // ── Track order (public) ──
    @GetMapping("/track/{number}")
    public ResponseEntity<Map<String, Object>> trackOrder(@PathVariable String number) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", orderService.trackOrder(number));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        }
    }

    // ── Update order status (Ship/Deliver buttons) ──
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", orderService.updateOrderStatus(id, status));
            response.put("message", "Status updated to " + status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ── Cancel order ──
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = getUser(userDetails);
            response.put("success", true);
            response.put("data", orderService.cancelOrder(user.getId(), id));
            response.put("message", "Order cancelled");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}