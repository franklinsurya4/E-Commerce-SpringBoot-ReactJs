package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.*;
import com.aishop.repository.AddressRepository;
import com.aishop.repository.PushSubscriptionRepository;
import com.aishop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    // ══════════════════════════════════════════════
    //  🔹 USER: GET & UPDATE PROFILE
    // ══════════════════════════════════════════════

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(String email) {
        User user = getUserByEmail(email);
        return mapToUserDto(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest req) {
        User user = getUserByEmail(email);
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return mapToUserDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateSettings(String email, UpdateSettingsRequest req) {
        User user = getUserByEmail(email);
        if (req.getEmailNotifications() != null) user.setEmailNotifications(req.getEmailNotifications());
        if (req.getPushNotifications() != null) user.setPushNotifications(req.getPushNotifications());
        if (req.getTheme() != null) user.setTheme(req.getTheme());
        if (req.getLanguage() != null) user.setLanguage(req.getLanguage());
        return mapToUserDto(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new AppException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // ══════════════════════════════════════════════
    //  🔹 ADDRESS MANAGEMENT
    // ══════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<AddressDto> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToAddressDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(Long userId, AddressDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        Address address = Address.builder()
                .user(user)
                .label(dto.getLabel())
                .street(dto.getStreet())
                .city(dto.getCity())
                .state(dto.getState())
                .zipCode(dto.getZipCode())
                .country(dto.getCountry())
                .isDefault(dto.isDefault())
                .build();

        if (address.isDefault()) {
            addressRepository.findByUserId(userId).forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }
        return mapToAddressDto(addressRepository.save(address));
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, AddressDto dto) {
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new AppException("Address not found"));

        if (dto.getLabel() != null) address.setLabel(dto.getLabel());
        if (dto.getStreet() != null) address.setStreet(dto.getStreet());
        if (dto.getCity() != null) address.setCity(dto.getCity());
        if (dto.getState() != null) address.setState(dto.getState());
        if (dto.getZipCode() != null) address.setZipCode(dto.getZipCode());
        if (dto.getCountry() != null) address.setCountry(dto.getCountry());

        if (dto.isDefault()) {
            addressRepository.findByUserId(userId).forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
            address.setDefault(true);
        }
        return mapToAddressDto(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new AppException("Address not found"));
        addressRepository.delete(address);
    }

    // ══════════════════════════════════════════════
    //  ✅ PUSH SUBSCRIPTION METHODS — FIXED SIGNATURES
    // ══════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PushSubscriptionDto getPushSubscription(Long userId) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository
                .findByUserIdAndActiveTrue(userId);

        return subscriptions.stream()
                .findFirst()
                .map(this::mapToPushSubscriptionDto)
                .orElse(null);
    }

    @Transactional
    public PushSubscriptionDto savePushSubscription(Long userId, PushSubscriptionRequest request) {  // ✅ FIXED: SavePushSubscriptionRequest → PushSubscriptionRequest
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        // Check for existing subscription by endpoint
        PushSubscription existing = pushSubscriptionRepository
                .findByUserIdAndEndpoint(userId, request.getEndpoint())
                .orElse(null);

        if (existing != null) {
            existing.setP256dhKey(request.getKeys().getP256dh());
            existing.setAuthKey(request.getKeys().getAuth());
            existing.setUserAgent(request.getUserAgent());
            existing.setLastUsedAt(LocalDateTime.now());
            return mapToPushSubscriptionDto(pushSubscriptionRepository.save(existing));
        }

        // Create new subscription
        PushSubscription newSub = PushSubscription.builder()
                .user(user)
                .endpoint(request.getEndpoint())
                .p256dhKey(request.getKeys().getP256dh())
                .authKey(request.getKeys().getAuth())
                .userAgent(request.getUserAgent())
                .ipAddress(request.getIpAddress())
                .active(true)
                .createdAt(LocalDateTime.now())
                .lastUsedAt(LocalDateTime.now())
                .build();

        return mapToPushSubscriptionDto(pushSubscriptionRepository.save(newSub));
    }

    @Transactional
    public void deletePushSubscription(Long userId) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository
                .findByUserIdAndActiveTrue(userId);

        subscriptions.forEach(sub -> {
            sub.setActive(false);
            sub.setLastUsedAt(LocalDateTime.now());
            pushSubscriptionRepository.save(sub);
        });
    }

    // ══════════════════════════════════════════════
    //  🔹 MAPPER METHODS
    // ══════════════════════════════════════════════

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .emailNotifications(user.isEmailNotifications())
                .pushNotifications(user.isPushNotifications())
                .theme(user.getTheme())
                .language(user.getLanguage())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AddressDto mapToAddressDto(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .label(address.getLabel())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .build();
    }

    private PushSubscriptionDto mapToPushSubscriptionDto(PushSubscription entity) {
        return PushSubscriptionDto.builder()
                .id(entity.getId())
                .endpoint(entity.getEndpoint())
                .keys(PushSubscriptionKeys.builder()  //  FIXED: PushSubscriptionKeysDto → PushSubscriptionKeys
                        .p256dh(entity.getP256dhKey())
                        .auth(entity.getAuthKey())
                        .build())
                .userAgent(entity.getUserAgent())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getLastUsedAt())
                .build();
    }
}


