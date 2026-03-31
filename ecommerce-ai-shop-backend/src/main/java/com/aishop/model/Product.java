package com.aishop.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Positive
    private BigDecimal price;

    // 🔥 Price Drop Fields - with explicit column mapping
    @Column(name = "original_price")
    private BigDecimal originalPrice;

    @Column(name = "price_drop_date")
    private LocalDateTime priceDropDate;

    @Column(name = "price_drop_expiry")
    private LocalDateTime priceDropExpiry;

    @Transient
    private Boolean isPriceDropped;

    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String category;
    private String brand;

    @Builder.Default
    private int stock = 0;

    @Builder.Default
    private double rating = 0.0;

    @Builder.Default
    private int reviewCount = 0;

    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private boolean featured = false;

    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 🔥 Computed: Is this product currently on a price drop?
    @PostLoad
    public void computePriceDropStatus() {
        if (originalPrice == null || price == null) {
            this.isPriceDropped = false;
            return;
        }
        if (priceDropExpiry != null && LocalDateTime.now().isAfter(priceDropExpiry)) {
            this.isPriceDropped = false;
            return;
        }
        this.isPriceDropped = price.compareTo(originalPrice) < 0;
    }

    @Transient
    public Integer getDiscountPercent() {
        if (originalPrice == null || price == null || originalPrice.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }
        return originalPrice.subtract(price)
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 0, BigDecimal.ROUND_HALF_UP)
                .intValue();
    }

    @Transient
    public BigDecimal getSavingsAmount() {
        if (originalPrice == null || price == null) {
            return BigDecimal.ZERO;
        }
        return originalPrice.subtract(price).max(BigDecimal.ZERO);
    }

    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}