package com.geethanjali.taskapprovalapp.service;

import com.geethanjali.taskapprovalapp.dto.ApproveRejectRequest;
import com.geethanjali.taskapprovalapp.dto.CreateTaskRequest;
import com.geethanjali.taskapprovalapp.dto.TaskResponse;
import com.geethanjali.taskapprovalapp.entity.Role;
import com.geethanjali.taskapprovalapp.entity.Task;
import com.geethanjali.taskapprovalapp.entity.TaskStatus;
import com.geethanjali.taskapprovalapp.exception.ConflictException;
import com.geethanjali.taskapprovalapp.exception.ForbiddenException;
import com.geethanjali.taskapprovalapp.exception.NotFoundException;
import com.geethanjali.taskapprovalapp.repo.TaskRepository;
import com.geethanjali.taskapprovalapp.repo.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    public TaskService(TaskRepository taskRepo, UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    public TaskResponse create(CreateTaskRequest req) {
        var assignedUser = userRepo.findById(req.assignedUserId())
                .orElseThrow(() -> new NotFoundException("Assigned user not found: " + req.assignedUserId()));

        Task t = new Task();
        t.setTitle(req.title());
        t.setDescription(req.description());
        t.setDateTime(req.dateTime());
        t.setPriority(req.priority());
        t.setAssignedUser(assignedUser);
        t.setStatus(TaskStatus.PENDING);

        Task saved = taskRepo.save(t);

        System.out.println("[NOTIFY] Task created: id=" + saved.getId() + " assignedTo=" + assignedUser.getUsername());

        return toResponse(saved);
    }

    public List<TaskResponse> list(Optional<TaskStatus> statusOpt, String sortBy, String direction) {
        Sort.Direction dir = Sort.Direction.fromString(direction == null ? "desc" : direction);

        // Allow only safe sort fields
        String safeSort = switch (sortBy == null ? "createdDate" : sortBy) {
            case "createdDate", "dateTime", "priority" -> sortBy;
            default -> "createdDate";
        };

        Sort sort = Sort.by(dir, safeSort);

        List<Task> tasks = statusOpt
                .map(s -> taskRepo.findByStatus(s, sort))
                .orElseGet(() -> taskRepo.findAll(sort));

        return tasks.stream().map(this::toResponse).toList();
    }

    public TaskResponse approveOrReject(Long id, ApproveRejectRequest req, Principal principal) {
        // Get actor from DB
        var actor = userRepo.findByUsername(principal.getName())
                .orElseThrow(() -> new NotFoundException("Logged-in user not found: " + principal.getName()));

        if (actor.getRole() != Role.MANAGER && actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only MANAGER/ADMIN can approve or reject tasks");
        }

        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found: " + id));

        if (task.getStatus() != TaskStatus.PENDING) {
            throw new ConflictException("Only PENDING tasks can be approved/rejected");
        }

        TaskStatus newStatus = req.approve() ? TaskStatus.APPROVED : TaskStatus.REJECTED;
        task.setStatus(newStatus);

        Task saved = taskRepo.save(task);

        System.out.println("[NOTIFY] Task " + id + " -> " + newStatus +
                " by " + actor.getUsername() + " comment=" + (req.comment() == null ? "" : req.comment()));

        return toResponse(saved);
    }

    private TaskResponse toResponse(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getDateTime(),
                t.getPriority(),
                t.getStatus(),
                t.getAssignedUser().getId(),
                t.getAssignedUser().getName(),
                t.getCreatedDate()
        );
    }
}
