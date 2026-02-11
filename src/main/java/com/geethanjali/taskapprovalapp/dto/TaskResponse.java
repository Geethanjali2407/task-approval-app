package com.geethanjali.taskapprovalapp.dto;

import com.geethanjali.taskapprovalapp.entity.Priority;
import com.geethanjali.taskapprovalapp.entity.TaskStatus;

import java.time.Instant;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Instant dateTime,
        Priority priority,
        TaskStatus status,
        Long assignedUserId,
        String assignedUserName,
        Instant createdDate
) {}
