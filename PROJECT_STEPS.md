# Step-by-Step Implementation (What I Built)

## Step 1: Project Setup
- Created a Spring Boot project (Java 17, Maven)
- Added dependencies:
    - Spring Web
    - Spring Security
    - Spring Data JPA
    - H2 Database

## Step 2: Database + Entities
Created entity classes:
- `User` (id, name, username, password, role)
- `Task` (id, title, description, status, assignedUserId, dateTime, createdDate)

Configured H2 in-memory database and JPA auto table creation.

## Step 3: Security (Basic Auth)
- Implemented `DbUserDetailsService` to load users from DB
- Configured Spring Security filter chain:
    - Permit `/h2-console/**`
    - Protect all other endpoints
    - Enable Basic Auth

## Step 4: Seed Users
Created a DataSeeder to seed initial users:
- user1/pass (USER)
- manager1/pass (MANAGER)
- admin1/pass (ADMIN)
  Passwords are stored as BCrypt hashes.

## Step 5: REST APIs
Implemented:
- `POST /tasks` → create task (default status = PENDING)
- `GET /tasks` → list tasks, supports filter/sort
- `PUT /tasks/{id}/approve` → approve/reject task (Manager/Admin only)
- `GET /users` → list users for UI dropdown

## Step 6: Workflow Enforcement
- Only PENDING tasks can be approved/rejected
- Manager/Admin role required for approval/rejection
- Returns:
    - 403 if role not allowed
    - 409 if status is not PENDING

## Step 7: Frontend UI (Single Page)
Created UI under `src/main/resources/static`:
- `index.html`
- `app.js`
- `styles.css`

UI provides:
- Login (Basic Auth stored in localStorage)
- Create Task form
- Dashboard (pending/approved/rejected lists)
- Filter/sort list view
- Approve/Reject buttons visible only for Manager/Admin

## Step 8: How to Demo (2 minutes)
1. Login as user1 → create a task
2. Logout
3. Login as manager1 → approve it
4. Show it moved from Pending → Approved
