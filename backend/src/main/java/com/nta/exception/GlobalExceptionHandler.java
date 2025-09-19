package com.nta.exception;

import com.fasterxml.jackson.core.io.JsonEOFException;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.nta.dto.response.ApiResponse;
import com.nta.enums.ErrorCode;
import com.nta.enums.ValidationErrorCode;

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

        log.error(e.getMessage());
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

        log.error(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    // Exception khi validate cac filed
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Object>> methodArgumentNotValidExceptionHandler(MethodArgumentNotValidException e) {
        // getFieldErro() còn có thể xác định lỗi ở filed nào, dữ liệu đầu vào là gi....
        String enumKey = e.getFieldError().getDefaultMessage();

        ValidationErrorCode errorCode = ValidationErrorCode.ERROR_KEY_INVALID;
        try {
            errorCode = ValidationErrorCode.valueOf(enumKey); // Lấy ra enum Errorcode bằng tên mà đã được truyền khi
            // validate
        } catch (IllegalArgumentException iae) {
            // Trong trường hợp validate mà truyền sai enum name
        }
        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        log.error(errorCode.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(JwtException.class)
    ResponseEntity<ApiResponse<Object>> jwtExceptionHandler(JwtException e) {
        log.error(e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.INVALID_TOKEN.getCode());
        apiResponse.setMessage(ErrorCode.INVALID_TOKEN.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(AuthenticationServiceException.class)
    ResponseEntity<ApiResponse<Object>> authenticationServiceHandler(AuthenticationServiceException e) {
        log.error(e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.INVALID_TOKEN.getCode());
        apiResponse.setMessage(ErrorCode.INVALID_TOKEN.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(FeignException.FeignClientException.class)
    ResponseEntity<ApiResponse<Object>> feignClientExeption(FeignException e) {
        log.error(e.getMessage());

        return null;
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = JsonEOFException.class)
    ResponseEntity<ApiResponse> jsonEOFExceptionHandler(JsonEOFException e) {
        log.error(e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.JSON_PARSE_ERROR.getCode());
        apiResponse.setMessage(ErrorCode.JSON_PARSE_ERROR.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = NonTransientAiException.class)
    ResponseEntity<ApiResponse> nonTransientAiException(NonTransientAiException e) {
        log.error(e.getMessage());

        ApiResponse<Object> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.AI_API_KEY_INVALID.getCode());
        apiResponse.setMessage(ErrorCode.AI_API_KEY_INVALID.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

}
