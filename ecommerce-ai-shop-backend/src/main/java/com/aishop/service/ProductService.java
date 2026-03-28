package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.Product;
import com.aishop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> getAllProducts() {
        return productRepository.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto getProduct(Long id) {
        return toDto(productRepository.findById(id).orElseThrow(() -> new AppException("Product not found")));
    }

    public List<ProductDto> getByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> search(String query) {
        return productRepository.search(query).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return productRepository.findAllCategories();
    }

    public ProductDto createProduct(ProductDto dto) {
        Product product = Product.builder()
                .name(dto.getName()).description(dto.getDescription())
                .price(dto.getPrice()).originalPrice(dto.getOriginalPrice())
                .imageUrl(dto.getImageUrl()).images(dto.getImages())
                .category(dto.getCategory()).brand(dto.getBrand())
                .stock(dto.getStock()).tags(dto.getTags())
                .featured(dto.isFeatured()).build();
        return toDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product p = productRepository.findById(id).orElseThrow(() -> new AppException("Product not found"));
        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getPrice() != null) p.setPrice(dto.getPrice());
        if (dto.getOriginalPrice() != null) p.setOriginalPrice(dto.getOriginalPrice());
        if (dto.getImageUrl() != null) p.setImageUrl(dto.getImageUrl());
        if (dto.getCategory() != null) p.setCategory(dto.getCategory());
        if (dto.getBrand() != null) p.setBrand(dto.getBrand());
        p.setStock(dto.getStock());
        p.setFeatured(dto.isFeatured());
        return toDto(productRepository.save(p));
    }

    public void deleteProduct(Long id) {
        Product p = productRepository.findById(id).orElseThrow(() -> new AppException("Product not found"));
        p.setActive(false);
        productRepository.save(p);
    }

    public ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .price(p.getPrice()).originalPrice(p.getOriginalPrice())
                .imageUrl(p.getImageUrl()).images(p.getImages())
                .category(p.getCategory()).brand(p.getBrand())
                .stock(p.getStock()).rating(p.getRating())
                .reviewCount(p.getReviewCount()).tags(p.getTags())
                .featured(p.isFeatured()).build();
    }
}
