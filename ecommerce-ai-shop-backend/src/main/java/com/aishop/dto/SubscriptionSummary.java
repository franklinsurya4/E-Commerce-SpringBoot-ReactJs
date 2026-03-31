package com.aishop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Lightweight DTO for displaying push subscription info in UI.
 * ⚠️ NEVER expose p256dh/auth keys or full endpoint to frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionSummary {

    private Long id;

    /**
     * Masked endpoint for identification (e.g., "https://fcm.googleapis.com/...xyz")
     */
    private String endpointMasked;

    /**
     * Human-readable device/browser info
     * e.g., "Chrome 120 on Windows" or "Safari on iPhone"
     */
    private String deviceInfo;

    /**
     * Original user agent string (optional, for admin/debug)
     */
    private String userAgent;

    /**
     * When this subscription was first registered
     */
    private LocalDateTime createdAt;

    /**
     * Last time this subscription received a notification
     */
    private LocalDateTime lastUsedAt;

    /**
     * Is this subscription currently active?
     */
    private boolean active;

    /**
     * Optional: platform hint for UI icons
     * Values: "chrome", "firefox", "safari", "edge", "unknown"
     */
    private String platform;
}