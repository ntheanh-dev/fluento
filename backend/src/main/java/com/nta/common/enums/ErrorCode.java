package com.nta.common.enums;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // Validation errors (9xx)
    ERROR_KEY_INVALID(900, "Không tìm thấy errorcode tương ứng", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_BLANK(901, "Trường này không được để trống", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(902, "Tên đăng nhập không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(903, "Mật khẩu không hợp lệ", HttpStatus.BAD_REQUEST),
    NOT_NULL(904, "Trường này không được null", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(905, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    CURRENT_PASSWORD_INVALID(906, "Mật khẩu hiện tại không hợp lệ", HttpStatus.BAD_REQUEST),
    VALIDATION_PASSWORD_INVALID(907, "Mật khẩu phải có từ 8 đến 20 ký tự", HttpStatus.BAD_REQUEST),
    FULL_NAME_INVALID(909, "Họ tên không hợp lệ (tối đa 255 ký tự)", HttpStatus.BAD_REQUEST),
    UPLOAD_FILE_ERROR(908, "Error when uploading file", HttpStatus.INTERNAL_SERVER_ERROR),
    UPDATE_ME_EMPTY(910, "Cần gửi ít nhất một phần: profile hoặc avatar", HttpStatus.BAD_REQUEST),
    AVATAR_FILE_TYPE_INVALID(911, "Avatar phải là ảnh (JPEG, PNG, GIF, WebP)", HttpStatus.BAD_REQUEST),
    AVATAR_FILE_SIZE_INVALID(912, "Kích thước avatar tối đa 5MB", HttpStatus.BAD_REQUEST),

    // Authentication & user errors (10xx)
    USERNAME_EXISTED(1002, "This username has already existed", HttpStatus.CONFLICT),
    EMAIL_EXISTED(1003, "This email has already existed", HttpStatus.CONFLICT),
    USER_NOT_EXISTED(1006, "User not existed", HttpStatus.NOT_FOUND),
    INVALID_TOKEN(1008, "Invalid token", HttpStatus.BAD_REQUEST),
    INCORRECT_PASSWORD(1009, "Invalid password", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1012, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    UNSUPPORTED_SOCIAL_LOGIN(1013, "Unsupported social login", HttpStatus.BAD_REQUEST),
    PASSWORD_EXISTED(1014, "Password already created", HttpStatus.BAD_REQUEST),
    UNABLE_TO_USE_REFRESH_TOKEN_TO_ACCESS_RESOURCE(
            1010, "Unable to use refresh token to access resource", HttpStatus.BAD_REQUEST),

    // AI & JSON errors (11xx, 10xx)
    AI_API_KEY_MISSING(1100, "Thiếu API key AI", HttpStatus.BAD_REQUEST),
    AI_API_KEY_INVALID(1101, "API key không hợp lệ hoặc đã đạt giới hạn", HttpStatus.BAD_REQUEST),
    JSON_PARSE_ERROR(1015, "Lỗi khi parse JSON, hãy thử lại", HttpStatus.INTERNAL_SERVER_ERROR),
    AI_API_KEY_MISSING_FOR_USER(1102, "Hãy thêm API Key để sử dụng tính năng này", HttpStatus.BAD_REQUEST),
    AI_API_KEY_REACHED_DAILY_LIMIT(1103, "API key đã đạt giới hạn hàng ngày", HttpStatus.BAD_REQUEST),
    AI_RESPONSE_PARSE_ERROR(1104, "Lỗi khi parse phản hồi từ AI, hãy thử lại", HttpStatus.INTERNAL_SERVER_ERROR),
    TRY_AGAIN_LATER(1105, "Đã có lỗi xảy ra, vui lòng thử lại", HttpStatus.INTERNAL_SERVER_ERROR),
    AI_EXHAUSTED(
            1106,
            "AI model đã hết khả năng phản hồi trong ngày, vui lòng chuyển sang model khác hoặc thử lại vào ngày hôm sau",
            HttpStatus.BAD_REQUEST),
    AI_INPUT_TOO_LONG(1107, "Đầu vào quá dài, vui lòng rút ngắn để sử dụng", HttpStatus.BAD_REQUEST),
    // Access & API key errors (20xx)
    ACCESS_DENIED(2003, "Access denied", HttpStatus.FORBIDDEN),
    API_KEY_EXISTED(2008, "API key already exists", HttpStatus.BAD_REQUEST),
    PROVIDER_API_KEY_NOT_FOUND(2009, "Provider API key not found", HttpStatus.NOT_FOUND),
    AI_MODEL_NOT_FOUND(2010, "AI model not found", HttpStatus.NOT_FOUND),
    AI_MODEL_NOT_BELONG_TO_KEY(2011, "AI model does not belong to the selected API key", HttpStatus.BAD_REQUEST),

    // File & TTS errors (30xx)
    TEXT_TO_SPEECH_ERROR(3001, "Error during text-to-speech synthesis", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_WRITE_ERROR(3002, "Error writing audio bytes to file", HttpStatus.INTERNAL_SERVER_ERROR),

    // Generic errors (90xx)
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
