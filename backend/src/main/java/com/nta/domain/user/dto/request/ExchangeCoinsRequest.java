package com.nta.domain.user.dto.request;

import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Đổi coin lấy credit: chỉ các mức coin được phép (10, 20, 50, 100)")
public class ExchangeCoinsRequest {

    @NotNull(message = "NOT_NULL")
    @Schema(description = "Số coin trả (một trong: 10, 20, 50, 100)", example = "10")
    Integer coins;
}
