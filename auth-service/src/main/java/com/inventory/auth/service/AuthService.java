package com.inventory.auth.service;

import com.inventory.auth.dto.LoginRequest;
import com.inventory.auth.dto.RegisterRequest;
import com.inventory.auth.model.User;
import com.inventory.auth.repository.UserRepository;
import com.inventory.auth.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : "USER"
        );
        userRepository.save(user);
        return "User registered successfully";
    }

    public String login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return jwtUtil.generateToken(user.getUsername());
            }
        }
        throw new RuntimeException("Invalid credentials");
    }
    
    public boolean validate(String token) {
        return jwtUtil.validateToken(token);
    }
}
