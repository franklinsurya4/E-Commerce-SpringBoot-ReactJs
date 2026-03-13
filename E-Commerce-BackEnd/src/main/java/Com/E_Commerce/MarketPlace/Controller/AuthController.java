package Com.E_Commerce.MarketPlace.Controller;

import java.util.HashMap;
import java.util.Map;

import Com.E_Commerce.MarketPlace.Model.User;
import Com.E_Commerce.MarketPlace.Service.AuthService;
import Com.E_Commerce.MarketPlace.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    AuthService service;

    @Autowired
    JwtUtil jwt;

    // POST /auth/signin  →  Register
    @PostMapping("/signin")
    public User signin(@RequestBody User user) {
        return service.signin(user);
    }

    // POST /auth/login  →  Login, returns JWT token
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        User valid = service.login(user.getEmail(), user.getPassword());
        Map<String, String> response = new HashMap<>();
        if (valid != null) {
            String token = jwt.generateToken(valid.getEmail());
            response.put("token", token);
        } else {
            response.put("error", "Invalid Credentials");
        }
        return response;
    }

    // ✅ GET /auth/me  →  Returns logged-in user's profile from JWT
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String authHeader) {
        try {
            // Strip "Bearer " prefix
            String token = authHeader.replace("Bearer ", "").trim();

            // Extract email from JWT
            String email = jwt.extractEmail(token);

            // Find user in DB
            User user = service.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Return safe fields only — never return password
            Map<String, Object> response = new HashMap<>();
            response.put("id",       user.getId());
            response.put("username", user.getUsername());
            response.put("email",    user.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
    }
}