package com.nta.domain.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.text.ParseException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.nimbusds.jose.JOSEException;
import com.nta.common.dto.ApiResponse;
import com.nta.domain.auth.dto.request.*;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.IntrospectResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Controller Tests")
class ControllerTest {

    @Mock
    private Service authService;

    @Mock
    private SocialService socialService;

    @InjectMocks
    private Controller controller;

    private AuthenticationRequest authenticationRequest;
    private CreateAccountRequest createAccountRequest;
    private IntrospectRequest introspectRequest;
    private RefreshTokenRequest refreshTokenRequest;
    private LogoutRequest logoutRequest;
    private AuthenticationResponse authenticationResponse;
    private IntrospectResponse introspectResponse;

    @BeforeEach
    void setUp() {
        // Setup AuthenticationRequest
        authenticationRequest = AuthenticationRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        // Setup CreateAccountRequest
        createAccountRequest = CreateAccountRequest.builder()
                .username("newuser")
                .password("password123")
                .email("newuser@example.com")
                .build();

        // Setup IntrospectRequest
        introspectRequest = IntrospectRequest.builder().token("test-token").build();

        // Setup RefreshTokenRequest
        refreshTokenRequest =
                RefreshTokenRequest.builder().token("refresh-token").build();

        // Setup LogoutRequest
        logoutRequest = LogoutRequest.builder().token("logout-token").build();

        // Setup AuthenticationResponse
        authenticationResponse = AuthenticationResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .build();

        // Setup IntrospectResponse
        introspectResponse = IntrospectResponse.builder().valid(true).build();
    }

    @Test
    @DisplayName("Should authenticate user successfully")
    void testAuthenticate_Success() throws JOSEException {
        // Given
        when(authService.authenticated(any(AuthenticationRequest.class))).thenReturn(authenticationResponse);

        // When
        ApiResponse<AuthenticationResponse> response = controller.authenticate(authenticationRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals("access-token", response.getResult().getAccessToken());
        assertEquals("refresh-token", response.getResult().getRefreshToken());
        verify(authService, times(1)).authenticated(any(AuthenticationRequest.class));
    }

    @Test
    @DisplayName("Should create account successfully")
    void testCreateAccount_Success() {
        // Given
        doNothing().when(authService).createAccount(any(CreateAccountRequest.class));

        // When
        ApiResponse<?> response = controller.createAccount(createAccountRequest);

        // Then
        assertNotNull(response);
        verify(authService, times(1)).createAccount(any(CreateAccountRequest.class));
    }

    @Test
    @DisplayName("Should introspect token successfully")
    void testIntrospect_Success() throws ParseException, JOSEException {
        // Given
        when(authService.introspect(any(IntrospectRequest.class))).thenReturn(introspectResponse);

        // When
        ApiResponse<IntrospectResponse> response = controller.authenticate(introspectRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertTrue(response.getResult().isValid());
        verify(authService, times(1)).introspect(any(IntrospectRequest.class));
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void testRefresh_Success() throws ParseException, JOSEException {
        // Given
        when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(authenticationResponse);

        // When
        ApiResponse<AuthenticationResponse> response = controller.refresh(refreshTokenRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals("access-token", response.getResult().getAccessToken());
        assertEquals("refresh-token", response.getResult().getRefreshToken());
        verify(authService, times(1)).refreshToken(any(RefreshTokenRequest.class));
    }

    @Test
    @DisplayName("Should logout successfully")
    void testLogout_Success() throws ParseException, JOSEException {
        // Given
        doNothing().when(authService).logout(any(LogoutRequest.class));

        // When
        ApiResponse<Void> response = controller.logout(logoutRequest);

        // Then
        assertNotNull(response);
        verify(authService, times(1)).logout(any(LogoutRequest.class));
    }

    @Test
    @DisplayName("Should authenticate Google user successfully")
    void testAuthenticateGoogle_Success() throws JOSEException {
        // Given
        String code = "google-auth-code";
        when(socialService.authenticateGoogle(anyString())).thenReturn(authenticationResponse);

        // When
        ApiResponse<AuthenticationResponse> response = controller.authenticateGoogle(code);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals("access-token", response.getResult().getAccessToken());
        assertEquals("refresh-token", response.getResult().getRefreshToken());
        verify(socialService, times(1)).authenticateGoogle(eq(code));
    }
}
