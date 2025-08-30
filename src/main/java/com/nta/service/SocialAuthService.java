package com.nta.service;

import com.nimbusds.jose.JOSEException;
import com.nta.constant.PredefinedRole;
import com.nta.dto.request.GoogleExchangeTokenRq;
import com.nta.dto.response.AuthenticationResponse;
import com.nta.dto.response.GoogleExchangeTokenRp;
import com.nta.entity.Role;
import com.nta.entity.User;
import com.nta.enums.TokenType;
import com.nta.repository.UserRepository;
import com.nta.repository.client.OutboundIdentityClient;
import com.nta.repository.client.OutboundUserClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SocialAuthService {
    OutboundIdentityClient outboundIdentityClient;
    OutboundUserClient outboundUserClient;
    UserRepository userRepository;
    AuthService authService;

    @NonFinal
    @Value("${spring.security.client.registration.google.client-id}")
    protected String GOOGLE_CLIENT_ID;

    @NonFinal
    @Value("${spring.security.client.registration.google.client-secret}")
    protected String GOOGLE_CLIENT_SECRET;

    @NonFinal
    @Value("${spring.security.client.registration.google.redirect-uri}")
    protected String GOOGLE_REDIRECT_URI;

    @NonFinal protected String GOOGLE_GRANT_TYPE = "authorization_code";

    public AuthenticationResponse authenticateGoogle(String code) throws JOSEException {
        // exchange code for access token
        GoogleExchangeTokenRp response =
                outboundIdentityClient.googleExchangeToken(
                        GoogleExchangeTokenRq.builder()
                                .code(code)
                                .clientId(GOOGLE_CLIENT_ID)
                                .clientSecret(GOOGLE_CLIENT_SECRET)
                                .redirectUri(GOOGLE_REDIRECT_URI)
                                .grantType(GOOGLE_GRANT_TYPE)
                                .build());

        // get user info from google
        var userInfo = outboundUserClient.getUserInfo(response.getAccessToken());

        Set<Role> roles = new HashSet<>();
        roles.add(Role.builder().name(PredefinedRole.USER_ROLE).build());

        // Check if user already exists, if not create a new user
        // Onboard user
        var user =
                userRepository
                        .findByUsername(userInfo.getEmail())
                        .orElseGet(
                                () ->
                                        userRepository.save(
                                                User.builder()
                                                        .username(userInfo.getEmail())
                                                        .email(userInfo.getEmail())
                                                        .urlAvatar(userInfo.getPicture())
                                                        .roles(roles)
                                                        .build()));

        // Convert google token to system token
        var token = authService.generateToken(user, TokenType.ACCESS_TOKEN);
        var refreshToken = authService.generateToken(user, TokenType.FRESH_TOKEN);

        return AuthenticationResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .build();
    }
}
