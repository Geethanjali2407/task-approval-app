package com.geethanjali.taskapprovalapp.dto;

import jakarta.validation.constraints.NotNull;

public record ApproveRejectRequest(
        @NotNull Boolean approve,
        String comment
) {}
