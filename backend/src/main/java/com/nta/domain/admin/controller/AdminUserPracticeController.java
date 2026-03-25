package com.nta.domain.admin.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.userPractice.Mapper;
import com.nta.domain.userPractice.Repository;
import com.nta.domain.userPractice.UserPractice;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;

import lombok.RequiredArgsConstructor;

@RestController("adminUserPracticeController")
@RequestMapping("/admin/user-practices")
@RequiredArgsConstructor
public class AdminUserPracticeController {

    private final Repository userPracticeRepository;
    private final Mapper userPracticeMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<UserPracticeResponse>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Type typeEnum = type != null && !type.isBlank() ? Type.fromString(type) : null;
        Topic topicEnum = topic != null && !topic.isBlank() ? Topic.fromString(topic) : null;
        Level levelEnum = level != null && !level.isBlank() ? Level.fromString(level) : null;
        String searchTrimmed = search != null && !search.isBlank() ? search.trim() : null;

        Sort sortObj = "asc".equalsIgnoreCase(sort)
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        PageRequest pageable = PageRequest.of(page, size, sortObj);

        Page<UserPractice> practicePage;
        if (userId != null) {
            practicePage = userPracticeRepository.findByUserIdAndFilters(
                    userId, typeEnum, topicEnum, levelEnum, searchTrimmed, pageable);
        } else {
            practicePage =
                    userPracticeRepository.findAllWithFilters(typeEnum, topicEnum, levelEnum, searchTrimmed, pageable);
        }

        List<UserPracticeResponse> responses = practicePage.getContent().stream()
                .map(p -> userPracticeMapper.toUserPracticeResponse(p))
                .collect(Collectors.toList());

        return ApiResponse.<Page<UserPracticeResponse>>builder()
                .result(new PageImpl<>(responses, practicePage.getPageable(), practicePage.getTotalElements()))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserPracticeResponse> get(@PathVariable Long id) {
        UserPractice practice =
                userPracticeRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return ApiResponse.<UserPracticeResponse>builder()
                .result(userPracticeMapper.toUserPracticeResponse(practice))
                .build();
    }
}
