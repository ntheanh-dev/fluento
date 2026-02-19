package com.nta.common.service.cloudinary;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nta.common.config.CloudinaryConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryFileUploadService implements FileUploadService {

    private final Cloudinary cloudinary;
    private final CloudinaryConfig cloudinaryConfig;

    @Override
    public Map<String, Object> uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, cloudinaryConfig.getFolder());
    }

    @Override
    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            // Validate file
            validateFile(file);

            // Prepare upload options
            Map<String, Object> uploadOptions = new HashMap<>();
            uploadOptions.put("public_id", file.getOriginalFilename());
            uploadOptions.put("folder", folder);
            uploadOptions.put("resource_type", "auto"); // Auto-detect file type
            uploadOptions.put("overwrite", true);

            // Upload file
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadOptions);

            log.info("Successfully uploaded file: {} to folder: {}", file.getOriginalFilename(), folder);
            return result;

        } catch (Exception e) {
            log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
            throw new IOException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> deleteFile(String publicId) throws IOException {
        try {
            // Try to delete as image first
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "image");

            Map<String, Object> result = cloudinary.uploader().destroy(publicId, options);
            String resultStatus = (String) result.get("result");

            // If image deletion failed, try as video/audio
            if (!"ok".equals(resultStatus)) {
                options.put("resource_type", "video");
                result = cloudinary.uploader().destroy(publicId, options);
            }
            return result;

        } catch (Exception e) {
            log.error("Failed to delete file with public ID: {}", publicId, e);
            throw new IOException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> getFileInfo(String publicId) throws IOException {
        try {
            Map<String, Object> result = cloudinary.api().resource(publicId, ObjectUtils.emptyMap());

            log.info("Successfully retrieved file info for public ID: {}", publicId);
            return result;

        } catch (Exception e) {
            log.error("Failed to get file info for public ID: {}", publicId, e);
            throw new IOException("Failed to get file info: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> generateSignedUrl(String publicId, long expirationTime) throws IOException {
        try {
            long expiresAt = System.currentTimeMillis() / 1000 + expirationTime;

            // Generate regular URL (signed URLs require additional configuration)
            String url =
                    cloudinary.url().resourceType("image").publicId(publicId).generate();

            Map<String, Object> result = new HashMap<>();
            result.put("signed_url", url);
            result.put("expires_at", expiresAt);
            result.put("public_id", publicId);
            result.put("note", "Regular URL generated - signed URLs require additional Cloudinary configuration");

            log.info("Successfully generated URL for public ID: {}", publicId);
            return result;

        } catch (Exception e) {
            log.error("Failed to generate URL for public ID: {}", publicId, e);
            throw new IOException("Failed to generate URL: " + e.getMessage(), e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        if (file.getOriginalFilename() == null
                || file.getOriginalFilename().trim().isEmpty()) {
            throw new IllegalArgumentException("File must have a valid name");
        }

        // Check file size (limit to 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size cannot exceed 10MB");
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (extension == null || extension.isEmpty()) {
            throw new IllegalArgumentException("File must have a valid extension");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }

        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return null;
        }

        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
}
