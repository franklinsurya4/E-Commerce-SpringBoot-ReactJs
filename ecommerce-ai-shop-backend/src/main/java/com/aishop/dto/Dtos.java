package com.aishop.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Dtos {

    // ========== AUTH ==========
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private UserDto user;
    }

    // ========== USER ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserDto {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String avatarUrl;
        private String role;
        private boolean emailNotifications;
        private boolean pushNotifications;
        private String theme;
        private String language;
        private LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String fullName;
        private String phone;
        private String avatarUrl;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateSettingsRequest {
        private Boolean emailNotifications;
        private Boolean pushNotifications;
        private String theme;
        private String language;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }

    // ========== ADDRESS ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddressDto {
        private Long id;
        private String label;
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private boolean isDefault;
    }

    // ========== PRODUCT ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductDto {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;

        // 🔥 Price Drop Fields
        private BigDecimal originalPrice;
        private LocalDateTime priceDropDate;
        private LocalDateTime priceDropExpiry;
        private Boolean isPriceDropped;
        private Integer discountPercent;
        private BigDecimal savingsAmount;

        private String imageUrl;
        private List<String> images;
        private String category;
        private String brand;
        private int stock;
        private double rating;
        private int reviewCount;
        private List<String> tags;
        private boolean featured;
        private boolean active;
        private LocalDateTime createdAt;
    }

    // ========== CART ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CartItemDto {
        private Long id;
        private ProductDto product;
        private int quantity;
        private String selectedSize;
        private String selectedColor;
        private BigDecimal lineTotal;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AddToCartRequest {
        private Long productId;
        private int quantity;
        private String selectedSize;
        private String selectedColor;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CartSummary {
        private List<CartItemDto> items;
        private BigDecimal subtotal;
        private BigDecimal tax;
        private BigDecimal shipping;
        private BigDecimal total;
        private int itemCount;
    }

    // ========== ORDER ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderDto {
        private Long id;
        private String orderNumber;
        private String status;
        private List<OrderItemDto> items;
        private BigDecimal subtotal;
        private BigDecimal tax;
        private BigDecimal shippingCost;
        private BigDecimal total;
        private String shippingAddress;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private String shippingCountry;
        private String paymentMethod;
        private String trackingNumber;
        private String trackingCarrier;
        private LocalDateTime estimatedDelivery;
        private LocalDateTime shippedAt;
        private LocalDateTime deliveredAt;
        private LocalDateTime createdAt;
        private List<TrackingEventDto> trackingEvents;

        @JsonInclude(JsonInclude.Include.NON_NULL)
        private String stripeCheckoutUrl;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private BigDecimal price;
        private int quantity;
        private String selectedSize;
        private String selectedColor;
        private BigDecimal lineTotal;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PlaceOrderRequest {
        private Long addressId;
        private String shippingAddress;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private String shippingCountry;
        private String paymentMethod;
        private String paymentId;
        private String orderNumber;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TrackingEventDto {
        private String status;
        private String description;
        private String location;
        private LocalDateTime timestamp;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderStats {
        private long totalOrders;
        private long pendingOrders;
        private long shippedOrders;
        private long deliveredOrders;
    }

    // ========== REVIEW ==========
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ReviewRequest {
        private int rating;
        private String comment;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReviewDto {
        private Long id;
        private String userName;
        private int rating;
        private String comment;
        private LocalDateTime createdAt;
    }

    // ========== CHAT ==========
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChatRequest {
        private String message;
        private List<ChatMessage> history;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChatMessage {
        private String role;
        private String content;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChatResponse {
        private String reply;
        private List<ProductDto> suggestedProducts;
    }

    // ═══════════════════════════════════════════════
    //  ✅ PUSH NOTIFICATION DTOs — FIXED NAMES
    // ═══════════════════════════════════════════════

    /**
     * Keys object inside a push subscription (p256dh + auth)
     * ✅ RENAMED: PushSubscriptionKeysDto → PushSubscriptionKeys
     */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PushSubscriptionKeys {  // ✅ NO "Dto" suffix
        private String p256dh;
        private String auth;
    }

    /**
     * Full push subscription object returned to frontend
     */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PushSubscriptionDto {
        private Long id;
        private String endpoint;
        private PushSubscriptionKeys keys;  // ✅ References renamed class
        private String userAgent;
        private Boolean active;
        private String deviceInfo;
        private String platform;
        private String endpointMasked;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    /**
     * Request body for POST /api/notifications/subscribe
     * ✅ RENAMED: SavePushSubscriptionRequest → PushSubscriptionRequest
     */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PushSubscriptionRequest {  // ✅ Matches controller import
        private String endpoint;
        private PushSubscriptionKeys keys;  // ✅ References renamed keys class
        private String userAgent;
        private String ipAddress;
    }

    /**
     * Summary for listing user's subscriptions
     */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubscriptionSummary {
        private Long id;
        private String endpointMasked;
        private String deviceInfo;
        private String userAgent;
        private String platform;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime lastUsedAt;
    }

    // ========== GENERIC ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
        private int statusCode;

        public static <T> ApiResponse<T> ok(T data) {
            return ApiResponse.<T>builder()
                    .success(true).message("Success").data(data).statusCode(200).build();
        }

        public static <T> ApiResponse<T> ok(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true).message(message).data(data).statusCode(200).build();
        }

        public static <T> ApiResponse<T> ok(String message, T data, int statusCode) {
            return ApiResponse.<T>builder()
                    .success(true).message(message).data(data).statusCode(statusCode).build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false).message(message).statusCode(400).build();
        }

        public static <T> ApiResponse<T> error(String message, int statusCode) {
            return ApiResponse.<T>builder()
                    .success(false).message(message).statusCode(statusCode).build();
        }

        public static <T> ApiResponse<T> error(String message, int statusCode, T data) {
            return ApiResponse.<T>builder()
                    .success(false).message(message).data(data).statusCode(statusCode).build();
        }

        public static <T> ApiResponse<T> badRequest(String message) {
            return error(message, 400);
        }

        public static <T> ApiResponse<T> unauthorized(String message) {
            return error(message, 401);
        }

        public static <T> ApiResponse<T> forbidden(String message) {
            return error(message, 403);
        }

        public static <T> ApiResponse<T> notFound(String message) {
            return error(message, 404);
        }

        public static <T> ApiResponse<T> conflict(String message) {
            return error(message, 409);
        }

        public static <T> ApiResponse<T> internalError(String message) {
            return error(message, 500);
        }
    }
}