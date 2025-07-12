package com.nta.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nta.constant.PredefinedRole;
import com.nta.dto.request.AuthenticationRequest;
import com.nta.dto.request.CreateAccountRequest;
import com.nta.dto.request.IntrospectRequest;
import com.nta.dto.request.LogoutRequest;
import com.nta.dto.response.AuthenticationResponse;
import com.nta.dto.response.IntrospectResponse;
import com.nta.entity.Role;
import com.nta.entity.User;
import com.nta.enums.ErrorCode;
import com.nta.enums.TokenType;
import com.nta.exception.AppException;
import com.nta.mapper.UserMapper;
import com.nta.repository.RoleRepository;
import com.nta.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthService {
    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.signer-key}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.access-token-valid-duration}")
    protected long ACCESS_TOKEN_VALID_DURATION;

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.refresh-token-valid-duration}")
    protected long REFRESH_TOKEN_VALID_DURATION;

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


    public void createAccount(CreateAccountRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        User u = userMapper.toUser(request);
        u.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        u.setRoles(roles);
        userRepository.save(u);
    }

    String generateToken(User user, TokenType type) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        Date expirationTime = TokenType.ACCESS_TOKEN.equals(type)
                ? new Date(Instant.now()
                .plus(ACCESS_TOKEN_VALID_DURATION, ChronoUnit.HOURS)
                .toEpochMilli())
                : new Date(Instant.now()
                .plus(REFRESH_TOKEN_VALID_DURATION, ChronoUnit.DAYS)
                .toEpochMilli());
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("nta.com") // chỉ định token đợc issue từ ai
                .issueTime(new Date())
                .expirationTime(expirationTime)
                .claim("scope", buildScope(user))
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

    // Dùng để verify token trong controller
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;
        try {
            verifyToken(token); // Nếu token hết hạn or token sai thì sẽ throw error
        } catch (AppException e) {
            isValid = false;
        }
        return IntrospectResponse.builder().valid(isValid).build();
    }

    public void verifyToken(String token) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Check if token is a logouted token (in black list in redis)
        //    if (redisService.isRedisLive() && redisService.hasValue(token, "1")) {
        //      throw new AppException(ErrorCode.UNAUTHENTICATED);
        //    }

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

    public String extractClaim(final String claimKey) {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.isAuthenticated()) {
            final Jwt jwt = (Jwt) authentication.getCredentials();
            return jwt.getClaim(claimKey);
        }
        return null;
    }

    public void logout(LogoutRequest request) {
        //        if (redisService.isRedisLive()) {
        //            redisService.set(request.getToken(), "1");
        //        }
    }
}
