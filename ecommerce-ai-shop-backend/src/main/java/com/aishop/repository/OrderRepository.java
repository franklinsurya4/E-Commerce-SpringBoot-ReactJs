package com.aishop.repository;

import com.aishop.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    Optional<Order> findByTrackingNumber(String trackingNumber);
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, Order.OrderStatus status);
}