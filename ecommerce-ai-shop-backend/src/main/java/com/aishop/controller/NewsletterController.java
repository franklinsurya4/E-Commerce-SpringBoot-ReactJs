package com.aishop.controller;

import com.aishop.dto.SubscribeRequest;
import com.aishop.service.NewsletterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "http://localhost:3000") // Allow React Frontend
public class NewsletterController {

    private final NewsletterService service;

    public NewsletterController(NewsletterService service) {
        this.service = service;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@Validated @RequestBody SubscribeRequest request) {
        try {
            service.subscribe(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Successfully subscribed!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "An error occurred. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
