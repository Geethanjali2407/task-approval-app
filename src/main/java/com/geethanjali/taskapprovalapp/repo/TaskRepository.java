package com.geethanjali.taskapprovalapp.repo;

import com.geethanjali.taskapprovalapp.entity.Task;
import com.geethanjali.taskapprovalapp.entity.TaskStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status, Sort sort);
    List<Task> findAll(Sort sort);
}
