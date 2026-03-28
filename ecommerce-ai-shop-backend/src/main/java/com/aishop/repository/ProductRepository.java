package com.aishop.repository;

import com.aishop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}