package com.aishop.repository;

import com.aishop.model.User;
import com.aishop.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface walletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // Find all transactions by user, newest first
    List<WalletTransaction> findByUserOrderByCreatedAtDesc(User user);

    // Find transactions by user and type
    List<WalletTransaction> findByUserAndType(User user, String type);

    // Find transactions by user and status
    List<WalletTransaction> findByUserAndStatus(User user, String status);
}