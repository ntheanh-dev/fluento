package com.nta.controller;

import com.nta.dto.response.ApiResponse;
import com.nta.entity.TopicGroup;
import com.nta.service.TopicService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/topicGroups")
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class TopicGroupController {
    TopicService topicService;

    @GetMapping("")
    ApiResponse<List<TopicGroup>> getAllTopicGroup() {
        return ApiResponse.<List<TopicGroup>>builder()
                .result(topicService.getAllTopicByGroup())
                .build();
    }
}
