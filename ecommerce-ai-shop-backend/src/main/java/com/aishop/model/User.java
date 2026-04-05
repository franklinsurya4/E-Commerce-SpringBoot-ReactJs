package com.aishop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    @Email @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @NotBlank
    @Column(nullable = false)
    private String password;

    private String phone;
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    // ══════════════════════════════════════════════
    //  🔹 WALLET BALANCE FIELD
    // ══════════════════════════════════════════════
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WalletTransaction> walletTransactions = new ArrayList<>();

    @Builder.Default
    private boolean emailNotifications = true;

    @Builder.Default
    private boolean pushNotifications = true;

    @Builder.Default
    private String theme = "system";

    @Builder.Default
    private String language = "en";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ══════════════════════════════════════════════
    //  🔹 WALLET HELPER METHODS (NULL-SAFE)
    // ══════════════════════════════════════════════

    /**
     * Returns the wallet balance, never null.
     * Handles existing DB rows where wallet_balance column is NULL.
     */
    public BigDecimal getWalletBalance() {
        if (this.walletBalance == null) {
            this.walletBalance = BigDecimal.ZERO;
        }
        return this.walletBalance;
    }

    /**
     * Add funds to wallet balance (null-safe)
     */
    public void addFunds(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (this.walletBalance == null) {
            this.walletBalance = BigDecimal.ZERO;
        }
        this.walletBalance = this.walletBalance.add(amount);
    }

    /**
     * Deduct funds from wallet balance (null-safe)
     */
    public void deductFunds(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (this.walletBalance == null) {
            this.walletBalance = BigDecimal.ZERO;
        }
        if (this.walletBalance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient wallet balance");
        }
        this.walletBalance = this.walletBalance.subtract(amount);
    }

    public enum Role {
        CUSTOMER, ADMIN
    }
}