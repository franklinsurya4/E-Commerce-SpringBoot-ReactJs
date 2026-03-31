// src/main/java/com/aishop/repository/PushSubscriptionRepository.java
package com.aishop.repository;

import com.aishop.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    // List<PushSubscription> findByUserIdAndActiveTrue(Long userId);

    Optional<PushSubscription> findByUserIdAndEndpoint(Long userId, String endpoint);

    void deleteByUserId(Long userId);

    void deleteByUserIdAndEndpoint(Long userId, String endpoint);

    void deleteByEndpoint(String endpoint);

    @Query("SELECT s FROM PushSubscription s WHERE s.user.id = :userId AND s.active = true")
    List<PushSubscription> findByUserIdAndActiveTrue(@Param("userId") Long userId);
}