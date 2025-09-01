package com.nta.controller;

import com.nta.dto.response.ApiResponse;
import com.nta.entity.Tone;
import com.nta.service.ToneService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tones")
@RequiredArgsConstructor
public class ToneController {
    private final ToneService toneService;

    @GetMapping("")
    ApiResponse<List<Tone>> findAll() {
        return ApiResponse.<List<Tone>>builder().result(toneService.findAll()).build();
    }
}


