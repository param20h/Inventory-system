package com.example.apigateway.filter;

import com.example.apigateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        if (isSecured(request)) {
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return this.onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            } else {
                return this.onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            try {
                jwtUtil.validateToken(authHeader);
            } catch (Exception e) {
                e.printStackTrace(); return this.onError(exchange, "Unauthorized access to application", HttpStatus.UNAUTHORIZED);
            }
        }
        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    private boolean isSecured(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        return !path.startsWith("/api/auth/") && !request.getMethod().name().equals("OPTIONS");
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
