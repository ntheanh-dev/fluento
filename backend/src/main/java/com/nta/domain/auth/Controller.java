package com.nta.domain.auth;

import java.text.ParseException;
import java.time.Duration;
import java.util.Arrays;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import com.nimbusds.jose.JOSEException;
import com.nta.common.dto.ApiResponse;
import com.nta.domain.auth.dto.request.*;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.IntrospectResponse;
import com.nta.domain.auth.dto.response.PublicAuthenticationResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("authController")
@RequestMapping("auth")
@Tag(name = "Authentication", description = "Authentication and authorization APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;
    SocialService socialService;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.refresh-token-valid-duration}")
    long refreshTokenValidDurationDays;

    @PostMapping("/outbound/authentication")
    ApiResponse<PublicAuthenticationResponse> authenticateGoogle(
            @RequestParam String code, HttpServletResponse response) throws JOSEException {
        log.debug("Google OAuth authentication requested");
        final var res = socialService.authenticateGoogle(code);
        return getAuthenticationResponseApiResponse(response, res);
    }

    @PostMapping("/token")
    ApiResponse<PublicAuthenticationResponse> authenticate(
            @RequestBody @Valid AuthenticationRequest authenticationRequest, HttpServletResponse response)
            throws JOSEException {
        log.debug("Login attempt for username: {}", authenticationRequest.getUsername());

        var result = service.authenticated(authenticationRequest);

        // Set refresh token into httpOnly cookie
        return getAuthenticationResponseApiResponse(response, result);
    }

    @PostMapping("/register")
    ApiResponse<PublicAuthenticationResponse> createAccount(
            @RequestBody @Valid CreateAccountRequest authenticationRequest, HttpServletResponse response)
            throws JOSEException {
        log.debug("Registration requested for username: {}", authenticationRequest.getUsername());
        var result = service.createAccount(authenticationRequest);
        // Set refresh token into httpOnly cookie
        return getAuthenticationResponseApiResponse(response, result);
    }

    private ApiResponse<PublicAuthenticationResponse> getAuthenticationResponseApiResponse(
            HttpServletResponse response, AuthenticationResponse result) {
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(refreshTokenValidDurationDays))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ApiResponse.<PublicAuthenticationResponse>builder()
                .result(PublicAuthenticationResponse.builder()
                        .accessToken(result.getAccessToken())
                        .build())
                .build();
    }

    @PostMapping(value = "/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody @Valid IntrospectRequest introspectRequest)
            throws ParseException, JOSEException {
        var result = service.introspect(introspectRequest);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    public ApiResponse<PublicAuthenticationResponse> refresh(HttpServletRequest request, HttpServletResponse response)
            throws ParseException, JOSEException {

        String refreshToken = extractFromCookie(request);

        var result = service.refreshToken(
                RefreshTokenRequest.builder().token(refreshToken).build());

        // Cập nhật lại refresh token mới vào cookie (rotate refresh token)
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(refreshTokenValidDurationDays))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ApiResponse.<PublicAuthenticationResponse>builder()
                .result(PublicAuthenticationResponse.builder()
                        .accessToken(result.getAccessToken())
                        .build())
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest logoutRequest) throws ParseException, JOSEException {
        service.logout(logoutRequest);
        return ApiResponse.<Void>builder().build();
    }

    private String extractFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            throw new RuntimeException("No cookies found");
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }
}
