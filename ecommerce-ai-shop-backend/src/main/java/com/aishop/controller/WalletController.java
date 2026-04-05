package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.service.WalletService;
import com.aishop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;

    private Long getUserId(Authentication auth) {
        return userService.getUserByEmail(auth.getName()).getId();
    }

    // ─── GET /api/wallet/balance ───
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBalance(Authentication auth) {
        BigDecimal balance = walletService.getBalance(getUserId(auth));
        return ResponseEntity.ok(ApiResponse.ok(Map.of("balance", balance)));
    }

    // ─── POST /api/wallet/add-funds ───
    @PostMapping("/add-funds")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addFunds(
            Authentication auth,
            @RequestBody Map<String, Object> request) {

        BigDecimal amount;
        try {
            amount = new BigDecimal(request.get("amount").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid amount"));
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Amount must be greater than 0"));
        }
        if (amount.compareTo(new BigDecimal("50000")) > 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Maximum single deposit is $50,000"));
        }

        String paymentMethod = request.getOrDefault("paymentMethod", "CARD").toString();
        Map<String, Object> result = walletService.addFunds(getUserId(auth), amount, paymentMethod);
        return ResponseEntity.ok(ApiResponse.ok("Funds added successfully", result));
    }

    // ─── POST /api/wallet/withdraw ───
    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Map<String, Object>>> withdraw(
            Authentication auth,
            @RequestBody Map<String, Object> request) {

        BigDecimal amount;
        try {
            amount = new BigDecimal(request.get("amount").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid amount"));
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Amount must be greater than 0"));
        }
        if (amount.compareTo(new BigDecimal("50")) < 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Minimum withdrawal is $50"));
        }

        String account = request.getOrDefault("account", "").toString();
        if (account.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Account details are required"));
        }

        Map<String, Object> result = walletService.withdraw(getUserId(auth), amount, account);
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal successful", result));
    }

    // ─── POST /api/wallet/deduct ───
    @PostMapping("/deduct")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deduct(
            Authentication auth,
            @RequestBody Map<String, Object> request) {

        BigDecimal amount;
        try {
            amount = new BigDecimal(request.get("amount").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid amount"));
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid amount"));
        }

        Map<String, Object> result = walletService.deduct(getUserId(auth), amount);
        return ResponseEntity.ok(ApiResponse.ok("Funds deducted", result));
    }

    // ─── GET /api/wallet/transactions ───
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Object>> getTransactions(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(walletService.getTransactions(getUserId(auth))));
    }
}