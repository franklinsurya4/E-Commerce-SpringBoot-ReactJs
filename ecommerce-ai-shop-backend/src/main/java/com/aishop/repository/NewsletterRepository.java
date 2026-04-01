package com.aishop.repository;

import com.aishop.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NewsletterRepository extends JpaRepository<NewsletterSubscriber, Long> {
    Optional<NewsletterSubscriber> findByEmail(String email);
    boolean existsByEmail(String email);
}