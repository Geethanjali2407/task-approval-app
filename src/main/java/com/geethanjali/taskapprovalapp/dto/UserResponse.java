package com.geethanjali.taskapprovalapp.dto;

import com.geethanjali.taskapprovalapp.entity.Role;

public record UserResponse(
        Long id,
        String name,
        String username,
        Role role
) {}
