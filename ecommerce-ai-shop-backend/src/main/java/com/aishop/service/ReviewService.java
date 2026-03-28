package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.*;
import com.aishop.repository.ProductRepository;
import com.aishop.repository.ReviewRepository;
import com.aishop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ReviewDto addReview(Long userId, Long productId, ReviewRequest req) {
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new AppException("You've already reviewed this product");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new AppException("Product not found"));

        Review review = Review.builder()
                .product(product).user(user).userName(user.getFullName())
                .rating(req.getRating()).comment(req.getComment()).build();
        reviewRepository.save(review);

        Double avg = reviewRepository.getAverageRating(productId);
        product.setRating(avg != null ? avg : 0);
        product.setReviewCount(product.getReviewCount() + 1);
        productRepository.save(product);

        return toDto(review);
    }

    private ReviewDto toDto(Review r) {
        return ReviewDto.builder().id(r.getId()).userName(r.getUserName())
                .rating(r.getRating()).comment(r.getComment()).createdAt(r.getCreatedAt()).build();
    }
}
