package com.aishop.service;

import lombok.Builder;
import lombok.Value;
import java.time.LocalDateTime;

@Value
@Builder
public class PushPayload {
    String title;
    String body;
    String icon;
    String badge;
    String tag;
    String clickUrl;
    String type;
    Long orderId;
    LocalDateTime timestamp;

    public LocalDateTime getTimestamp() {
        return timestamp != null ? timestamp : LocalDateTime.now();
    }
}