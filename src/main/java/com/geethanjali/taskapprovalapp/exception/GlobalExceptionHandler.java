package com.geethanjali.taskapprovalapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NotFoundException.class)
    public Map<String, Object> notFound(NotFoundException ex) {
        return Map.of("error", "NOT_FOUND", "message", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(ForbiddenException.class)
    public Map<String, Object> forbidden(ForbiddenException ex) {
        return Map.of("error", "FORBIDDEN", "message", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(ConflictException.class)
    public Map<String, Object> conflict(ConflictException ex) {
        return Map.of("error", "CONFLICT", "message", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public Map<String, Object> validation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        return Map.of("error", "VALIDATION_ERROR", "message", "Invalid request");
    }
}
