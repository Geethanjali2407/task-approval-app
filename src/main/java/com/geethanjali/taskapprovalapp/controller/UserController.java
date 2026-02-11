package com.geethanjali.taskapprovalapp.controller;

import com.geethanjali.taskapprovalapp.dto.UserResponse;
import com.geethanjali.taskapprovalapp.repo.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET /users
    @GetMapping
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getName(), u.getUsername(), u.getRole()))
                .toList();
    }
}
