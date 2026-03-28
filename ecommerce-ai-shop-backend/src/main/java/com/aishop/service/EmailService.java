package com.aishop.service;

import com.aishop.model.Order;
import com.aishop.model.OrderItem;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to AI Shop! 🎉";
        String body = buildWelcomeHtml(name);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendOrderConfirmation(String to, String name, Order order) {
        String subject = "Order Confirmed - " + order.getOrderNumber();
        String body = buildOrderConfirmationHtml(name, order);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendOrderStatusUpdate(String to, String name, Order order) {
        String subject = "Order Update - " + order.getOrderNumber() + " is " + order.getStatus();
        String body = buildStatusUpdateHtml(name, order);
        sendHtmlEmail(to, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildWelcomeHtml(String name) {
        return """
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fafafa;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:28px">Welcome to AI Shop</h1>
                <p style="color:#94a3b8;margin:8px 0 0">Your smart shopping companion</p>
              </div>
              <div style="padding:32px">
                <p style="font-size:16px;color:#334155">Hi %s,</p>
                <p style="color:#475569;line-height:1.6">Welcome aboard! We're excited to have you. Browse our collection and let our AI assistant help you find exactly what you need.</p>
                <div style="text-align:center;margin:24px 0">
                  <a href="%s" style="background:#3b82f6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Start Shopping</a>
                </div>
              </div>
              <div style="background:#f1f5f9;padding:16px;text-align:center;color:#94a3b8;font-size:12px">
                AI Shop &mdash; Smart Shopping, Powered by AI
              </div>
            </div>
            """.formatted(name, frontendUrl);
    }

    private String buildOrderConfirmationHtml(String name, Order order) {
        NumberFormat fmt = NumberFormat.getCurrencyInstance(Locale.US);
        StringBuilder items = new StringBuilder();
        for (OrderItem oi : order.getItems()) {
            items.append("""
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0">%s</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">%d</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">%s</td>
                </tr>
                """.formatted(oi.getProductName(), oi.getQuantity(), fmt.format(oi.getLineTotal())));
        }

        return """
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fafafa;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px;text-align:center">
                <h1 style="color:#fff;margin:0">Order Confirmed ✓</h1>
                <p style="color:#22c55e;margin:8px 0 0;font-size:18px">%s</p>
              </div>
              <div style="padding:32px">
                <p style="color:#334155">Hi %s,</p>
                <p style="color:#475569">Thank you for your order! Here's a summary:</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                  <thead><tr style="background:#f1f5f9"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
                  <tbody>%s</tbody>
                </table>
                <div style="border-top:2px solid #e2e8f0;padding-top:12px;text-align:right">
                  <p style="margin:4px 0;color:#64748b">Subtotal: %s</p>
                  <p style="margin:4px 0;color:#64748b">Tax: %s</p>
                  <p style="margin:4px 0;color:#64748b">Shipping: %s</p>
                  <p style="margin:4px 0;font-size:18px;font-weight:700;color:#0f172a">Total: %s</p>
                </div>
                <div style="text-align:center;margin:24px 0">
                  <a href="%s/orders/%d" style="background:#3b82f6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Track Order</a>
                </div>
                <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-top:16px">
                  <p style="margin:0;font-weight:600;color:#334155">Tracking: %s</p>
                  <p style="margin:4px 0 0;color:#64748b">Estimated delivery: %s</p>
                </div>
              </div>
            </div>
            """.formatted(
                order.getOrderNumber(), name, items,
                fmt.format(order.getSubtotal()), fmt.format(order.getTax()),
                fmt.format(order.getShippingCost()), fmt.format(order.getTotal()),
                frontendUrl, order.getId(), order.getTrackingNumber(),
                order.getEstimatedDelivery().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
        );
    }

    private String buildStatusUpdateHtml(String name, Order order) {
        String statusColor = switch (order.getStatus()) {
            case SHIPPED -> "#3b82f6";
            case OUT_FOR_DELIVERY -> "#f59e0b";
            case DELIVERED -> "#22c55e";
            case CANCELLED -> "#ef4444";
            default -> "#64748b";
        };
        return """
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fafafa;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px;text-align:center">
                <h1 style="color:#fff;margin:0">Order Update</h1>
                <p style="color:%s;margin:8px 0 0;font-size:18px;font-weight:600">%s</p>
              </div>
              <div style="padding:32px">
                <p style="color:#334155">Hi %s,</p>
                <p style="color:#475569">Your order <strong>%s</strong> status has been updated to <strong style="color:%s">%s</strong>.</p>
                <div style="text-align:center;margin:24px 0">
                  <a href="%s/orders/%d" style="background:#3b82f6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">View Order</a>
                </div>
              </div>
            </div>
            """.formatted(statusColor, order.getStatus(), name, order.getOrderNumber(), statusColor, order.getStatus(), frontendUrl, order.getId());
    }
}
