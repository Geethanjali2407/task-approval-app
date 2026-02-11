package com.geethanjali.taskapprovalapp.security;

import com.geethanjali.taskapprovalapp.entity.Role;
import com.geethanjali.taskapprovalapp.entity.User;
import com.geethanjali.taskapprovalapp.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createIfNotExists(userRepository, passwordEncoder, "user1", "Geethanjali User", "pass", Role.USER);
            createIfNotExists(userRepository, passwordEncoder, "manager1", "Geethanjali Manager", "pass", Role.MANAGER);
            createIfNotExists(userRepository, passwordEncoder, "admin1", "Geethanjali Admin", "pass", Role.ADMIN);
        };
    }

    private void createIfNotExists(UserRepository repo,
                                   PasswordEncoder encoder,
                                   String username,
                                   String name,
                                   String rawPassword,
                                   Role role) {

        if (repo.findByUsername(username).isPresent()) return;

        User u = new User();
        u.setUsername(username);
        u.setName(name);
        u.setRole(role);

        // IMPORTANT: store encoded password
        u.setPassword(encoder.encode(rawPassword));

        repo.save(u);

        System.out.println("[SEED] Created user: " + username + " role=" + role);
    }
}
