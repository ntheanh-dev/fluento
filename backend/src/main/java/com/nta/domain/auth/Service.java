package com.nta.domain.auth;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.CollectionUtils;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nta.common.constant.PredefinedRole;
import com.nta.common.enums.ErrorCode;
import com.nta.common.enums.TokenType;
import com.nta.common.exception.AppException;
import com.nta.domain.auth.dto.request.*;
import com.nta.domain.auth.dto.response.AuthenticationResponse;
import com.nta.domain.auth.dto.response.IntrospectResponse;
import com.nta.domain.role.Role;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("authService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class Service {
    com.nta.domain.user.Repository userRepository;
    com.nta.domain.user.Mapper userMapper;
    com.nta.domain.role.Repository roleRepository;
    Repository invalidatedTokenRepository;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.signer-key}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.access-token-valid-duration}")
    protected long ACCESS_TOKEN_VALID_DURATION;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.refresh-token-valid-duration}")
    protected long REFRESH_TOKEN_VALID_DURATION;

    public void createAccount(CreateAccountRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        User u = userMapper.toUser(request);
        u.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        u.setRoles(roles);
        userRepository.save(u);
    }

    public String generateToken(User user, TokenType type) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        Date expirationTime = TokenType.ACCESS_TOKEN.equals(type)
                ? new Date(Instant.now()
                        .plus(ACCESS_TOKEN_VALID_DURATION, ChronoUnit.MINUTES)
                        .toEpochMilli())
                : new Date(Instant.now()
                        .plus(REFRESH_TOKEN_VALID_DURATION, ChronoUnit.DAYS)
                        .toEpochMilli());

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("nta.com") // chỉ định token đợc issue từ ai
                .issueTime(new Date())
                .expirationTime(expirationTime)
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("type", type.name())
                .claim("user_id", user.getId())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload); // sẽ cần nhận vào 2 đối số là header và payload

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    // Dùng để verify token trong controller và trong filter
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;
        try {
            verifyToken(token, false); // Nếu token hết hạn or token sai thì sẽ throw error
        } catch (AppException e) {
            isValid = false;
        }
        return IntrospectResponse.builder().valid(isValid).build();
    }

    public SignedJWT verifyToken(final String token, final boolean isRefreshToken)
            throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        // Trường hợp lấy refresh token để truy cập tài nguyên
        if (!isRefreshToken
                && !signedJWT.getJWTClaimsSet().getStringClaim("type").equals(TokenType.ACCESS_TOKEN.name()))
            throw new AppException(ErrorCode.UNABLE_TO_USE_REFRESH_TOKEN_TO_ACCESS_RESOURCE);

        Date expiryTime = isRefreshToken
                ? new Date(signedJWT
                        .getJWTClaimsSet()
                        .getIssueTime()
                        .toInstant()
                        .plus(REFRESH_TOKEN_VALID_DURATION, ChronoUnit.DAYS)
                        .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    public AuthenticationResponse authenticated(AuthenticationRequest authenticationRequest) throws JOSEException {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepository
                .findByUsername(authenticationRequest.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        boolean authenticate = passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword());
        if (!authenticate) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var accessToken = generateToken(user, TokenType.ACCESS_TOKEN);
        var refreshToken = generateToken(user, TokenType.FRESH_TOKEN);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void logout(final LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true); // chỉ invalidate refresh token

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            log.info("Token already expired");
        }
    }

    public AuthenticationResponse refreshToken(final RefreshTokenRequest request) throws ParseException, JOSEException {
        final SignedJWT signToken = verifyToken(request.getToken(), true); // chỉ invalidate refresh token

        final String jID = signToken.getJWTClaimsSet().getJWTID();
        final Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        // Lưu token vào danh sách token đã bị invalidate
        final InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jID).expiryTime(expiryTime).build();
        invalidatedTokenRepository.save(invalidatedToken);

        final String username = signToken.getJWTClaimsSet().getSubject();

        final var user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var accessToken = generateToken(user, TokenType.ACCESS_TOKEN);
        var newRefreshToken = generateToken(user, TokenType.FRESH_TOKEN);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

    public Long getUserIdFromSecurityContext() {
        final var context = SecurityContextHolder.getContext();
        final Jwt jwt = (Jwt) context.getAuthentication().getPrincipal();
        return Long.valueOf(jwt.getClaims().get("user_id").toString());
    }
}
