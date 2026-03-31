package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.Product;
import com.aishop.repository.ProductRepository;
import com.aishop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    // ── Existing Endpoints ──
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllProducts()));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeaturedProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getById(@PathVariable Long id) {
        try {
            log.info("Fetching product with id: {}", id);
            ProductDto product = productService.getProduct(id);
            return ResponseEntity.ok(ApiResponse.ok(product));
        } catch (AppException e) {
            log.warn("Product not found: {}", id);
            return ResponseEntity.status(404)
                    .body(ApiResponse.notFound("Product not found or inactive"));
        } catch (Exception e) {
            log.error("Error fetching product {}: {}", id, e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.internalError("Failed to fetch product"));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getByCategory(category)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDto>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(productService.search(q)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getCategories()));
    }

    // ── NEW: Price Drop Endpoints ──

    @GetMapping("/price-drops")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getActivePriceDrops() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getActivePriceDrops()));
    }

    @GetMapping("/price-drops/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getPriceDropsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getPriceDropsByCategory(category)));
    }

    @GetMapping("/price-drops/sorted")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getPriceDropsSorted() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getPriceDropsSortedByDiscount()));
    }

    @GetMapping("/{id}/price-drop-info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPriceDropInfo(@PathVariable Long id) {
        try {
            ProductDto product = productService.getProduct(id);

            if (!Boolean.TRUE.equals(product.getIsPriceDropped())) {
                return ResponseEntity.ok(ApiResponse.error("Product is not on a price drop", 400));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("product", product);
            response.put("originalPrice", product.getOriginalPrice());
            response.put("currentPrice", product.getPrice());
            response.put("savings", product.getSavingsAmount());
            response.put("discountPercent", product.getDiscountPercent());
            response.put("priceDropDate", product.getPriceDropDate());
            response.put("priceDropExpiry", product.getPriceDropExpiry());
            response.put("isExpired", product.getPriceDropExpiry() != null &&
                    LocalDateTime.now().isAfter(product.getPriceDropExpiry()));
            response.put("timeRemaining", calculateTimeRemaining(product.getPriceDropExpiry()));

            return ResponseEntity.ok(ApiResponse.ok(response));
        } catch (AppException e) {
            return ResponseEntity.status(404).body(ApiResponse.notFound("Product not found"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@RequestBody ProductDto dto) {
        ProductDto created = productService.createProduct(dto);
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Product created successfully", created, 201));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id, @RequestBody ProductDto dto) {
        ProductDto updated = productService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @PatchMapping("/{id}/price-drop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerPriceDrop(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        try {
            BigDecimal newPrice = new BigDecimal(request.get("newPrice").toString());
            String expiryStr = (String) request.get("expiryDate");
            LocalDateTime expiry = null;

            if (expiryStr != null && !expiryStr.isEmpty()) {
                expiry = LocalDateTime.parse(expiryStr);
            }

            ProductDto result = productService.triggerPriceDrop(id, newPrice, expiry);

            Map<String, Object> response = new HashMap<>();
            response.put("product", result);
            response.put("savings", result.getSavingsAmount());
            response.put("discountPercent", result.getDiscountPercent());

            return ResponseEntity.ok(ApiResponse.ok("Price drop activated", response));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("Invalid price format"));
        } catch (AppException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/price-drop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> endPriceDrop(@PathVariable Long id) {
        try {
            ProductDto result = productService.endPriceDrop(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("product", result);
            response.put("message", "Price drop ended, original price restored");

            return ResponseEntity.ok(ApiResponse.ok(response));
        } catch (AppException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── Helper Methods ──

    private String calculateTimeRemaining(LocalDateTime expiry) {
        if (expiry == null) return "No expiry";
        if (LocalDateTime.now().isAfter(expiry)) return "Expired";

        long hours = java.time.Duration.between(LocalDateTime.now(), expiry).toHours();
        long days = hours / 24;
        hours = hours % 24;

        if (days > 0) {
            return days + "d " + hours + "h remaining";
        } else if (hours > 0) {
            return hours + "h remaining";
        } else {
            return "Ending soon";
        }
    }
}