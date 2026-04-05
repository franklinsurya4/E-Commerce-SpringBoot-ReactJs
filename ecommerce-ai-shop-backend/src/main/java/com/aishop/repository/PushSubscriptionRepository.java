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

    // ══════════════════════════════════════════════
    //  🔹 FIND METHODS
    // ══════════════════════════════════════════════

    /**
     * ✅ Returns List — Controller expects multiple active subscriptions per user
     * (user may have phone + desktop + tablet)
     */
    @Query("SELECT s FROM PushSubscription s WHERE s.user.id = :userId AND s.active = true")
    List<PushSubscription> findByUserIdAndActiveTrue(@Param("userId") Long userId);

    /**
     * Find specific subscription by user + endpoint (for duplicate check)
     */
    Optional<PushSubscription> findByUserIdAndEndpoint(Long userId, String endpoint);

    /**
     * Find by endpoint only (for cleanup)
     */
    Optional<PushSubscription> findByEndpointAndActiveTrue(String endpoint);

    // ══════════════════════════════════════════════
    //  🔹 DELETE METHODS
    // ══════════════════════════════════════════════

    void deleteByUserId(Long userId);
    void deleteByUserIdAndEndpoint(Long userId, String endpoint);
    void deleteByEndpoint(String endpoint);
}