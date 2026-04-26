package com.nta.common.enums;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // Validation errors (9xx)
    RESOURCE_NOT_FOUND(899, "Resource not found", HttpStatus.NOT_FOUND),
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
    INVALID_TARGET_LANGUAGE(913, "Target language không hợp lệ", HttpStatus.BAD_REQUEST),

    // Authentication & user errors (10xx)
    USERNAME_EXISTED(1002, "Tên đăng nhập đã tồn tại", HttpStatus.CONFLICT),
    EMAIL_EXISTED(1003, "Email đã tồn tại", HttpStatus.CONFLICT),
    USER_NOT_EXISTED(1006, "Tài khoản không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_TOKEN(1008, "Token không hợp lệ", HttpStatus.BAD_REQUEST),
    INCORRECT_PASSWORD(1009, "Mật khẩu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1012, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    UNSUPPORTED_SOCIAL_LOGIN(1013, "Không hỗ trợ đăng nhập bằng social", HttpStatus.BAD_REQUEST),
    PASSWORD_EXISTED(1014, "Mật khẩu đã tồn tại", HttpStatus.BAD_REQUEST),
    UNABLE_TO_USE_REFRESH_TOKEN_TO_ACCESS_RESOURCE(
            1010, "Không thể sử dụn refresh token để truy cập tài nguyên", HttpStatus.BAD_REQUEST),

    // AI & JSON errors (11xx, 10xx)
    AI_API_KEY_MISSING(1100, "Thiếu API key AI", HttpStatus.BAD_REQUEST),
    AI_API_KEY_INVALID(1101, "API key không hợp lệ", HttpStatus.BAD_REQUEST),
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
    AI_TOO_MANY_REQUESTS(1108, "AI hiện quá tải, vui lòng thử lại sau", HttpStatus.TOO_MANY_REQUESTS),
    // Access & API key errors (20xx)
    ACCESS_DENIED(2003, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    API_KEY_EXISTED(2008, "API key này đã tồn tại", HttpStatus.BAD_REQUEST),
    PROVIDER_API_KEY_NOT_FOUND(2009, "Provider API key không tồn tại", HttpStatus.NOT_FOUND),
    AI_MODEL_NOT_FOUND(2010, "AI model không tồn tại", HttpStatus.NOT_FOUND),
    AI_MODEL_NOT_BELONG_TO_KEY(2011, "AI model không thuộc về API key đã chọn", HttpStatus.BAD_REQUEST),

    // PARAGRAPH, USERPRACTICE
    NOT_OWN_PRACTICE(4000, "Bạn không phải là chủ của bài tập này", HttpStatus.NOT_ACCEPTABLE),
    PARAGRAPH_NOT_FOUND(4001, "Bài tập không tồn tại", HttpStatus.NOT_FOUND),
    // CREDIT, PAYMENT
    NOT_ENOUGH_CREDITS(4001, "Bạn không đủ credits để sử dụng tính năng này", HttpStatus.BAD_REQUEST),
    THIS_MODEL_NOT_ENOUGH_CREDITS(4002, "Model này đã hết credit", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH_COINS(4003, "Không đủ coin để đổi", HttpStatus.BAD_REQUEST),
    COIN_EXCHANGE_INVALID(4004, "Gói đổi coin không hợp lệ", HttpStatus.BAD_REQUEST),

    // Generic errors (90xx)
    THIS_METHOD_DOES_NOTE_SUPPORT_YET(9001, "Phương thức này không được hỗ trợ", HttpStatus.BAD_REQUEST);
    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
