package com.nta.common.exception;

import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.fasterxml.jackson.core.io.JsonEOFException;
import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    // Bắt exception trung trung
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Object>> runtimeExceptionHandler(Exception e) {
        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(999);

        log.error("Unexpected error: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError().body(apiResponse);
    }

    // Exception tự tạo
    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<Object>> appExceptionHandler(AppException e) {
        // Lấy errorcode đường truyền vào khi thor new AppException
        ErrorCode errorCode = e.getErrorCode();

        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(errorCode.getMessage());
        apiResponse.setCode(errorCode.getCode());

        log.warn("AppException: {} - {}", errorCode.getCode(), errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    // Exception khi validate cac filed
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Object>> methodArgumentNotValidExceptionHandler(MethodArgumentNotValidException e) {
        // getFieldErro() còn có thể xác định lỗi ở filed nào, dữ liệu đầu vào là gi....
        String enumKey = e.getFieldError().getDefaultMessage();

        ErrorCode errorCode = ErrorCode.ERROR_KEY_INVALID;
        try {
            // Lấy ra enum ErrorCode bằng tên mà đã được truyền khi validate
            errorCode = ErrorCode.valueOf(enumKey);
            // validate
        } catch (IllegalArgumentException iae) {
            // Trong trường hợp validate mà truyền sai enum name
        }
        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode == ErrorCode.ERROR_KEY_INVALID ? enumKey : errorCode.getMessage());

        log.warn("Validation failed: {} - {}", errorCode.getCode(), enumKey);
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(JwtException.class)
    ResponseEntity<ApiResponse<Object>> jwtExceptionHandler(JwtException e) {
        log.warn("JWT validation failed: {}", e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.INVALID_TOKEN.getCode());
        apiResponse.setMessage(ErrorCode.INVALID_TOKEN.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(AuthenticationServiceException.class)
    ResponseEntity<ApiResponse<Object>> authenticationServiceHandler(AuthenticationServiceException e) {
        log.warn("Authentication failed: {}", e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.INVALID_TOKEN.getCode());
        apiResponse.setMessage(ErrorCode.INVALID_TOKEN.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(FeignException.FeignClientException.class)
    ResponseEntity<ApiResponse<Object>> feignClientExeption(FeignException e) {
        log.error("Feign client error: {}", e.getMessage(), e);
        return null;
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception) {
        log.warn("Access denied: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = JsonEOFException.class)
    ResponseEntity<ApiResponse> jsonEOFExceptionHandler(JsonEOFException e) {
        log.warn("JSON parse error: {}", e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.JSON_PARSE_ERROR.getCode());
        apiResponse.setMessage(ErrorCode.JSON_PARSE_ERROR.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = NonTransientAiException.class)
    ResponseEntity<ApiResponse> nonTransientAiException(NonTransientAiException e) {
        log.error("AI API error: {}", e.getMessage(), e);

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.AI_API_KEY_INVALID.getCode());
        apiResponse.setMessage(ErrorCode.AI_API_KEY_INVALID.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }
}
