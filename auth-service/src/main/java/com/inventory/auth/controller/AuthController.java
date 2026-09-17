package com.inventory.auth.controller;

import com.inventory.auth.dto.AuthResponse;
import com.inventory.auth.dto.LoginRequest;
import com.inventory.auth.dto.RegisterRequest;
import com.inventory.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            String message = authService.register(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<String> validate(@RequestParam String token) {
        if (authService.validate(token)) {
            return ResponseEntity.ok("Token is valid");
        }
        return ResponseEntity.status(401).body("Invalid token");
    }
}
