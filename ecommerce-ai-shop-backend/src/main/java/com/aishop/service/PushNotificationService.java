// src/main/java/com/aishop/service/PushNotificationService.java
package com.aishop.service;

import com.aishop.model.PushSubscription;
import com.aishop.model.User;
import com.aishop.repository.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutionException; // ✅ Added for compiler compatibility

@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private final PushSubscriptionRepository subscriptionRepo;

    @Value("${app.push.vapid.publicKey}") private String vapidPublicKey;
    @Value("${app.push.vapid.privateKey}") private String vapidPrivateKey;
    @Value("${app.push.vapid.subject}") private String vapidSubject;

    @Transactional(readOnly = true)
    public boolean sendTestNotification(User user) {
        List<PushSubscription> subs = subscriptionRepo.findByUserIdAndActiveTrue(user.getId());
        if (subs.isEmpty()) return false;

        String payload = buildPayload("🔔 Test", "Push notifications working!", "/settings", "test");
        int success = 0;

        for (PushSubscription sub : subs) {
            try {
                sendPush(sub, payload);
                success++;
            } catch (IOException | JoseException | GeneralSecurityException ex) {
                handleError(sub, ex);
            } catch (ExecutionException ex) {  // ✅ Safe catch for 5.x (unused in 3.1.1)
                handleError(sub, ex.getCause());
            } catch (InterruptedException ex) {  // ✅ Same
                Thread.currentThread().interrupt();
                handleError(sub, ex);
            }
        }
        return success > 0;
    }

    @Transactional(readOnly = true)
    public void sendNotification(User user, String title, String body, String url, String type) {
        List<PushSubscription> subs = subscriptionRepo.findByUserIdAndActiveTrue(user.getId());
        if (subs.isEmpty()) return;

        String payload = buildPayload(title, body, url, type);
        for (PushSubscription sub : subs) {
            try {
                sendPush(sub, payload);
            } catch (IOException | JoseException | GeneralSecurityException ex) {
                handleError(sub, ex);
            } catch (ExecutionException ex) {
                handleError(sub, ex.getCause());
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                handleError(sub, ex);
            }
        }
    }

    /**
     * ✅ Declares all possible exceptions - works with 3.1.1 OR 5.x
     * With 3.1.1: ExecutionException/InterruptedException are never thrown (harmless)
     * With 5.x: All exceptions are properly handled
     */
    private void sendPush(PushSubscription sub, String payload)
            throws IOException, JoseException, GeneralSecurityException,
            ExecutionException, InterruptedException {  // ✅ Added these two

        PushService pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
        Notification notification = new Notification(
                sub.getEndpoint(), sub.getP256dhKey(), sub.getAuthKey(), payload.getBytes());

        // ✅ NO .get() - works for 3.1.1 (sync) and won't break 5.x if you add it later
        pushService.send(notification);

        log.debug("Push sent to subscription {}", sub.getId());
    }

    private void handleError(PushSubscription sub, Throwable ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Unknown";
        log.error("Push failed for sub {}: {}", sub.getId(), msg);
        if (msg.contains("410") || msg.contains("404")) {
            sub.setActive(false);
            subscriptionRepo.save(sub);
        }
    }

    private String buildPayload(String title, String body, String url, String type) {
        return """
            {"title":"%s","body":"%s","icon":"/icons/icon-192x192.png","url":"%s","type":"%s","ts":"%s"}
            """.formatted(escape(title), escape(body), url != null ? escape(url) : "",
                type != null ? type : "general", LocalDateTime.now());
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}