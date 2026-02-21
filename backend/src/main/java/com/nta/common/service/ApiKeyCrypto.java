package com.nta.common.service;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Encrypts/decrypts API keys before storing in DB and when returning to client.
 * Uses AES-256-GCM; secret must be 32 bytes (256 bits).
 */
@Component
@Slf4j
public class ApiKeyCrypto {

    private static final String ALG = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;

    private final byte[] keyBytes;

    public ApiKeyCrypto(@Value("${app.api-key-encryption-secret}") String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length != 32) {
            throw new IllegalArgumentException(
                    "app.api-key-encryption-secret must be exactly 32 bytes (32 UTF-8 characters)");
        }
        this.keyBytes = raw;
    }

    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            byte[] iv = deriveIv(plainText);

            Cipher cipher = Cipher.getInstance(ALG);
            cipher.init(
                    Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer buf = ByteBuffer.allocate(iv.length + cipherText.length);
            buf.put(iv);
            buf.put(cipherText);
            return Base64.getEncoder().encodeToString(buf.array());
        } catch (Exception e) {
            log.error("API key encryption failed", e);
            throw new RuntimeException("API key encryption failed", e);
        }
    }

    private byte[] deriveIv(String plainText) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(keyBytes);
        md.update(plainText.getBytes(StandardCharsets.UTF_8));
        byte[] hash = md.digest();
        byte[] iv = new byte[GCM_IV_LENGTH];
        System.arraycopy(hash, 0, iv, 0, GCM_IV_LENGTH);
        return iv;
    }

    public String decrypt(String encryptedBase64) {
        if (encryptedBase64 == null || encryptedBase64.isEmpty()) {
            return encryptedBase64;
        }
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedBase64);
            if (combined.length < GCM_IV_LENGTH) {
                return encryptedBase64;
            }
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] cipherText = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(combined, GCM_IV_LENGTH, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(ALG);
            cipher.init(
                    Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] plain = cipher.doFinal(cipherText);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.debug("API key decryption failed, returning as plain (legacy?): {}", e.getMessage());
            return encryptedBase64;
        }
    }
}
