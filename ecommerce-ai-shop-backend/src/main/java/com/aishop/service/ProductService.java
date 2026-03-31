package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.Product;
import com.aishop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> getAllProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto getProduct(Long id) {
        log.debug("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .filter(Product::isActive)  // ✅ Only return active products
                .orElseThrow(() -> {
                    log.warn("Product not found or inactive: {}", id);
                    return new AppException("Product not found");
                });
        return toDto(product);
    }

    public List<ProductDto> getByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> search(String query) {
        return productRepository.search(query).stream()
                .filter(Product::isActive)
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return productRepository.findAllCategories();
    }

    // 🔥 Price Drop Methods

    public List<ProductDto> getActivePriceDrops() {
        return productRepository.findActivePriceDrops(LocalDateTime.now()).stream()
                .filter(Product::isActive)
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> getPriceDropsByCategory(String category) {
        return productRepository.findPriceDropsByCategory(category, LocalDateTime.now()).stream()
                .filter(Product::isActive)
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> getPriceDropsSortedByDiscount() {
        return productRepository.findPriceDropsSortedByDiscount(LocalDateTime.now()).stream()
                .filter(Product::isActive)
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ProductDto triggerPriceDrop(Long productId, BigDecimal newPrice, LocalDateTime expiry) {
        Product product = productRepository.findById(productId)
                .filter(Product::isActive)
                .orElseThrow(() -> new AppException("Product not found"));

        if (product.getOriginalPrice() == null) {
            product.setOriginalPrice(product.getPrice());
        }

        if (newPrice.compareTo(product.getOriginalPrice()) >= 0) {
            throw new AppException("New price must be lower than original price for a price drop");
        }

        product.setPrice(newPrice);
        product.setPriceDropDate(LocalDateTime.now());
        product.setPriceDropExpiry(expiry);
        product.touch();

        log.info("Price drop triggered for product {}: {} -> {}",
                productId, product.getOriginalPrice(), newPrice);

        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto endPriceDrop(Long productId) {
        Product product = productRepository.findById(productId)
                .filter(Product::isActive)
                .orElseThrow(() -> new AppException("Product not found"));

        if (product.getOriginalPrice() != null) {
            product.setPrice(product.getOriginalPrice());
        }
        product.setPriceDropDate(null);
        product.setPriceDropExpiry(null);
        product.touch();

        return toDto(productRepository.save(product));
    }

    public ProductDto createProduct(ProductDto dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .originalPrice(dto.getOriginalPrice())
                .priceDropDate(dto.getPriceDropDate())
                .priceDropExpiry(dto.getPriceDropExpiry())
                .imageUrl(dto.getImageUrl())
                .images(dto.getImages() != null ? dto.getImages() : new ArrayList<>())
                .category(dto.getCategory())
                .brand(dto.getBrand())
                .stock(dto.getStock())
                .rating(dto.getRating())
                .reviewCount(dto.getReviewCount())
                .tags(dto.getTags() != null ? dto.getTags() : new ArrayList<>())
                .featured(dto.isFeatured())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        if (product.getOriginalPrice() != null && product.getPrice() != null) {
            if (product.getPrice().compareTo(product.getOriginalPrice()) < 0) {
                product.setPriceDropDate(product.getPriceDropDate() != null ?
                        product.getPriceDropDate() : LocalDateTime.now());
            }
        }

        return toDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Product not found"));

        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getPrice() != null) p.setPrice(dto.getPrice());
        if (dto.getOriginalPrice() != null) p.setOriginalPrice(dto.getOriginalPrice());
        if (dto.getPriceDropExpiry() != null) p.setPriceDropExpiry(dto.getPriceDropExpiry());
        if (dto.getImageUrl() != null) p.setImageUrl(dto.getImageUrl());
        if (dto.getImages() != null) p.setImages(dto.getImages());
        if (dto.getCategory() != null) p.setCategory(dto.getCategory());
        if (dto.getBrand() != null) p.setBrand(dto.getBrand());
        p.setStock(dto.getStock());
        p.setRating(dto.getRating());
        p.setReviewCount(dto.getReviewCount());
        if (dto.getTags() != null) p.setTags(dto.getTags());
        p.setFeatured(dto.isFeatured());
        if (dto.isActive() != p.isActive()) p.setActive(dto.isActive());

        p.touch();
        return toDto(productRepository.save(p));
    }

    public void deleteProduct(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Product not found"));
        p.setActive(false);
        p.touch();
        productRepository.save(p);
        log.info("Product soft-deleted: {}", id);
    }

    public ProductDto toDto(Product p) {
        p.computePriceDropStatus();

        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .priceDropDate(p.getPriceDropDate())
                .priceDropExpiry(p.getPriceDropExpiry())
                .isPriceDropped(p.getIsPriceDropped())
                .discountPercent(p.getDiscountPercent())
                .savingsAmount(p.getSavingsAmount())
                .imageUrl(p.getImageUrl())
                .images(p.getImages())
                .category(p.getCategory())
                .brand(p.getBrand())
                .stock(p.getStock())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .tags(p.getTags())
                .featured(p.isFeatured())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}