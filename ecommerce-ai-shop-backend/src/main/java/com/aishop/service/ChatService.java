package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.model.Product;
import com.aishop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ProductRepository productRepository;
    private final ProductService productService;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final String SYSTEM_PROMPT = """
        You are ShopAI, the intelligent shopping assistant for AI Shop — a premium e-commerce platform.

        YOUR CAPABILITIES:
        - Help users find products by category, brand, price range, or use case
        - Provide detailed product comparisons and recommendations
        - Answer questions about orders, shipping, returns, and policies
        - Assist with sizing, color choices, and product specifications
        - Offer styling advice and product pairing suggestions

        STORE POLICIES:
        - Free shipping on orders over $50
        - 30-day return policy for unused items
        - 8% sales tax
        - Payment methods: Credit Card, PayPal, UPI, Cash on Delivery
        - Estimated delivery: 3-7 business days

        RESPONSE STYLE:
        - Be friendly, helpful, and concise
        - Use product names and details when recommending
        - If unsure, be honest and suggest browsing the catalog
        - Format responses with line breaks for readability
        - Include product IDs when suggesting specific products so users can find them
        - Keep responses under 200 words unless detailed comparison is needed
        """;

    public ChatResponse chat(ChatRequest request) {
        try {
            if (geminiApiKey == null || geminiApiKey.isBlank()) {
                return ChatResponse.builder()
                        .reply("AI assistant is not configured yet. Please add a Gemini API key.")
                        .suggestedProducts(Collections.emptyList())
                        .build();
            }

            String productCatalog = getProductCatalog();
            List<Map<String, Object>> contents = new ArrayList<>();
            String systemContext = SYSTEM_PROMPT + "\n\nAVAILABLE PRODUCTS:\n" + productCatalog;

            if (request.getHistory() != null) {
                for (ChatMessage msg : request.getHistory()) {
                    Map<String, Object> content = new HashMap<>();
                    content.put("role", "user".equals(msg.getRole()) ? "user" : "model");
                    content.put("parts", List.of(Map.of("text", msg.getContent())));
                    contents.add(content);
                }
            }

            String userMessage = request.getMessage();
            if (contents.isEmpty()) {
                userMessage = systemContext + "\n\nUser question: " + request.getMessage();
            }

            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(Map.of("text", userMessage)));
            contents.add(userContent);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            requestBody.put("generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 1024
            ));

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = GEMINI_URL + "?key=" + geminiApiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Gemini API: {}", GEMINI_URL);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() == null) {
                return ChatResponse.builder()
                        .reply("No response from AI. Please try again!")
                        .suggestedProducts(Collections.emptyList())
                        .build();
            }

            String reply = extractGeminiResponse(response.getBody());
            List<ProductDto> suggested = findMentionedProducts(request.getMessage(), reply);

            return ChatResponse.builder().reply(reply).suggestedProducts(suggested).build();

        } catch (Exception e) {
            log.error("Chat error: {}", e.getMessage());

            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("404")) {
                log.error("Gemini model not found. Trying fallback...");
                return tryFallbackModel(request);
            }

            return ChatResponse.builder()
                    .reply("I'm having trouble connecting right now. Please try again in a moment, or browse our products directly!")
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }
    }

    private ChatResponse tryFallbackModel(ChatRequest request) {
        String[] fallbackUrls = {
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent"
        };

        for (String fallbackUrl : fallbackUrls) {
            try {
                log.debug("Trying fallback Gemini URL: {}", fallbackUrl);

                String userMessage = SYSTEM_PROMPT + "\n\nUser question: " + request.getMessage();

                Map<String, Object> userContent = new HashMap<>();
                userContent.put("role", "user");
                userContent.put("parts", List.of(Map.of("text", userMessage)));

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", List.of(userContent));
                requestBody.put("generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 1024
                ));

                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String url = fallbackUrl + "?key=" + geminiApiKey;
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                String reply = extractGeminiResponse(response.getBody());

                log.info("Fallback model worked: {}", fallbackUrl);
                List<ProductDto> suggested = findMentionedProducts(request.getMessage(), reply);
                return ChatResponse.builder().reply(reply).suggestedProducts(suggested).build();

            } catch (Exception ex) {
                log.debug("Fallback failed for {}: {}", fallbackUrl, ex.getMessage());
            }
        }

        return ChatResponse.builder()
                .reply("I'm having trouble connecting right now. Please try again in a moment, or browse our products directly!")
                .suggestedProducts(Collections.emptyList())
                .build();
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiResponse(Map body) {
        try {
            List<Map> candidates = (List<Map>) body.get("candidates");
            Map candidate = candidates.get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return "Sorry, I couldn't process that. Please try again!";
        }
    }

    private String getProductCatalog() {
        List<Product> products = productRepository.findByActiveTrue();
        StringBuilder sb = new StringBuilder();
        for (Product p : products) {
            sb.append("ID:%d | %s | $%.2f | Category:%s | Brand:%s | Stock:%d | Rating:%.1f\n"
                    .formatted(p.getId(), p.getName(), p.getPrice(), p.getCategory(), p.getBrand(), p.getStock(), p.getRating()));
        }
        return sb.toString();
    }

    private List<ProductDto> findMentionedProducts(String userMsg, String reply) {
        String combined = (userMsg + " " + reply).toLowerCase();
        List<Product> all = productRepository.findByActiveTrue();
        return all.stream()
                .filter(p -> combined.contains(p.getName().toLowerCase()) ||
                        combined.contains(p.getCategory().toLowerCase()) ||
                        combined.contains(p.getBrand().toLowerCase()))
                .limit(4)
                .map(productService::toDto)
                .collect(Collectors.toList());
    }
}