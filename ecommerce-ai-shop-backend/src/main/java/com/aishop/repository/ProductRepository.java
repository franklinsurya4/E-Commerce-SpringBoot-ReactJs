package com.aishop.repository;

import com.aishop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    List<Product> findByFeaturedTrueAndActiveTrue();
    List<Product> findByCategoryAndActiveTrue(String category);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Product> search(@Param("q") String query);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.active = true")
    List<String> findAllCategories();

    // 🔥 NEW: Price Drop Queries

    /**
     * Find all products with active price drops (price < originalPrice and not expired)
     */
    @Query("SELECT p FROM Product p WHERE p.active = true " +
            "AND p.originalPrice IS NOT NULL " +
            "AND p.price < p.originalPrice " +
            "AND (p.priceDropExpiry IS NULL OR p.priceDropExpiry > :now)")
    List<Product> findActivePriceDrops(@Param("now") LocalDateTime now);

    /**
     * Find price drops by category
     */
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category = :category " +
            "AND p.originalPrice IS NOT NULL AND p.price < p.originalPrice " +
            "AND (p.priceDropExpiry IS NULL OR p.priceDropExpiry > :now)")
    List<Product> findPriceDropsByCategory(@Param("category") String category, @Param("now") LocalDateTime now);

    /**
     * Find price drops sorted by discount percentage (biggest first)
     */
    @Query("SELECT p FROM Product p WHERE p.active = true " +
            "AND p.originalPrice IS NOT NULL AND p.price < p.originalPrice " +
            "AND (p.priceDropExpiry IS NULL OR p.priceDropExpiry > :now) " +
            "ORDER BY (p.originalPrice - p.price) / p.originalPrice DESC")
    List<Product> findPriceDropsSortedByDiscount(@Param("now") LocalDateTime now);

    /**
     * Find expiring price drops (within next N hours)
     */
    @Query("SELECT p FROM Product p WHERE p.active = true " +
            "AND p.originalPrice IS NOT NULL AND p.price < p.originalPrice " +
            "AND p.priceDropExpiry IS NOT NULL " +
            "AND p.priceDropExpiry BETWEEN :now AND :until")
    List<Product> findExpiringPriceDrops(@Param("now") LocalDateTime now, @Param("until") LocalDateTime until);
}