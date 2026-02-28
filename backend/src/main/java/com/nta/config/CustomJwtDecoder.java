package com.nta.config;

import java.text.ParseException;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.auth.dto.request.IntrospectRequest;

import lombok.experimental.NonFinal;

@Component
public class CustomJwtDecoder implements JwtDecoder {

    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.signer-key}")
    private String signerKey;

    @Autowired
    private com.nta.domain.auth.Service authService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        try {
            var response = authService.introspect(
                    IntrospectRequest.builder().token(token).build());

            if (!response.isValid()) throw new AppException(ErrorCode.INVALID_TOKEN);
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS256");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}
