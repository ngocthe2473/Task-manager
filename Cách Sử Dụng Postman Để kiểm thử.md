# Task Manager API - Postman Testing Collection

## Base URL
```
http://localhost:5000/api
```

## Environment Variables
Create these variables in Postman:
- `baseUrl`: http://localhost:5000/api
- `token`: (will be set after login)
- `userId`: (will be set after login)
- `taskId`: (will be set after creating a task)
- `projectId`: (will be set after creating a project)
- `teamId`: (will be set after creating a team)

---

## 1. AUTHENTICATION APIs

### 1.1 Register User
- **Method**: POST
- **URL**: `{{baseUrl}}/auth/register`
- **Body** (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123",
  "role": "user"
}
```

### 1.2 Login User
- **Method**: POST
- **URL**: `{{baseUrl}}/auth/login`
- **Body** (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Tests Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("userId", response.user._id);
}
```

---

## 2. USER MANAGEMENT APIs

### 2.1 Get Current User Profile
- **Method**: GET
- **URL**: `{{baseUrl}}/users/profile`
- **Headers**: `Authorization: Bearer {{token}}`

### 2.2 Update User Profile
- **Method**: PUT
- **URL**: `{{baseUrl}}/users/profile`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### 2.3 Get All Users (Admin only)
- **Method**: GET
- **URL**: `{{baseUrl}}/users`
- **Headers**: `Authorization: Bearer {{token}}`

### 2.4 Get User by ID
- **Method**: GET
- **URL**: `{{baseUrl}}/users/{{userId}}`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 3. TEAM MANAGEMENT APIs

### 3.1 Create Team
- **Method**: POST
- **URL**: `{{baseUrl}}/teams`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "name": "Development Team",
  "description": "Main development team",
  "members": []
}
```
- **Tests Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("teamId", response.team._id);
}
```

### 3.2 Get All Teams
- **Method**: GET
- **URL**: `{{baseUrl}}/teams`
- **Headers**: `Authorization: Bearer {{token}}`

### 3.3 Get Team by ID
- **Method**: GET
- **URL**: `{{baseUrl}}/teams/{{teamId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### 3.4 Update Team
- **Method**: PUT
- **URL**: `{{baseUrl}}/teams/{{teamId}}`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "name": "Updated Team Name",
  "description": "Updated description"
}
```

### 3.5 Add Team Member
- **Method**: POST
- **URL**: `{{baseUrl}}/teams/{{teamId}}/members`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "userId": "{{userId}}",
  "role": "member"
}
```

### 3.6 Get Team Stats
- **Method**: GET
- **URL**: `{{baseUrl}}/teams/{{teamId}}/stats`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 4. PROJECT MANAGEMENT APIs

### 4.1 Create Project
- **Method**: POST
- **URL**: `{{baseUrl}}/projects`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "name": "Test Project",
  "description": "A test project",
  "startDate": "2025-06-01",
  "endDate": "2025-12-31",
  "status": "active",
  "team": "{{teamId}}"
}
```
- **Tests Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("projectId", response.project._id);
}
```

### 4.2 Get All Projects
- **Method**: GET
- **URL**: `{{baseUrl}}/projects`
- **Headers**: `Authorization: Bearer {{token}}`

### 4.3 Get My Projects
- **Method**: GET
- **URL**: `{{baseUrl}}/projects/my`
- **Headers**: `Authorization: Bearer {{token}}`

### 4.4 Get Project by ID
- **Method**: GET
- **URL**: `{{baseUrl}}/projects/{{projectId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### 4.5 Update Project
- **Method**: PUT
- **URL**: `{{baseUrl}}/projects/{{projectId}}`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### 4.6 Get Project Stats
- **Method**: GET
- **URL**: `{{baseUrl}}/projects/{{projectId}}/stats`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 5. TASK MANAGEMENT APIs

### 5.1 Create Task
- **Method**: POST
- **URL**: `{{baseUrl}}/tasks`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "title": "Test Task",
  "description": "A test task description",
  "priority": "medium",
  "status": "todo",
  "dueDate": "2025-06-15",
  "project": "{{projectId}}",
  "assignee": "{{userId}}"
}
```
- **Tests Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("taskId", response.task._id);
}
```

### 5.2 Get All Tasks
- **Method**: GET
- **URL**: `{{baseUrl}}/tasks`
- **Headers**: `Authorization: Bearer {{token}}`

### 5.3 Get Task by ID
- **Method**: GET
- **URL**: `{{baseUrl}}/tasks/{{taskId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### 5.4 Update Task
- **Method**: PUT
- **URL**: `{{baseUrl}}/tasks/{{taskId}}`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in_progress"
}
```

### 5.5 Delete Task
- **Method**: DELETE
- **URL**: `{{baseUrl}}/tasks/{{taskId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### 5.6 Update Task Status
- **Method**: PUT
- **URL**: `{{baseUrl}}/tasks/{{taskId}}/status`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "status": "completed"
}
```

---

## 6. SUBTASK MANAGEMENT APIs

### 6.1 Create Subtask
- **Method**: POST
- **URL**: `{{baseUrl}}/tasks/{{taskId}}/subtasks`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "title": "Test Subtask",
  "description": "A test subtask",
  "priority": "low",
  "dueDate": "2025-06-10"
}
```

### 6.2 Get Subtasks for Task
- **Method**: GET
- **URL**: `{{baseUrl}}/tasks/{{taskId}}/subtasks`
- **Headers**: `Authorization: Bearer {{token}}`

### 6.3 Update Subtask
- **Method**: PUT
- **URL**: `{{baseUrl}}/subtasks/{{subtaskId}}`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "title": "Updated Subtask",
  "status": "completed"
}
```

