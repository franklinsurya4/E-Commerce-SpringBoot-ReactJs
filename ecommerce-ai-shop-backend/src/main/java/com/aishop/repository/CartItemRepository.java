package com.aishop.repository;

import com.aishop.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserId(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);

    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);
}
