// package com.nta.logger;
//
// import java.io.IOException;
// import java.util.UUID;
//
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
//
// import org.slf4j.MDC;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.oauth2.jwt.Jwt;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;
//
// import lombok.extern.slf4j.Slf4j;
//
// @Slf4j
// @Component
// public class RequestLoggingFilter extends OncePerRequestFilter {
//
//    private static final String REQUEST_ID = "reqId";
//    private static final String USER_ID = "userId";
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//
//        long startTime = System.currentTimeMillis();
//
//        // 1️⃣ Tạo requestId
//        String requestId = UUID.randomUUID().toString();
//        MDC.put(REQUEST_ID, requestId);
//        response.setHeader("X-Request-Id", requestId);
//
//        // 2️⃣ Lấy userId nếu có (Spring Security)
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        if (auth != null && auth.isAuthenticated()) {
//            Jwt principal = (Jwt) auth.getPrincipal();
//            Object userId = principal.getClaims().get("user_id");
//            if (userId != null) {
//                MDC.put(USER_ID, userId.toString());
//            }
//        }
//
//        try {
//            filterChain.doFilter(request, response);
//        } catch (Exception ex) {
//            log.error("Unhandled exception", ex);
//            throw ex;
//        } finally {
//            long duration = System.currentTimeMillis() - startTime;
//            log.info(
//                    "{} {} - {} ({} ms)", request.getMethod(), request.getRequestURI(), response.getStatus(),
// duration);
//            MDC.clear();
//        }
//    }
// }
