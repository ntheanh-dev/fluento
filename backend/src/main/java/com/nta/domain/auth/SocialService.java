package com.nta.domain.auth;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

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

        // Build fullName from Google given_name + family_name
        String fullName = buildFullNameFromGoogle(userInfo.getGivenName(), userInfo.getFamilyName());

        // Check if user already exists, if not create a new user
        // Onboard user
        var user = userRepository
                .findByUsername(userInfo.getEmail())
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(userInfo.getEmail())
                        .fullName(fullName)
                        .urlAvatar(userInfo.getPicture())
                        .roles(roles)
                        .build()));

        // Sync fullName/avatar from Google for existing user when not set
        if (StringUtils.hasText(fullName) && !StringUtils.hasText(user.getFullName())) {
            user.setFullName(fullName);
        }
        if (StringUtils.hasText(userInfo.getPicture()) && !StringUtils.hasText(user.getUrlAvatar())) {
            user.setUrlAvatar(userInfo.getPicture());
        }
        user = userRepository.save(user);

        // Convert google token to system token
        var token = authService.generateToken(user, TokenType.ACCESS_TOKEN);
        var refreshToken = authService.generateToken(user, TokenType.FRESH_TOKEN);

        return AuthenticationResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .build();
    }

    private static String buildFullNameFromGoogle(String givenName, String familyName) {
        return Stream.of(givenName, familyName)
                .filter(StringUtils::hasText)
                .reduce((a, b) -> a + " " + b)
                .map(String::trim)
                .orElse(" ");
    }
}
