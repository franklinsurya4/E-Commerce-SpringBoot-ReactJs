package com.aishop.service;

import com.aishop.exception.AppException;
import com.aishop.model.User;
import com.aishop.model.WalletTransaction;
import com.aishop.repository.UserRepository;
import com.aishop.repository.walletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final UserRepository userRepository;
    private final walletTransactionRepository walletTransactionRepository;

    // ─── Get Balance ───
    @Transactional(readOnly = true)
    public BigDecimal getBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));
        return user.getWalletBalance();
    }

    // ─── Add Funds ───
    @Transactional
    public Map<String, Object> addFunds(Long userId, BigDecimal amount, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        user.addFunds(amount);
        userRepository.save(user);

        WalletTransaction tx = WalletTransaction.builder()
                .user(user)
                .type("DEPOSIT")
                .amount(amount)
                .description("Added $" + amount.toPlainString() + " via " + (paymentMethod != null ? paymentMethod : "CARD"))
                .referenceId("DEP-" + System.currentTimeMillis())
                .status("COMPLETED")
                .build();
        walletTransactionRepository.save(tx);

        log.info("💰 Wallet funded: userId={}, amount={}, newBalance={}", userId, amount, user.getWalletBalance());

        Map<String, Object> result = new HashMap<>();
        result.put("balance", user.getWalletBalance());
        result.put("transactionId", tx.getId());
        result.put("amount", amount);
        return result;
    }

    // ─── Withdraw Funds ───
    @Transactional
    public Map<String, Object> withdraw(Long userId, BigDecimal amount, String account) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        BigDecimal currentBalance = user.getWalletBalance();

        if (currentBalance.compareTo(amount) < 0) {
            throw new AppException("Insufficient balance. Current: $" + currentBalance.toPlainString());
        }

        if (amount.compareTo(new BigDecimal("50")) < 0) {
            throw new AppException("Minimum withdrawal amount is $50");
        }

        // Deduct from wallet
        user.deductFunds(amount);
        userRepository.save(user);

        // Record transaction
        WalletTransaction tx = WalletTransaction.builder()
                .user(user)
                .type("WITHDRAWAL")
                .amount(amount.negate())
                .description("Withdrawn $" + amount.toPlainString() + " to " + account)
                .referenceId("WDR-" + System.currentTimeMillis())
                .status("COMPLETED")
                .build();
        walletTransactionRepository.save(tx);

        log.info("💸 Wallet withdrawal: userId={}, amount={}, account={}, newBalance={}",
                userId, amount, account, user.getWalletBalance());

        Map<String, Object> result = new HashMap<>();
        result.put("balance", user.getWalletBalance());
        result.put("transactionId", tx.getId());
        result.put("amount", amount);
        result.put("account", account);
        return result;
    }

    // ─── Deduct Funds (wallet payment) ───
    @Transactional
    public Map<String, Object> deduct(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        user.deductFunds(amount);
        userRepository.save(user);

        WalletTransaction tx = WalletTransaction.builder()
                .user(user)
                .type("ORDER_PAYMENT")
                .amount(amount.negate())
                .description("Wallet payment of $" + amount.toPlainString())
                .referenceId("PAY-" + System.currentTimeMillis())
                .status("COMPLETED")
                .build();
        walletTransactionRepository.save(tx);

        log.info("💸 Wallet deducted: userId={}, amount={}, newBalance={}", userId, amount, user.getWalletBalance());

        Map<String, Object> result = new HashMap<>();
        result.put("balance", user.getWalletBalance());
        result.put("transactionId", tx.getId());
        result.put("amount", amount);
        return result;
    }

    // ─── Get Transaction History ───
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTransactions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        List<WalletTransaction> transactions = walletTransactionRepository
                .findByUserOrderByCreatedAtDesc(user);

        return transactions.stream().map(tx -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", tx.getId());
            map.put("type", mapType(tx.getType()));
            map.put("amount", tx.getAmount());
            map.put("description", tx.getDescription());
            map.put("referenceId", tx.getReferenceId());
            map.put("status", tx.getStatus() != null ? tx.getStatus().toLowerCase() : "completed");
            map.put("date", tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null);
            map.put("paymentMethod", resolvePaymentMethod(tx));
            return map;
        }).collect(Collectors.toList());
    }

    // ─── Helpers ───

    private String mapType(String backendType) {
        if (backendType == null) return "deposit";
        return switch (backendType.toUpperCase()) {
            case "DEPOSIT" -> "deposit";
            case "ORDER_PAYMENT" -> "purchase";
            case "WITHDRAWAL" -> "withdraw";
            case "REFUND" -> "refund";
            default -> "deposit";
        };
    }

    private String resolvePaymentMethod(WalletTransaction tx) {
        if (tx.getType() == null) return "Wallet";
        return switch (tx.getType().toUpperCase()) {
            case "DEPOSIT" -> "Card";
            case "ORDER_PAYMENT" -> "Wallet";
            case "WITHDRAWAL" -> "Bank Transfer";
            case "REFUND" -> "Refund";
            default -> "Wallet";
        };
    }
}