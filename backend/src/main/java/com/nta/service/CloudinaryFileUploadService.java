package com.nta.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nta.configuration.CloudinaryConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of FileUploadService using Cloudinary.
 * Provides file upload, deletion, and management functionality.
 */
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

            // Generate unique public ID
            String publicId = generatePublicId(file.getOriginalFilename(), folder);

            // Prepare upload options
            Map<String, Object> uploadOptions = new HashMap<>();
            uploadOptions.put("public_id", publicId);
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
            // Specify resource type as "image" for image files
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "image");

            Map<String, Object> result = cloudinary.uploader().destroy(publicId, options);

            log.debug("Delete result for public ID {}: {}", publicId, result);

            // Check if deletion was actually successful
            String resultStatus = (String) result.get("result");
            if (!"ok".equals(resultStatus)) {
                log.warn("File deletion may not have been successful. Result: {}", result);
                throw new IOException("File deletion failed. Result: " + result);
            }

            // Verify file was actually deleted by checking if it still exists
            try {
                Thread.sleep(1000); // Wait 1 second for Cloudinary to process
                if (fileExists(publicId)) {
                    log.warn("File still exists after deletion attempt: {}", publicId);
                    throw new IOException("File deletion verification failed - file still exists");
                } else {
                    log.debug("File deletion verified - file no longer exists: {}", publicId);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for deletion verification");
            }

            log.info("Successfully deleted file with public ID: {}", publicId);
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

    /**
     * Validates the uploaded file.
     *
     * @param file the file to validate
     * @throws IllegalArgumentException if file is invalid
     */
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

    /**
     * Generates a unique public ID for the file.
     *
     * @param originalFilename the original filename
     * @param folder the folder path
     * @return unique public ID
     */
    private String generatePublicId(String originalFilename, String folder) {
        String extension = getFileExtension(originalFilename);
        String baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));

        // Clean the base name (remove special characters)
        String cleanBaseName = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");

        // Generate unique ID
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);

        return folder + "/" + cleanBaseName + "_" + uniqueId;
    }

    /**
     * Extracts file extension from filename.
     *
     * @param filename the filename
     * @return file extension (without dot) or null if not found
     */
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

    /**
     * Verifies if a file still exists on Cloudinary.
     *
     * @param publicId the public ID to check
     * @return true if file exists, false otherwise
     */
    public boolean fileExists(String publicId) {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "image");

            cloudinary.api().resource(publicId, options);
            log.debug("File exists on Cloudinary: {}", publicId);
            return true;
        } catch (Exception e) {
            // File doesn't exist or error occurred
            log.debug("File does not exist on Cloudinary: {}", publicId);
            return false;
        }
    }
}
