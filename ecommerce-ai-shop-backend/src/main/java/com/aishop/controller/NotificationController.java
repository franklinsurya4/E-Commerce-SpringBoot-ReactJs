package com.aishop.controller;

import com.aishop.dto.Dtos.PushSubscriptionRequest;      // ✅ Updated import
import com.aishop.dto.Dtos.PushSubscriptionKeys;          // ✅ Updated import
import com.aishop.dto.Dtos.SubscriptionSummary;           // ✅ Updated import
import com.aishop.model.PushSubscription;
import com.aishop.model.User;
import com.aishop.repository.PushSubscriptionRepository;
import com.aishop.security.UserDetailsImpl;
import com.aishop.service.PushNotificationService;
import com.aishop.util.UserAgentParser;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final PushSubscriptionRepository subscriptionRepo;
    private final PushNotificationService pushService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> saveSubscription(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody PushSubscriptionRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        User user = userDetails.getUser();

        var existing = subscriptionRepo.findByUserIdAndEndpoint(user.getId(), request.getEndpoint());
        if (existing.isPresent()) {
            var sub = existing.get();
            sub.setLastUsedAt(LocalDateTime.now());
            subscriptionRepo.save(sub);
            return ResponseEntity.ok().build();
        }

        PushSubscription subscription = PushSubscription.builder()
                .user(user)
                .endpoint(request.getEndpoint())
                .p256dhKey(request.getKeys().getP256dh())
                .authKey(request.getKeys().getAuth())
                .userAgent(request.getUserAgent())
                .ipAddress(request.getIpAddress())
                .active(true)
                .createdAt(LocalDateTime.now())
                .lastUsedAt(LocalDateTime.now())
                .build();

        subscriptionRepo.save(subscription);
        log.info("✅ Push subscription saved for user {}", user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<?> deleteSubscription(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String endpoint) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        User user = userDetails.getUser();

        if (endpoint != null) {
            subscriptionRepo.deleteByUserIdAndEndpoint(user.getId(), endpoint);
        } else {
            subscriptionRepo.deleteByUserId(user.getId());
        }
        log.info("✅ Push subscription(s) removed for user {}", user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/vapid-public-key")
    public ResponseEntity<VapidPublicKeyResponse> getVapidPublicKey(
            @Value("${app.push.vapid.publicKey}") String publicKey) {
        return ResponseEntity.ok(new VapidPublicKeyResponse(publicKey));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionSummary>> getUserSubscriptions(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        User user = userDetails.getUser();

        List<PushSubscription> subscriptions = subscriptionRepo.findByUserIdAndActiveTrue(user.getId());

        List<SubscriptionSummary> summaries = subscriptions.stream()
                .map(sub -> SubscriptionSummary.builder()
                        .id(sub.getId())
                        .endpointMasked(UserAgentParser.maskEndpoint(sub.getEndpoint()))
                        .deviceInfo(UserAgentParser.parseDeviceInfo(sub.getUserAgent()))
                        .userAgent(sub.getUserAgent())
                        .createdAt(sub.getCreatedAt())
                        .lastUsedAt(sub.getLastUsedAt())
                        .active(sub.getActive())
                        .platform(UserAgentParser.parsePlatform(sub.getUserAgent()))
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(summaries);
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTestPush(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        try {
            User user = userDetails.getUser();
            boolean sent = pushService.sendTestNotification(user);

            if (sent) {
                return ResponseEntity.ok(Map.of("message", "Test notification sent"));
            } else {
                return ResponseEntity.status(503)
                        .body(Map.of("error", "No active push subscriptions found"));
            }
        } catch (Exception e) {
            log.error("Failed to send test push", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed: " + e.getMessage()));
        }
    }

    @PatchMapping("/subscriptions/{id}")
    public ResponseEntity<?> updateSubscription(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        User user = userDetails.getUser();

        Optional<PushSubscription> optionalSub = subscriptionRepo.findById(id);
        if (optionalSub.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PushSubscription subscription = optionalSub.get();
        if (!subscription.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden: Cannot modify another user's subscription");
        }

        if (updates.containsKey("active")) {
            subscription.setActive((Boolean) updates.get("active"));
        }

        subscription.setLastUsedAt(LocalDateTime.now());
        subscriptionRepo.save(subscription);

        log.info("🔄 Subscription {} updated for user {}", id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Subscription updated", "id", id));
    }

    @Data
    @RequiredArgsConstructor
    public static class VapidPublicKeyResponse {
        private final String publicKey;
    }
}