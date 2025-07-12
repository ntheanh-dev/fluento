package com.nta.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

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
    ;

    private int code;
    private String message;
    private HttpStatusCode statusCode;
    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
