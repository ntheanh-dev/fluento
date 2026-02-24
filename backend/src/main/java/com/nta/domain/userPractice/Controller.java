package com.nta.domain.userPractice;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("userPracticeController")
@RequestMapping("/user-practices")
@Tag(name = "User Practice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @PostMapping
    ApiResponse<UserPracticeResponse> create(@RequestBody @Valid CreateParagraphRequest request) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.create(request))
                .build();
    }
}
