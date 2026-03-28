package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.model.User;
import com.aishop.service.CartService;
import com.aishop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    private Long getUserId(Authentication auth) {
        return userService.getUserByEmail(auth.getName()).getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartSummary>> getCart(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(getUserId(auth))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartItemDto>> addToCart(Authentication auth, @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Added to cart", cartService.addToCart(getUserId(auth), request)));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartItemDto>> updateQuantity(Authentication auth,
            @PathVariable Long itemId, @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.updateQuantity(getUserId(auth), itemId, quantity)));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(Authentication auth, @PathVariable Long itemId) {
        cartService.removeItem(getUserId(auth), itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication auth) {
        cartService.clearCart(getUserId(auth));
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared", null));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Integer>> getCount(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCartCount(getUserId(auth))));
    }
}
