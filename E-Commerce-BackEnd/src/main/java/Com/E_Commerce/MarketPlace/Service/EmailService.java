package Com.E_Commerce.MarketPlace.Service;

import Com.E_Commerce.MarketPlace.Model.Order;
import Com.E_Commerce.MarketPlace.Model.OrderItem;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderConfirmation(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("✅ Order Confirmed — #" + order.getId() + " | QualityProducts");
            helper.setText(buildHtml(order), true);
            mailSender.send(message);
            log.info("Confirmation email sent to {}", order.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", order.getCustomerEmail(), e.getMessage());
        }
    }

    private String buildHtml(Order order) {
        StringBuilder items = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            items.append(String.format("""
                <tr>
                  <td style="padding:10px 0; border-bottom:1px solid #2a2a3a;">
                    <div style="display:flex;align-items:center;gap:12px;">
                      <img src="%s" width="56" height="56"
                        style="border-radius:10px;object-fit:cover;background:#22222e;"
                        onerror="this.style.display='none'"/>
                      <div>
                        <div style="font-weight:600;color:#e8e8f0;font-size:14px;">%s</div>
                        <div style="color:#6b6b80;font-size:12px;margin-top:3px;">
                          Qty: %d &nbsp;×&nbsp; ₹%,.0f
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #2a2a3a;
                             text-align:right;font-weight:700;color:#fff;font-size:14px;">
                    ₹%,.0f
                  </td>
                </tr>
            """,
                    item.getImageUrl() != null ? item.getImageUrl() : "",
                    item.getProductName(),
                    item.getQuantity(),
                    item.getPrice(),
                    item.getPrice() * item.getQuantity()
            ));
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"/></head>
            <body style="margin:0;padding:0;background:#0a0a0f;
                         font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#0a0a0f;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                     style="background:#17171f;border-radius:20px;overflow:hidden;
                            border:1px solid #22222e;max-width:600px;width:100%%;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#5b4bff,#7b3fe4);
                                 padding:36px 40px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:8px;">🎉</div>
                        <h1 style="color:#fff;margin:0;font-size:24px;
                                   font-weight:800;letter-spacing:-0.02em;">
                          Order Confirmed!
                        </h1>
                        <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px;">
                          Thank you for shopping with QualityProducts
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px;">
                        <div style="background:#13131a;border:1px solid #22222e;
                                    border-radius:14px;padding:18px 20px;margin-bottom:28px;">
                          <table width="100%%">
                            <tr>
                              <td style="color:#6b6b80;font-size:13px;">Order ID</td>
                              <td style="color:#fff;font-weight:700;font-size:13px;
                                         text-align:right;">#%d</td>
                            </tr>
                            <tr>
                              <td style="color:#6b6b80;font-size:13px;padding-top:8px;">Customer</td>
                              <td style="color:#e8e8f0;font-size:13px;
                                         text-align:right;padding-top:8px;">%s</td>
                            </tr>
                            <tr>
                              <td style="color:#6b6b80;font-size:13px;padding-top:8px;">
                                Delivery To
                              </td>
                              <td style="color:#e8e8f0;font-size:13px;
                                         text-align:right;padding-top:8px;">%s</td>
                            </tr>
                          </table>
                        </div>
                        <h3 style="color:#a0a0b8;font-size:11px;text-transform:uppercase;
                                   letter-spacing:.08em;margin:0 0 14px;">
                          Order Items
                        </h3>
                        <table width="100%%" cellpadding="0" cellspacing="0"
                               style="margin-bottom:24px;">
                          %s
                        </table>
                        <div style="background:#5b4bff;border-radius:12px;
                                    padding:16px 20px;">
                          <table width="100%%">
                            <tr>
                              <td style="color:rgba(255,255,255,.8);font-size:14px;">
                                Total Amount
                              </td>
                              <td style="color:#fff;font-size:20px;font-weight:800;
                                         text-align:right;">₹%,.0f</td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px 32px;text-align:center;
                                 border-top:1px solid #22222e;">
                        <p style="color:#4a4a60;font-size:12px;margin:0;">
                          Questions? Reply to this email or visit QualityProducts.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
        """,
                order.getId(),
                order.getCustomerName(),
                order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "—",
                items.toString(),
                order.getTotalAmount()
        );
    }
}
