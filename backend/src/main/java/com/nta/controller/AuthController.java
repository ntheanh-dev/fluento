package com.nta.controller;

import com.nimbusds.jose.JOSEException;
import com.nta.dto.request.*;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.AuthenticationResponse;
import com.nta.dto.response.IntrospectResponse;
import com.nta.service.AuthService;
import com.nta.service.SocialAuthService;

import jakarta.validation.Valid;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;
    SocialAuthService socialAuthService;

    @PostMapping("/outbound/authentication")
    ApiResponse<AuthenticationResponse> authenticateGoogle(@RequestParam String code)
            throws JOSEException {
        final var res = socialAuthService.authenticateGoogle(code);
        return ApiResponse.<AuthenticationResponse>builder().result(res).build();
    }

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest authenticationRequest) throws JOSEException {
        var result = authService.authenticated(authenticationRequest);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/register")
    ApiResponse<?> createAccount(@RequestBody @Valid CreateAccountRequest authenticationRequest) {
        authService.createAccount(authenticationRequest);
        return ApiResponse.<AuthenticationResponse>builder().build();
    }

    @PostMapping(value = "/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest introspectRequest)
            throws ParseException, JOSEException {
        var result = authService.introspect(introspectRequest);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshTokenRequest request)
            throws ParseException, JOSEException {
        var result = authService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest logoutRequest)
            throws ParseException, JOSEException {
        authService.logout(logoutRequest);
        return ApiResponse.<Void>builder().build();
    }
}
