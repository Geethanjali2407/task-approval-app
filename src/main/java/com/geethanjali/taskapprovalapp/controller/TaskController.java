package com.geethanjali.taskapprovalapp.controller;

import com.geethanjali.taskapprovalapp.dto.ApproveRejectRequest;
import com.geethanjali.taskapprovalapp.dto.CreateTaskRequest;
import com.geethanjali.taskapprovalapp.dto.TaskResponse;
import com.geethanjali.taskapprovalapp.entity.TaskStatus;
import com.geethanjali.taskapprovalapp.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // POST /tasks
    @PostMapping
    public TaskResponse create(@Valid @RequestBody CreateTaskRequest req) {
        return taskService.create(req);
    }

    // GET /tasks?status=PENDING&sortBy=dateTime&direction=asc
    @GetMapping
    public List<TaskResponse> list(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return taskService.list(Optional.ofNullable(status), sortBy, direction);
    }

    // PUT /tasks/{id}/approve   body: { "approve": true, "comment": "ok" }
    @PutMapping("/{id}/approve")
    public TaskResponse approveOrReject(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRejectRequest req,
            Principal principal
    ) {
        return taskService.approveOrReject(id, req, principal);
    }
}

