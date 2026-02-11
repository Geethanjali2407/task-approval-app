# Task Approval Workflow

## Overview

This application implements a simple approval workflow for tasks/bookings.

Each task goes through a controlled state transition process with role-based authorization.

---

## Task Lifecycle

Each task has a `status` field with the following possible values:

- **PENDING**
- **APPROVED**
- **REJECTED**

---

## Default Behavior

When a task is created via:

POST /tasks

The system automatically sets:

status = PENDING

This ensures all tasks must go through the approval process.

---

## Allowed State Transitions

The following transitions are allowed:

PENDING → APPROVED  
PENDING → REJECTED

---

## Disallowed Transitions

The following transitions are NOT allowed:

APPROVED → any other state  
REJECTED → any other state  
APPROVED → REJECTED  
REJECTED → APPROVED

If a disallowed transition is attempted, the API returns:

HTTP 409 Conflict  
Message: "Only PENDING tasks can be approved/rejected"

This prevents inconsistent or invalid workflow states.

---

## Role-Based Authorization

The system enforces role-based access control.

### USER
- Can create tasks
- Can view tasks
- Cannot approve/reject tasks

If a USER attempts to approve/reject:

HTTP 403 Forbidden

---

### MANAGER
- Can create tasks
- Can view tasks
- Can approve or reject PENDING tasks

---

### ADMIN
- Same privileges as MANAGER
- Can approve/reject PENDING tasks

---

## Security Enforcement

Authorization is implemented using Spring Security.

- Basic Authentication is required for all endpoints
- Role validation occurs in the service layer before status updates
- Passwords are stored as BCrypt hashes

---

## Notification Simulation

For each significant workflow event, a console log is generated:

- Task created
- Task approved
- Task rejected

Example:

Notification: Task 3 status changed to APPROVED

This simulates a real-world notification mechanism (email/event).

---

## Error Handling Strategy

The application returns meaningful HTTP responses:

- 401 Unauthorized → Invalid login
- 403 Forbidden → Insufficient role permissions
- 409 Conflict → Invalid state transition
- 400 Bad Request → Invalid request body

This ensures API behavior is predictable and REST-compliant.

---

## Design Decisions

- Status transitions are controlled centrally in the service layer.
- Role checks are performed before any state change.
- Tasks cannot be modified once approved/rejected to maintain workflow integrity.
- Filtering and sorting are handled at repository level for scalability.

---

## Summary

The workflow ensures:

- Controlled task lifecycle
- Role-based approval enforcement
- Clear and predictable state transitions
- Clean separation of concerns (Controller → Service → Repository)

This implementation provides a simple but production-style approval mechanism.
