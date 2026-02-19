package com.nta.domain.auth;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;

import com.nimbusds.jose.JOSEException;
import com.nta.common.client.OutboundIdentityClient;
import com.nta.common.client.OutboundUserClient;
import com.nta.common.constant.PredefinedRole;
import com.nta.common.enums.TokenType;
import com.nta.domain.auth.dto.request.GoogleExchangeTokenRq;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.GoogleExchangeTokenRp;
import com.nta.domain.role.Role;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("socialAuthService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SocialService {
    OutboundIdentityClient outboundIdentityClient;
    OutboundUserClient outboundUserClient;
    com.nta.domain.user.Repository userRepository;
    com.nta.domain.auth.Service authService;
    com.nta.domain.role.Repository roleRepository;

    @NonFinal
    @Value("${spring.security.client.registration.google.client-id}")
    protected String GOOGLE_CLIENT_ID;

    @NonFinal
    @Value("${spring.security.client.registration.google.client-secret}")
    protected String GOOGLE_CLIENT_SECRET;

    @NonFinal
    @Value("${spring.security.client.registration.google.redirect-uri}")
    protected String GOOGLE_REDIRECT_URI;

    @NonFinal
    protected String GOOGLE_GRANT_TYPE = "authorization_code";

    public AuthenticationResponse authenticateGoogle(String code) throws JOSEException {
        // exchange code for access token
        GoogleExchangeTokenRp response = outboundIdentityClient.googleExchangeToken(GoogleExchangeTokenRq.builder()
                .code(code)
                .clientId(GOOGLE_CLIENT_ID)
                .clientSecret(GOOGLE_CLIENT_SECRET)
                .redirectUri(GOOGLE_REDIRECT_URI)
                .grantType(GOOGLE_GRANT_TYPE)
                .build());

        // get user info from google
        var userInfo = outboundUserClient.getUserInfo(response.getAccessToken());

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName(PredefinedRole.USER_ROLE));

        // Check if user already exists, if not create a new user
        // Onboard user
        var user = userRepository
                .findByUsername(userInfo.getEmail())
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(userInfo.getEmail())
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
