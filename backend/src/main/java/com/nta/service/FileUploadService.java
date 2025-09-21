package com.nta.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for file upload operations to cloud storage.
 * Provides methods for uploading files and managing cloud storage resources.
 */
public interface FileUploadService {

    /**
     * Uploads a file to cloud storage.
     *
     * @param file the file to upload
     * @return a map containing upload result information including URL, public ID, etc.
     * @throws IOException if file upload fails
     */
    Map<String, Object> uploadFile(MultipartFile file) throws IOException;

    /**
     * Uploads a file to cloud storage with specific folder path.
     *
     * @param file the file to upload
     * @param folder the folder path where the file should be stored
     * @return a map containing upload result information including URL, public ID, etc.
     * @throws IOException if file upload fails
     */
    Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException;

    /**
     * Deletes a file from cloud storage using its public ID.
     *
     * @param publicId the public ID of the file to delete
     * @return a map containing deletion result information
     * @throws IOException if file deletion fails
     */
    Map<String, Object> deleteFile(String publicId) throws IOException;

    /**
     * Gets file information from cloud storage using its public ID.
     *
     * @param publicId the public ID of the file
     * @return a map containing file information
     * @throws IOException if file retrieval fails
     */
    Map<String, Object> getFileInfo(String publicId) throws IOException;

    /**
     * Generates a signed URL for secure file access.
     *
     * @param publicId the public ID of the file
     * @param expirationTime the expiration time in seconds
     * @return a map containing the signed URL and expiration information
     * @throws IOException if URL generation fails
     */
    Map<String, Object> generateSignedUrl(String publicId, long expirationTime) throws IOException;
}
