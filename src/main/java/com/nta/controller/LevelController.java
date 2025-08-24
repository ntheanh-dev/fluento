package com.nta.controller;

import com.nta.dto.response.ApiResponse;
import com.nta.entity.Level;
import com.nta.service.LevelService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/levels")
@RequiredArgsConstructor
public class LevelController {
    private final LevelService levelService;

    @GetMapping("")
    ApiResponse<List<Level>> findAll() {
        return ApiResponse.<List<Level>>builder().result(levelService.findAll()).build();
    }
}
