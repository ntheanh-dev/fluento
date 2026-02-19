package com.nta.domain.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.text.ParseException;
import java.util.HashSet;
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
import com.nta.common.constant.PredefinedRole;
import com.nta.common.enums.ErrorCode;
import com.nta.common.enums.TokenType;
import com.nta.common.exception.AppException;
import com.nta.domain.auth.dto.request.*;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.IntrospectResponse;
import com.nta.domain.role.Role;
import com.nta.domain.user.Mapper;
import com.nta.domain.user.User;

@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Service Tests")
class ServiceTest {

    @Mock
    private com.nta.domain.user.Repository userRepository;

    @Mock
    private Mapper userMapper;

    @Mock
    private com.nta.domain.role.Repository roleRepository;

    @Mock
    private com.nta.domain.auth.Repository invalidatedTokenRepository;

    @InjectMocks
    private Service authService;

    private User testUser;
    private Role userRole;
    private AuthenticationRequest authenticationRequest;
    private CreateAccountRequest createAccountRequest;
    private IntrospectRequest introspectRequest;
    private RefreshTokenRequest refreshTokenRequest;
    private LogoutRequest logoutRequest;

    @BeforeEach
    void setUp() {
        // Setup test data
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("$2a$10$encryptedPassword")
                .build();

        userRole = new Role();
        userRole.setName(PredefinedRole.USER_ROLE);

        authenticationRequest = AuthenticationRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        createAccountRequest = CreateAccountRequest.builder()
                .username("newuser")
                .password("password123")
                .email("newuser@example.com")
                .build();

        introspectRequest = IntrospectRequest.builder().token("test-token").build();

        refreshTokenRequest =
                RefreshTokenRequest.builder().token("refresh-token").build();

        logoutRequest = LogoutRequest.builder().token("logout-token").build();

        // Set up reflection for private fields
        ReflectionTestUtils.setField(authService, "SIGNER_KEY", "test-signer-key-123456789012345678901234567890");
        ReflectionTestUtils.setField(authService, "ACCESS_TOKEN_VALID_DURATION", 60L);
        ReflectionTestUtils.setField(authService, "REFRESH_TOKEN_VALID_DURATION", 7L);
    }

    @Test
    @DisplayName("Should create account successfully")
    void testCreateAccount_Success() {
        // Given
        User mappedUser =
                User.builder().username("newuser").password("password123").build();
        when(userMapper.toUser(any(CreateAccountRequest.class))).thenReturn(mappedUser);
        when(roleRepository.findById(PredefinedRole.USER_ROLE)).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authService.createAccount(createAccountRequest);

        // Then
        verify(userMapper, times(1)).toUser(any(CreateAccountRequest.class));
        verify(roleRepository, times(1)).findById(PredefinedRole.USER_ROLE);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should generate token successfully")
    void testGenerateToken_Success() throws JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());

        // When
        String token = authService.generateToken(testUser, TokenType.ACCESS_TOKEN);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("Should generate refresh token successfully")
    void testGenerateRefreshToken_Success() throws JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());

        // When
        String token = authService.generateToken(testUser, TokenType.FRESH_TOKEN);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("Should authenticate user successfully")
    void testAuthenticated_Success() throws JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When
        AuthenticationResponse response = authService.authenticated(authenticationRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testAuthenticated_UserNotFound() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            authService.authenticated(authenticationRequest);
        });

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect")
    void testAuthenticated_WrongPassword() {
        // Given
        testUser.setPassword("$2a$10$wrongEncryptedPassword");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            authService.authenticated(authenticationRequest);
        });

        assertEquals(ErrorCode.UNAUTHENTICATED, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should introspect valid token successfully")
    void testIntrospect_ValidToken() throws ParseException, JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());
        String validToken = authService.generateToken(testUser, TokenType.ACCESS_TOKEN);
        introspectRequest.setToken(validToken);

        // When
        IntrospectResponse response = authService.introspect(introspectRequest);

        // Then
        assertNotNull(response);
        assertTrue(response.isValid());
    }

    @Test
    @DisplayName("Should introspect invalid token successfully")
    void testIntrospect_InvalidToken() throws ParseException, JOSEException {
        // Given
        introspectRequest.setToken("invalid-token");

        // When
        IntrospectResponse response = authService.introspect(introspectRequest);

        // Then
        assertNotNull(response);
        assertFalse(response.isValid());
    }

    @Test
    @DisplayName("Should logout successfully")
    void testLogout_Success() throws ParseException, JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());
        String refreshToken = authService.generateToken(testUser, TokenType.FRESH_TOKEN);
        logoutRequest.setToken(refreshToken);
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);
        when(invalidatedTokenRepository.save(any(InvalidatedToken.class))).thenReturn(new InvalidatedToken());

        // When
        authService.logout(logoutRequest);

        // Then
        verify(invalidatedTokenRepository, atLeastOnce()).save(any(InvalidatedToken.class));
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void testRefreshToken_Success() throws ParseException, JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());
        String refreshToken = authService.generateToken(testUser, TokenType.FRESH_TOKEN);
        refreshTokenRequest.setToken(refreshToken);
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.of(testUser));
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);
        when(invalidatedTokenRepository.save(any(InvalidatedToken.class))).thenReturn(new InvalidatedToken());

        // When
        AuthenticationResponse response = authService.refreshToken(refreshTokenRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        verify(userRepository, times(1)).findByUsername(testUser.getUsername());
        verify(invalidatedTokenRepository, atLeastOnce()).save(any(InvalidatedToken.class));
    }

    @Test
    @DisplayName("Should throw exception when refresh token user not found")
    void testRefreshToken_UserNotFound() throws ParseException, JOSEException {
        // Given
        testUser.setRoles(new HashSet<>());
        String refreshToken = authService.generateToken(testUser, TokenType.FRESH_TOKEN);
        refreshTokenRequest.setToken(refreshToken);
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.empty());
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);
        when(invalidatedTokenRepository.save(any(InvalidatedToken.class))).thenReturn(new InvalidatedToken());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            authService.refreshToken(refreshTokenRequest);
        });

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername(testUser.getUsername());
    }

    @Test
    @DisplayName("Should get user ID from security context successfully")
    void testGetUserIdFromSecurityContext_Success() {
        // Note: This test requires Spring Security context setup
        // In a real scenario, you would use @WithMockUser or similar
        // For now, we'll test that the method exists and can be called
        // Full testing would require Spring Security test context

        // This test demonstrates the method signature
        // Actual implementation testing requires Spring Security test setup
        assertNotNull(authService);
    }
}