---

## 7. COMMENT MANAGEMENT APIs

### 7.1 Add Comment to Task
- **Method**: POST
- **URL**: `{{baseUrl}}/comments`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "content": "This is a test comment",
  "task": "{{taskId}}"
}
```

### 7.2 Get Comments for Task
- **Method**: GET
- **URL**: `{{baseUrl}}/comments?task={{taskId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### 7.3 Update Comment
- **Method**: PUT
- **URL**: `{{baseUrl}}/comments/{{commentId}}`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "content": "Updated comment content"
}
```

### 7.4 Delete Comment
- **Method**: DELETE
- **URL**: `{{baseUrl}}/comments/{{commentId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### 7.5 Like/Unlike Comment
- **Method**: POST
- **URL**: `{{baseUrl}}/comments/{{commentId}}/like`
- **Headers**: `Authorization: Bearer {{token}}`

### 7.6 Add Reply to Comment
- **Method**: POST
- **URL**: `{{baseUrl}}/comments/{{commentId}}/replies`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "content": "This is a reply to the comment"
}
```

### 7.7 Get Replies for Comment
- **Method**: GET
- **URL**: `{{baseUrl}}/comments/{{commentId}}/replies`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 8. NOTIFICATION APIs

### 8.1 Get User Notifications
- **Method**: GET
- **URL**: `{{baseUrl}}/notifications`
- **Headers**: `Authorization: Bearer {{token}}`

### 8.2 Mark Notification as Read
- **Method**: PUT
- **URL**: `{{baseUrl}}/notifications/{{notificationId}}/read`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 9. CALENDAR APIs

### 9.1 Get Calendar View
- **Method**: GET
- **URL**: `{{baseUrl}}/calendar?start=2025-06-01&end=2025-06-30`
- **Headers**: `Authorization: Bearer {{token}}`

### 9.2 Get Calendar Stats
- **Method**: GET
- **URL**: `{{baseUrl}}/calendar/stats`
- **Headers**: `Authorization: Bearer {{token}}`

### 9.3 Get Upcoming Deadlines
- **Method**: GET
- **URL**: `{{baseUrl}}/calendar/deadlines`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 10. SEARCH APIs

### 10.1 Global Search
- **Method**: GET
- **URL**: `{{baseUrl}}/search?q=test&type=tasks`
- **Headers**: `Authorization: Bearer {{token}}`

### 10.2 Advanced Search
- **Method**: POST
- **URL**: `{{baseUrl}}/search/advanced`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "query": "test",
  "filters": {
    "type": "tasks",
    "status": "active",
    "priority": "high"
  }
}
```

### 10.3 Get Search Suggestions
- **Method**: GET
- **URL**: `{{baseUrl}}/search/suggestions?q=test`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 11. ATTACHMENT APIs

### 11.1 Upload Task Attachment
- **Method**: POST
- **URL**: `{{baseUrl}}/tasks/{{taskId}}/attachments`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (form-data):
  - Key: `file`
  - Value: [Select a file]

### 11.2 Upload Comment Attachment
- **Method**: POST
- **URL**: `{{baseUrl}}/comments/{{commentId}}/attachments`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (form-data):
  - Key: `file`
  - Value: [Select a file]

### 11.3 Get Attachments (Admin only)
- **Method**: GET
- **URL**: `{{baseUrl}}/attachments`
- **Headers**: `Authorization: Bearer {{token}}`

### 11.4 Get Storage Stats (Admin only)
- **Method**: GET
- **URL**: `{{baseUrl}}/attachments/stats`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 12. TIME LOG APIs

### 12.1 Create Time Log
- **Method**: POST
- **URL**: `{{baseUrl}}/timelogs`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body** (JSON):
```json
{
  "task": "{{taskId}}",
  "description": "Working on task implementation",
  "duration": 120,
  "date": "2025-06-02"
}
```

### 12.2 Get Time Logs
- **Method**: GET
- **URL**: `{{baseUrl}}/timelogs`
- **Headers**: `Authorization: Bearer {{token}}`

---

## 13. ACTIVITY LOG APIs

### 13.1 Get Activity Logs
- **Method**: GET
- **URL**: `{{baseUrl}}/activitylogs`
- **Headers**: `Authorization: Bearer {{token}}`

---

## Testing Order

1. **Start with Authentication**: Register and Login to get tokens
2. **Create Basic Entities**: Create Team → Create Project → Create Task
3. **Test CRUD Operations**: Test Create, Read, Update, Delete for each entity
4. **Test Relationships**: Add comments, subtasks, attachments
5. **Test Advanced Features**: Search, notifications, calendar, time logs

## Common Headers for All Authenticated Requests

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

## Error Testing

Test these scenarios:
- Invalid credentials
- Missing required fields
- Invalid IDs
- Unauthorized access
- Rate limiting (too many requests)

This collection covers all the main functionalities of your Task Manager API. Import these into Postman and test them systematically!
