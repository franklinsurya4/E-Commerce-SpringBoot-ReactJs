package com.aishop.repository;

import com.aishop.model.Order;
import com.aishop.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    // THIS is the key method — counts per user per status
    long countByUserIdAndStatus(Long userId, OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    long countByStatus(OrderStatus status);

    Optional<Order> findByTrackingNumber(String trackingNumber);
    Optional<Order> findByOrderNumber(String orderNumber);
}