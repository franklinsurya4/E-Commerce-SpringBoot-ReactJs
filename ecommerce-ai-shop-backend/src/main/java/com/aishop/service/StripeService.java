package com.aishop.service;

import com.aishop.config.StripeConfig;
import com.aishop.model.Order;
import com.aishop.model.OrderItem;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final StripeConfig stripeConfig;

    /**
     * Creates a Stripe Checkout Session for the given order.
     * Returns the checkout URL that the frontend should redirect to.
     */
    public String createCheckoutSession(Order order) throws Exception {
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(stripeConfig.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(stripeConfig.getCancelUrl())
                .setCustomerEmail(order.getUser().getEmail())
                .putMetadata("orderId", order.getId().toString())
                .putMetadata("orderNumber", order.getOrderNumber());

        // Add each order item as a line item
        for (OrderItem item : order.getItems()) {
            long unitAmountInCents = item.getPrice()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            SessionCreateParams.LineItem.PriceData.ProductData productData =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(item.getProductName())
                            .build();

            // Add product image if available
            if (item.getProductImage() != null && !item.getProductImage().isEmpty()) {
                productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName(item.getProductName())
                        .addImage(item.getProductImage())
                        .build();
            }

            builder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity((long) item.getQuantity())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount(unitAmountInCents)
                                            .setProductData(productData)
                                            .build()
                            )
                            .build()
            );
        }

        // Add tax as a separate line item
        if (order.getTax() != null && order.getTax().compareTo(BigDecimal.ZERO) > 0) {
            builder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount(order.getTax()
                                                    .multiply(BigDecimal.valueOf(100))
                                                    .longValue())
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Tax")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // Add shipping cost if applicable
        if (order.getShippingCost() != null && order.getShippingCost().compareTo(BigDecimal.ZERO) > 0) {
            builder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount(order.getShippingCost()
                                                    .multiply(BigDecimal.valueOf(100))
                                                    .longValue())
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Shipping")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        Session session = Session.create(builder.build());
        log.info("Stripe Checkout Session created: {} for order: {}", session.getId(), order.getOrderNumber());
        return session.getUrl();
    }
}