package com.aishop.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount; // Positive = credit, Negative = debit

    @Column(nullable = false)
    private String type; // "DEPOSIT", "WITHDRAWAL", "ORDER_PAYMENT", "REFUND"

    private String description;
    private String referenceId; // Order ID, Transaction ID, etc.

    @Column(nullable = false)
    private String status; // "PENDING", "COMPLETED", "FAILED"

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}