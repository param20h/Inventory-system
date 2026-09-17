package com.example.apigateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${jwt.secret:my_super_secret_key_for_jwt_token_generation_which_is_very_long}")
    private String secret;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public void validateToken(final String token) {
        Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
    }
}
