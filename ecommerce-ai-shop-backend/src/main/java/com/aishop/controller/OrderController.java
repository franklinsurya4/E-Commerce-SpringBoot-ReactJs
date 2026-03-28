package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.service.OrderService;
import com.aishop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    private Long getUserId(Authentication auth) {
        return userService.getUserByEmail(auth.getName()).getId();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(Authentication auth, @RequestBody PlaceOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order placed!", orderService.placeOrder(getUserId(auth), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getUserOrders(getUserId(auth))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrder(getUserId(auth), id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OrderStats>> getStats(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderStats(getUserId(auth))));
    }

    // Track by tracking number OR order number
    @GetMapping("/track/{number}")
    public ResponseEntity<ApiResponse<OrderDto>> track(@PathVariable String number) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.trackOrder(number)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled", orderService.cancelOrder(getUserId(auth), id)));
    }

    // Update order status (for admin or self-managed updates)
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", orderService.updateOrderStatus(id, status)));
    }
}