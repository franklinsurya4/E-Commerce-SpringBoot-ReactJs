package com.aishop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushSubscriptionRequest {

    private String endpoint;
    private PushKeys keys;
    private String userAgent;
    private String ipAddress;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushKeys {
        private String p256dh;
        private String auth;
    }
}