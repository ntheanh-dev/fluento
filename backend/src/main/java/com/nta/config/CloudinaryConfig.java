package com.nta.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "cloudinary")
@Data
public class CloudinaryConfig {

    /**
     * Cloudinary cloud name
     */
    private String cloudName;

    /**
     * Cloudinary API key
     */
    private String apiKey;

    /**
     * Cloudinary API secret
     */
    private String apiSecret;

    /**
     * Whether to use secure URLs (HTTPS)
     */
    private boolean secure = true;

    /**
     * Default folder for uploaded files
     */
    private String folder = "luyenviet";

    /**
     * Creates and configures Cloudinary bean.
     *
     * @return configured Cloudinary instance
     */
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", this.cloudName);
        config.put("api_key", this.apiKey);
        config.put("api_secret", this.apiSecret);
        config.put("secure", String.valueOf(this.secure));

        return new Cloudinary(config);
    }
}
