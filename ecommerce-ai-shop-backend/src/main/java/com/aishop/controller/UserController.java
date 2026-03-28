package com.aishop.controller;

import com.aishop.dto.Dtos.*;
import com.aishop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private Long getUserId(Authentication auth) {
        return userService.getUserByEmail(auth.getName()).getId();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(auth.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(Authentication auth, @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", userService.updateProfile(auth.getName(), req)));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<UserDto>> updateSettings(Authentication auth, @RequestBody UpdateSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Settings updated", userService.updateSettings(auth.getName(), req)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication auth, @RequestBody ChangePasswordRequest req) {
        userService.changePassword(auth.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok("Password changed", null));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAddresses(getUserId(auth))));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(Authentication auth, @RequestBody AddressDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Address added", userService.addAddress(getUserId(auth), dto)));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(Authentication auth, @PathVariable Long id, @RequestBody AddressDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Address updated", userService.updateAddress(getUserId(auth), id, dto)));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(Authentication auth, @PathVariable Long id) {
        userService.deleteAddress(getUserId(auth), id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted", null));
    }
}
