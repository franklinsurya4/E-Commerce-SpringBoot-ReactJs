// src/main/java/com/aishop/security/UserDetailsImpl.java
package com.aishop.security;

import com.aishop.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;      // ✅ Will be populated with email
    private String email;

    @JsonIgnore
    private String password;

    @JsonIgnore
    private User user;            // ✅ Reference to full User entity

    private Collection<? extends GrantedAuthority> authorities;

    /**
     * ✅ Factory method to create UserDetailsImpl from User entity
     * Adapts to your User model: email as username, single Role enum
     */
    public static UserDetailsImpl build(User user) {
        // ✅ Convert single Role enum to GrantedAuthority
        // Prefix with "ROLE_" for Spring Security role hierarchy
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),              // ✅ Use email as username
                user.getEmail(),
                user.getPassword(),
                user,                         // ✅ Store reference to User
                List.of(authority)            // ✅ Single authority from enum
        );
    }

    /**
     * ✅ Custom method to access full User entity from controller
     */
    public User getUser() {
        return this.user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;  // ✅ Returns email
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}