package com.aishop.service;

import com.aishop.model.Order;
import com.aishop.model.OrderItem;
import com.aishop.model.User;
import com.aishop.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final NumberFormat fmt = NumberFormat.getCurrencyInstance(Locale.US);

    // ===================== PUBLIC METHODS =====================

    @Async
    public void sendWelcomeEmail(String to, String name) {
        // Welcome emails are ALWAYS sent (critical for account setup)
        log.info("WELCOME EMAIL TO: {}", to);
        sendHtmlEmail(to, "Welcome to AI Shop 🎉", buildWelcomeHtml(name));
    }

    @Async
    public void sendOrderConfirmation(String to, String name, Order order) {
        if (!canSendEmail(to)) {
            log.info("✉️ Email notifications DISABLED for user: {} - Order confirmation SKIPPED", to);
            return;
        }
        log.info("ORDER CONFIRMATION EMAIL TO: {}", to);
        sendHtmlEmail(
                to,
                "Order Confirmed - " + order.getOrderNumber(),
                buildOrderHtml(name, order, "Order Confirmed ✓", "#22c55e")
        );
    }

    @Async
    public void sendOrderStatusUpdate(String to, String name, Order order) {
        if (!canSendEmail(to)) {
            log.info("✉️ Email notifications DISABLED for user: {} - Status update SKIPPED", to);
            return;
        }
        log.info("ORDER STATUS EMAIL TO: {}", to);
        String color = getStatusColor(order.getStatus().name());
        sendHtmlEmail(
                to,
                "Order Update - " + order.getOrderNumber() + " is " + order.getStatus(),
                buildOrderHtml(name, order, "Status: " + order.getStatus(), color)
        );
    }

    // ===================== EMAIL PERMISSION CHECK =====================

    /**
     * Checks if the user has enabled email notifications.
     * @param email The recipient email address
     * @return true if emails can be sent, false if user disabled notifications
     */
    private boolean canSendEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        try {
            return userRepository.findByEmail(email)
                    .map(User::isEmailNotifications)  // Uses Lombok's isEmailNotifications() getter
                    .orElse(true); // Fail-safe: send if user not found (prevents losing critical emails)
        } catch (Exception e) {
            log.error("Error checking email preference for {}: {}", email, e.getMessage());
            return true; // Fail-safe: send email if database check fails
        }
    }

    // ===================== CORE EMAIL SENDER =====================

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            log.info("📤 SENDING EMAIL TO: {}", to);

            if (!isValidEmail(to)) {
                log.error("❌ INVALID EMAIL BLOCKED: {}", to);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("✅ EMAIL SUCCESS → {} | {}", to, subject);

        } catch (MessagingException e) {
            log.error("❌ EMAIL FAILED → {} | {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("❌ UNEXPECTED EMAIL ERROR → {}", e.getMessage());
        }
    }

    // ===================== VALIDATION =====================

    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email != null && Pattern.matches(regex, email);
    }

    // ===================== HTML TEMPLATES =====================

    private String buildWelcomeHtml(String name) {
        return """
            <div style="font-family:Arial;max-width:600px;margin:auto;background:#fff;border-radius:10px;padding:30px">
                <h2>Welcome to AI Shop 🚀</h2>
                <p>Hi %s,</p>
                <p>Start exploring our smart shopping experience.</p>
                <a href="%s" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Shop Now</a>
            </div>
            """.formatted(name, frontendUrl);
    }

    private String buildOrderHtml(String name, Order order, String title, String statusColor) {
        return """
            <div style="font-family:Arial;background:#f5f5f5;padding:20px">
                <div style="max-width:650px;margin:auto;background:white;border-radius:10px;padding:20px">
                    <h2>%s</h2>
                    <p style="color:%s;font-weight:bold">%s</p>
                    <p>Hi %s,</p>
                    <p>Order <b>%s</b></p>
                    %s
                    <hr/>
                    <h3>Total: %s</h3>
                    <p><b>Tracking:</b> %s</p>
                    <p><b>Estimated Delivery:</b> %s</p>
                    <div style="text-align:center;margin-top:20px">
                        <a href="%s/orders/%d"
                           style="background:#3b82f6;color:#fff;padding:12px 25px;border-radius:6px;text-decoration:none">
                           View Order
                        </a>
                    </div>
                </div>
            </div>
            """.formatted(
                title, statusColor, order.getStatus(), name, order.getOrderNumber(),
                buildItemsTable(order), fmt.format(order.getTotal()),
                safe(order.getTrackingNumber()), formatDate(order),
                frontendUrl, order.getId()
        );
    }

    private String buildItemsTable(Order order) {
        StringBuilder items = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            items.append("""
                <tr>
                    <td style="padding:10px">
                        <img src="%s" width="70" height="70" style="border-radius:8px;object-fit:cover"/>
                    </td>
                    <td>
                        <b>%s</b><br/>Qty: %d<br/>Price: %s
                    </td>
                    <td style="text-align:right;font-weight:bold">%s</td>
                </tr>
            """.formatted(
                    safeImage(item.getProductImage()), item.getProductName(),
                    item.getQuantity(), fmt.format(item.getPrice()),
                    fmt.format(item.getLineTotal())
            ));
        }
        return """
            <table width="100%%" style="border-collapse:collapse;margin-top:15px">
                <tbody>%s</tbody>
            </table>
            """.formatted(items);
    }

    // ===================== HELPERS =====================

    private String safe(String val) { return val == null ? "N/A" : val; }

    private String safeImage(String url) {
        return (url == null || url.isBlank()) ? "https://via.placeholder.com/70" : url;
    }

    private String formatDate(Order order) {
        if (order.getEstimatedDelivery() == null) return "N/A";
        return order.getEstimatedDelivery().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
    }

    private String getStatusColor(String status) {
        return switch (status) {
            case "SHIPPED" -> "#3b82f6";
            case "OUT_FOR_DELIVERY" -> "#f59e0b";
            case "DELIVERED" -> "#22c55e";
            case "CANCELLED" -> "#ef4444";
            default -> "#64748b";
        };
    }
}