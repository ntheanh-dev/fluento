package com.nta.domain.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.nimbusds.jose.JOSEException;
import com.nta.common.client.OutboundIdentityClient;
import com.nta.common.client.OutboundUserClient;
import com.nta.common.constant.PredefinedRole;
import com.nta.common.dto.OutboundUserResponse;
import com.nta.domain.auth.dto.request.GoogleExchangeTokenRq;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.GoogleExchangeTokenRp;
import com.nta.domain.role.Role;
import com.nta.domain.user.Repository;
import com.nta.domain.user.User;

@ExtendWith(MockitoExtension.class)
@DisplayName("Social Service Tests")
class SocialServiceTest {

    @Mock
    private OutboundIdentityClient outboundIdentityClient;

    @Mock
    private OutboundUserClient outboundUserClient;

    @Mock
    private Repository userRepository;

    @Mock
    private Service authService;

    @Mock
    private com.nta.domain.role.Repository roleRepository;

    @InjectMocks
    private SocialService socialService;

    private GoogleExchangeTokenRp googleTokenResponse;
    private OutboundUserResponse userInfoResponse;
    private User existingUser;
    private User newUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        // Setup Google token response
        googleTokenResponse = GoogleExchangeTokenRp.builder()
                .accessToken("google-access-token")
                .expiresIn("3600")
                .refreshToken("google-refresh-token")
                .tokenType("Bearer")
                .build();

        // Setup user info response
        userInfoResponse = OutboundUserResponse.builder()
                .email("test@example.com")
                .picture("https://example.com/avatar.jpg")
                .givenName("Test")
                .familyName("User")
                .build();

        // Setup existing user
        existingUser = User.builder()
                .id(1L)
                .username("test@example.com")
                .urlAvatar("https://example.com/avatar.jpg")
                .build();

        // Setup new user
        newUser = User.builder()
                .id(2L)
                .username("newuser@example.com")
                .urlAvatar("https://example.com/newavatar.jpg")
                .build();

        // Setup role
        userRole = new Role();
        userRole.setName(PredefinedRole.USER_ROLE);

        // Set up reflection for private fields
        ReflectionTestUtils.setField(socialService, "GOOGLE_CLIENT_ID", "test-client-id");
        ReflectionTestUtils.setField(socialService, "GOOGLE_CLIENT_SECRET", "test-client-secret");
        ReflectionTestUtils.setField(socialService, "GOOGLE_REDIRECT_URI", "http://localhost:8080/callback");
        ReflectionTestUtils.setField(socialService, "GOOGLE_GRANT_TYPE", "authorization_code");
    }

    @Test
    @DisplayName("Should authenticate Google user with existing account successfully")
    void testAuthenticateGoogle_ExistingUser_Success() throws JOSEException {
        // Given
        String code = "google-auth-code";
        String systemAccessToken = "system-access-token";
        String systemRefreshToken = "system-refresh-token";

        when(outboundIdentityClient.googleExchangeToken(any(GoogleExchangeTokenRq.class)))
                .thenReturn(googleTokenResponse);
        when(outboundUserClient.getUserInfo("google-access-token")).thenReturn(userInfoResponse);
        when(roleRepository.findByName(PredefinedRole.USER_ROLE)).thenReturn(userRole);
        when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.of(existingUser));
        when(authService.generateToken(existingUser, com.nta.common.enums.TokenType.ACCESS_TOKEN))
                .thenReturn(systemAccessToken);
        when(authService.generateToken(existingUser, com.nta.common.enums.TokenType.FRESH_TOKEN))
                .thenReturn(systemRefreshToken);

        // When
        AuthenticationResponse response = socialService.authenticateGoogle(code);

        // Then
        assertNotNull(response);
        assertEquals(systemAccessToken, response.getAccessToken());
        assertEquals(systemRefreshToken, response.getRefreshToken());
        verify(outboundIdentityClient, times(1)).googleExchangeToken(any(GoogleExchangeTokenRq.class));
        verify(outboundUserClient, times(1)).getUserInfo("google-access-token");
        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(userRepository, never()).save(any(User.class));
        verify(authService, times(1)).generateToken(existingUser, com.nta.common.enums.TokenType.ACCESS_TOKEN);
        verify(authService, times(1)).generateToken(existingUser, com.nta.common.enums.TokenType.FRESH_TOKEN);
    }

    @Test
    @DisplayName("Should authenticate Google user and create new account successfully")
    void testAuthenticateGoogle_NewUser_Success() throws JOSEException {
        // Given
        String code = "google-auth-code";
        String systemAccessToken = "system-access-token";
        String systemRefreshToken = "system-refresh-token";

        when(outboundIdentityClient.googleExchangeToken(any(GoogleExchangeTokenRq.class)))
                .thenReturn(googleTokenResponse);
        when(outboundUserClient.getUserInfo("google-access-token")).thenReturn(userInfoResponse);
        when(roleRepository.findByName(PredefinedRole.USER_ROLE)).thenReturn(userRole);
        when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(authService.generateToken(any(User.class), com.nta.common.enums.TokenType.ACCESS_TOKEN))
                .thenReturn(systemAccessToken);
        when(authService.generateToken(any(User.class), com.nta.common.enums.TokenType.FRESH_TOKEN))
                .thenReturn(systemRefreshToken);

        // When
        AuthenticationResponse response = socialService.authenticateGoogle(code);

        // Then
        assertNotNull(response);
        assertEquals(systemAccessToken, response.getAccessToken());
        assertEquals(systemRefreshToken, response.getRefreshToken());
        verify(outboundIdentityClient, times(1)).googleExchangeToken(any(GoogleExchangeTokenRq.class));
        verify(outboundUserClient, times(1)).getUserInfo("google-access-token");
        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(userRepository, times(1)).save(any(User.class));
        verify(authService, times(1)).generateToken(any(User.class), com.nta.common.enums.TokenType.ACCESS_TOKEN);
        verify(authService, times(1)).generateToken(any(User.class), com.nta.common.enums.TokenType.FRESH_TOKEN);
    }

    @Test
    @DisplayName("Should use correct Google OAuth parameters")
    void testAuthenticateGoogle_CorrectParameters() throws JOSEException {
        // Given
        String code = "google-auth-code";
        String systemAccessToken = "system-access-token";
        String systemRefreshToken = "system-refresh-token";

        when(outboundIdentityClient.googleExchangeToken(any(GoogleExchangeTokenRq.class)))
                .thenReturn(googleTokenResponse);
        when(outboundUserClient.getUserInfo("google-access-token")).thenReturn(userInfoResponse);
        when(roleRepository.findByName(PredefinedRole.USER_ROLE)).thenReturn(userRole);
        when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.of(existingUser));
        when(authService.generateToken(existingUser, com.nta.common.enums.TokenType.ACCESS_TOKEN))
                .thenReturn(systemAccessToken);
        when(authService.generateToken(existingUser, com.nta.common.enums.TokenType.FRESH_TOKEN))
                .thenReturn(systemRefreshToken);

        // When
        socialService.authenticateGoogle(code);

        // Then
        verify(outboundIdentityClient, times(1)).googleExchangeToken(argThat(request -> {
            return request.getCode().equals(code)
                    && request.getClientId().equals("test-client-id")
                    && request.getClientSecret().equals("test-client-secret")
                    && request.getRedirectUri().equals("http://localhost:8080/callback")
                    && request.getGrantType().equals("authorization_code");
        }));
    }
}
