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

    @Value("${app.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${app.ollama.model:phi3}")
    private String ollamaModel;

    @Value("${app.ollama.timeout:30000}")
    private int ollamaTimeout;

    private static final String OLLAMA_CHAT_ENDPOINT = "/api/chat";

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
            String productCatalog = getProductCatalog();

            // Build messages array for Ollama
            List<Map<String, String>> messages = new ArrayList<>();

            // Add system prompt with product catalog
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT + "\n\nAVAILABLE PRODUCTS:\n" + productCatalog));

            // Add conversation history
            if (request.getHistory() != null) {
                for (ChatMessage msg : request.getHistory()) {
                    messages.add(Map.of(
                            "role", "user".equals(msg.getRole()) ? "user" : "assistant",
                            "content", msg.getContent()
                    ));
                }
            }

            // Add current user message
            messages.add(Map.of("role", "user", "content", request.getMessage()));

            // Build Ollama request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("messages", messages);
            requestBody.put("stream", false);
            requestBody.put("options", Map.of(
                    "temperature", 0.7,
                    "num_predict", 1024
            ));

            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getInterceptors().add((req, body, execution) -> {
                HttpHeaders headers = req.getHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setAccept(List.of(MediaType.APPLICATION_JSON));
                return execution.execute(req, body);
            });

            String url = ollamaBaseUrl + OLLAMA_CHAT_ENDPOINT;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

            log.debug("Calling Ollama API: {} with model: {}", url, ollamaModel);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() == null || !response.getStatusCode().is2xxSuccessful()) {
                log.error("Ollama API error: {}", response.getStatusCode());
                return ChatResponse.builder()
                        .reply("I'm having trouble connecting to the AI assistant. Please try again!")
                        .suggestedProducts(Collections.emptyList())
                        .build();
            }

            String reply = extractOllamaResponse(response.getBody());
            List<ProductDto> suggested = findMentionedProducts(request.getMessage(), reply);

            return ChatResponse.builder()
                    .reply(reply)
                    .suggestedProducts(suggested)
                    .build();

        } catch (Exception e) {
            log.error("Chat error: {}", e.getMessage(), e);
            return ChatResponse.builder()
                    .reply("I'm having trouble connecting right now. Please try again in a moment, or browse our products directly!")
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }
    }

    @SuppressWarnings("unchecked")
    private String extractOllamaResponse(Map body) {
        try {
            // Ollama /api/chat response format
            Map message = (Map) body.get("message");
            if (message != null) {
                return (String) message.get("content");
            }
            // Fallback for /api/generate format
            return (String) body.get("response");
        } catch (Exception e) {
            log.error("Failed to parse Ollama response: {}", e.getMessage());
            return "Sorry, I couldn't process that. Please try again!";
        }
    }

    private String getProductCatalog() {
        List<Product> products = productRepository.findByActiveTrue();
        if (products.isEmpty()) {
            return "No products currently available.";
        }

        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (Product p : products) {
            if (count >= 50) break; // Limit context size for Phi3
            sb.append("ID:%d | %s | $%.2f | Category:%s | Brand:%s | Stock:%d | Rating:%.1f\n"
                    .formatted(p.getId(), p.getName(), p.getPrice(),
                            p.getCategory(), p.getBrand(), p.getStock(), p.getRating()));
            count++;
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