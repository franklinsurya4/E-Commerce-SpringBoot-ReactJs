package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.*;
import com.aishop.repository.AddressRepository;
import com.aishop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found"));
    }

    public UserDto getProfile(String email) {
        return AuthService.mapToUserDto(getUserByEmail(email));
    }

    public UserDto updateProfile(String email, UpdateProfileRequest req) {
        User user = getUserByEmail(email);
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return AuthService.mapToUserDto(userRepository.save(user));
    }

    public UserDto updateSettings(String email, UpdateSettingsRequest req) {
        User user = getUserByEmail(email);
        if (req.getEmailNotifications() != null) user.setEmailNotifications(req.getEmailNotifications());
        if (req.getPushNotifications() != null) user.setPushNotifications(req.getPushNotifications());
        if (req.getTheme() != null) user.setTheme(req.getTheme());
        if (req.getLanguage() != null) user.setLanguage(req.getLanguage());
        return AuthService.mapToUserDto(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest req) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new AppException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // ========== ADDRESSES ==========
    public List<AddressDto> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream().map(this::toAddressDto).collect(Collectors.toList());
    }

    public AddressDto addAddress(Long userId, AddressDto dto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException("User not found"));
        Address address = Address.builder()
                .label(dto.getLabel()).street(dto.getStreet()).city(dto.getCity())
                .state(dto.getState()).zipCode(dto.getZipCode()).country(dto.getCountry())
                .isDefault(dto.isDefault()).user(user).build();
        if (dto.isDefault()) {
            addressRepository.findByUserId(userId).forEach(a -> { a.setDefault(false); addressRepository.save(a); });
        }
        return toAddressDto(addressRepository.save(address));
    }

    public AddressDto updateAddress(Long userId, Long addressId, AddressDto dto) {
        Address addr = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException("Address not found"));
        if (dto.getLabel() != null) addr.setLabel(dto.getLabel());
        if (dto.getStreet() != null) addr.setStreet(dto.getStreet());
        if (dto.getCity() != null) addr.setCity(dto.getCity());
        if (dto.getState() != null) addr.setState(dto.getState());
        if (dto.getZipCode() != null) addr.setZipCode(dto.getZipCode());
        if (dto.getCountry() != null) addr.setCountry(dto.getCountry());
        if (dto.isDefault()) {
            addressRepository.findByUserId(userId).forEach(a -> { a.setDefault(false); addressRepository.save(a); });
        }
        addr.setDefault(dto.isDefault());
        return toAddressDto(addressRepository.save(addr));
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address addr = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException("Address not found"));
        addressRepository.delete(addr);
    }

    private AddressDto toAddressDto(Address a) {
        return AddressDto.builder()
                .id(a.getId()).label(a.getLabel()).street(a.getStreet())
                .city(a.getCity()).state(a.getState()).zipCode(a.getZipCode())
                .country(a.getCountry()).isDefault(a.isDefault()).build();
    }
}
