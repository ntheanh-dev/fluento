package com.nta.common.enums;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    ERROR_KEY_INVALID(1001, "Không tìm thấy errorcode tương ứng", HttpStatus.INTERNAL_SERVER_ERROR),
    USERNAME_EXISTED(1002, "This username has already existed", HttpStatus.CONFLICT),
    USER_NOT_EXISTED(1006, "User not existed", HttpStatus.NOT_FOUND),
    PASSWORD_INVALID(1003, "password phải ít nhất 8 kí tự", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(1008, "Invalid token", HttpStatus.BAD_REQUEST),
    INCORRECT_PASSWORD(1009, "Invalid password", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1012, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    UNSUPPORTED_SOCIAL_LOGIN(1013, "Unsupported social login", HttpStatus.BAD_REQUEST),
    PASSWORD_EXISTED(1014, "Password already created", HttpStatus.BAD_REQUEST),
    UNABLE_TO_USE_REFRESH_TOKEN_TO_ACCESS_RESOURCE(
            1010, "Unable to use refresh token to access resource", HttpStatus.BAD_REQUEST),
    AI_API_KEY_MISSING(1100, "Thiếu API key AI", HttpStatus.BAD_REQUEST),
    AI_API_KEY_INVALID(1101, "API key không hợp lệ hoặc đã đạt giới hạn", HttpStatus.BAD_REQUEST),
    JSON_PARSE_ERROR(1015, "Lỗi khi parse JSON, hãy thử lại", HttpStatus.INTERNAL_SERVER_ERROR),
    ACCESS_DENIED(2003, "Access denied", HttpStatus.FORBIDDEN),
    API_KEY_EXISTED(2008, "API key already exists", HttpStatus.BAD_REQUEST),
    TEXT_TO_SPEECH_ERROR(3001, "Error during text-to-speech synthesis", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_WRITE_ERROR(3002, "Error writing audio bytes to file", HttpStatus.INTERNAL_SERVER_ERROR),
    THIS_METHOD_DOES_NOTE_SUPPORT_YET(9001, "This method does not support yet", HttpStatus.BAD_REQUEST);
    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
