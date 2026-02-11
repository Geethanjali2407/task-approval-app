package com.geethanjali.taskapprovalapp.dto;

import com.geethanjali.taskapprovalapp.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateTaskRequest(
        @NotBlank String title,
        String description,
        @NotNull Instant dateTime,
        @NotNull Priority priority,
        @NotNull Long assignedUserId
) {}
