package com.aishop.service;

import com.aishop.dto.SubscribeRequest;
import com.aishop.model.NewsletterSubscriber;
import com.aishop.repository.NewsletterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NewsletterService {

    private final NewsletterRepository repository;

    public NewsletterService(NewsletterRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public NewsletterSubscriber subscribe(SubscribeRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already subscribed");
        }

        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setEmail(request.getEmail());
        return repository.save(subscriber);
    }
}
