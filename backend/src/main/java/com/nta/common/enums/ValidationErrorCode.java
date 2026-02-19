package com.nta.common.enums;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ValidationErrorCode {
    ERROR_KEY_INVALID(900, "Không tìm thấy errorcode tương ứng", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_BLANK(901, "Trường này không được để trống", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(902, "Tên đăng nhập không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(903, "Mật khẩu không hợp lệ", HttpStatus.BAD_REQUEST),
    NOT_NULL(904, "Trường này không được null", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(905, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    ;

    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ValidationErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
