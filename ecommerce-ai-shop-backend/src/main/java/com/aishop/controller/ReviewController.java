package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.service.ReviewService;
import com.aishop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getProductReviews(productId)));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ReviewDto>> addReview(Authentication auth,
            @PathVariable Long productId, @RequestBody ReviewRequest req) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.ok("Review added", reviewService.addReview(userId, productId, req)));
    }
}
