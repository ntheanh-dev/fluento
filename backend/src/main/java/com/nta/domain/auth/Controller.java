package com.nta.domain.auth;

import java.text.ParseException;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.nimbusds.jose.JOSEException;
import com.nta.common.dto.ApiResponse;
import com.nta.domain.auth.dto.request.*;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.IntrospectResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

    @PostMapping("/outbound/authentication")
    ApiResponse<AuthenticationResponse> authenticateGoogle(@RequestParam String code) throws JOSEException {
        log.debug("Google OAuth authentication requested");
        final var res = socialService.authenticateGoogle(code);
        return ApiResponse.<AuthenticationResponse>builder().result(res).build();
    }

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest authenticationRequest)
            throws JOSEException {
        log.debug("Login attempt for username: {}", authenticationRequest.getUsername());
        var result = service.authenticated(authenticationRequest);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/register")
    ApiResponse<?> createAccount(@RequestBody @Valid CreateAccountRequest authenticationRequest) {
        log.debug("Registration requested for username: {}", authenticationRequest.getUsername());
        service.createAccount(authenticationRequest);
        return ApiResponse.<AuthenticationResponse>builder().build();
    }

    @PostMapping(value = "/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody @Valid IntrospectRequest introspectRequest)
            throws ParseException, JOSEException {
        var result = service.introspect(introspectRequest);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody @Valid RefreshTokenRequest request)
            throws ParseException, JOSEException {
        var result = service.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest logoutRequest) throws ParseException, JOSEException {
        service.logout(logoutRequest);
        return ApiResponse.<Void>builder().build();
    }
}
