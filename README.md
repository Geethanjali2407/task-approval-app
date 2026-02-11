# Task & Booking Management Application
A form-based web application to create, manage, and approve tasks/bookings using a Java Spring Boot backend and a simple approval workflow.

---

## 📌 What This Application Does

This application allows users to:

- Create tasks/bookings
- View tasks based on status
- Filter and sort tasks
- Approve or reject tasks (role-based)
- Enforce controlled workflow transitions

Each task follows a structured approval lifecycle:

PENDING → APPROVED / REJECTED

Only authorized roles (MANAGER / ADMIN) can approve or reject tasks.

---

## 🛠 Tech Stack

- Java 17
- Spring Boot
- Spring Security (Basic Authentication)
- Spring Data JPA
- H2 In-Memory Database
- HTML / CSS / JavaScript (Single Page UI)

---

## 🚀 How To Run The Application

### Option 1 – Run from IntelliJ (Recommended)
1. Open the project in IntelliJ.
2. Locate the main class:
   `TaskApprovalAppApplication`
3. Click the Run (▶) button.

---

### Option 2 – Run using Maven Wrapper
From project root

mvnw.cmd clean spring-boot:run


(If Maven is installed globally, you can also run:)
mvn clean spring-boot:run


---

## 🌐 Application URLs

- UI:http://localhost:8080/


- H2 Database Console (Optional): http://localhost:8080/h2-console


-  JDBC URL: jdbc:h2:mem:taskdb


---

## 👤 Test Users (Auto-Seeded)

The following users are created automatically at application startup:

| Username  | Password | Role    |
|-----------|----------|---------|
| user1     | pass     | USER    |
| manager1  | pass     | MANAGER |
| admin1    | pass     | ADMIN   |

---

## 🧪 How To Test (Demo Flow)

### Step 1 – Create Task
1. Open: http://localhost:8080/
2. Login as: user1 / pass

3. Create a new task.
4. Task will be created with status: **PENDING**

---

### Step 2 – Approve Task
1. Logout.
2. Login as: manager1 / pass

3. Approve the PENDING task.
4. Task status changes to: **APPROVED**

---

### Step 3 – Verify Restrictions
- Login as `user1`
- Try to approve a task
- You will receive: 403 Forbidden
- Try approving an already approved task
- You will receive: 409 Conflict 

---

## 🔗 REST API Endpoints


### Create Task

```
POST /tasks
```

Example Request Body:

```json
{
  "title": "Book conference room",
  "description": "Team meeting",
  "dateTime": "2026-02-11T15:00:00Z",
  "priority": "HIGH",
  "assignedUserId": 1
}
```

---

### List Tasks (Supports Filter + Sort)

```
GET /tasks
```

Examples:

```
GET /tasks
GET /tasks?status=PENDING
GET /tasks?status=APPROVED&sortBy=createdDate&direction=desc
```

---

### Approve / Reject Task (Manager/Admin Only)

```
PUT /tasks/{id}/approve
```

Example Body:

```json
{
  "approve": true,
  "comment": "Approved"
}
```


---
## 🏗 Architecture Overview

The application follows a layered architecture:

Controller → Service → Repository → Database

- Controllers handle HTTP requests and responses.
- Services contain business logic and workflow validation.
- Repositories handle database interactions using Spring Data JPA.
- Security is enforced using Spring Security with role-based access control.

This separation ensures maintainability, scalability, and clean code structure.

## ❗ Error Handling

The application returns meaningful HTTP responses:

- 401 Unauthorized → Invalid login credentials
- 403 Forbidden → Insufficient role permissions
- 409 Conflict → Invalid workflow state transition
- 400 Bad Request → Invalid request payload

This ensures predictable and REST-compliant API behavior.







