package Com.E_Commerce.MarketPlace.Service;

import Com.E_Commerce.MarketPlace.Model.User;
import Com.E_Commerce.MarketPlace.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    UserRepository userRepository;

    // Register new user
    public User signin(User user) {
        return userRepository.save(user);
    }

    // Login - validate email + password
    public User login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

    // ✅ NEW: Get user by email (used by /auth/me endpoint)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}