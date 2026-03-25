package com.nta.domain.admin.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.role.Role;

import lombok.RequiredArgsConstructor;

@RestController("adminRoleController")
@RequestMapping("/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {

    private final com.nta.domain.role.Repository roleRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Role>> list() {
        return ApiResponse.<List<Role>>builder()
                .result(roleRepository.findAll())
                .build();
    }
}
