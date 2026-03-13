package com.nta.filter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class IpRateLimiterFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> buckets =
            Caffeine.newBuilder()
                    .expireAfterAccess(5, TimeUnit.MINUTES)
                    .maximumSize(10_000)
                    .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip = getClientIp(request);

        Bucket bucket = buckets.get(ip, this::newBucket);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {

            response.setStatus(HttpStatus.SC_TOO_MANY_REQUESTS);
            response.setContentType("application/json");

            response.getWriter().write(
                    "{\"error\":\"too_many_requests\"}"
            );

            log.warn("Rate limit exceeded for IP: {}", ip);
        }
    }

    private Bucket newBucket(String ip) {
        Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofSeconds(30)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {

        String xfHeader = request.getHeader("X-Forwarded-For");

        if (xfHeader == null) {
            return request.getRemoteAddr();
        }

        return xfHeader.split(",")[0];
    }
}
