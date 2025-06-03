# Task Manager API Documentation

## Overview
This is a comprehensive task management system API that provides functionality for user authentication, task management, project management, team collaboration, and more.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting
- Basic requests: 1000 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP
- File uploads: 50 requests per 15 minutes per IP
- Search endpoints: 60 requests per minute per IP
- Creation endpoints: 100 requests per 15 minutes per IP

## Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors (if applicable)
}
```

## Success Response Format
```json
{
  "success": true,
  "data": {}, // Response data
  "count": 0, // For paginated responses
  "total": 0, // Total items for pagination
  "page": 1,
  "pages": 1
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric + underscores)",
  "email": "string (valid email)",
  "password": "string (min 6 chars, must contain uppercase, lowercase, number)",
  "name": "string (2-50 chars)",
  "role": "string (optional: admin|manager|member, default: member)"
}
```

### Login User
**POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "data": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "name": "name",
    "role": "role"
  }
}
```

---

## User Endpoints

### Get User Profile
**GET** `/users/profile`

Returns the authenticated user's profile.

### Update User Profile
**PUT** `/users/profile`

Updates the authenticated user's profile.

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "avatar": "string (optional)"
}
```

### Get All Users (Admin Only)
**GET** `/users`

Returns a paginated list of all users.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search query
- `role`: Filter by role
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc|desc, default: desc)

### Get User by ID
**GET** `/users/:id`

Returns a specific user's information.

### Update User (Admin Only)
**PUT** `/users/:id`

Updates a specific user.

### Delete User (Admin Only)
**DELETE** `/users/:id`

Deletes a specific user.

---

## Task Endpoints

### Get Tasks
**GET** `/tasks`

Returns a paginated list of tasks.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (todo|in_progress|done)
- `priority`: Filter by priority (low|medium|high)
- `assignee`: Filter by assignee ID
- `project`: Filter by project ID
- `search`: Search query
- `sortBy`: Sort field
- `sortOrder`: Sort order (asc|desc)

### Get Task by ID
**GET** `/tasks/:id`

Returns a specific task with full details.

### Create Task
**POST** `/tasks`

Creates a new task.

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 2000 chars)",
  "priority": "string (optional: low|medium|high)",
  "status": "string (optional: todo|in_progress|done)",
  "dueDate": "string (optional, ISO 8601 date)",
  "assignee": "string (optional, user ID)",
  "project": "string (optional, project ID)",
  "tags": ["string"] // optional array of tags
}
```

### Update Task
**PUT** `/tasks/:id`

Updates a specific task.

### Delete Task
**DELETE** `/tasks/:id`

Deletes a specific task.

### Get Task Subtasks
**GET** `/tasks/:taskId/subtasks`

Returns all subtasks for a specific task.

### Create Subtask
**POST** `/tasks/:taskId/subtasks`

Creates a new subtask for a specific task.

---

## Project Endpoints

### Get Projects
**GET** `/projects`

Returns a paginated list of projects.

### Get My Projects
**GET** `/projects/my`

Returns projects for the authenticated user's team.

### Get Project by ID
**GET** `/projects/:id`

Returns a specific project with tasks and progress.

### Create Project (Admin/Manager)
**POST** `/projects`

Creates a new project.

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 1000 chars)",
  "team": "string (required, team ID)",
  "startDate": "string (optional, ISO 8601 date)",
  "endDate": "string (optional, ISO 8601 date)",
  "status": "string (optional: planning|active|on_hold|completed|cancelled)"
}
```

### Update Project (Admin/Manager)
**PUT** `/projects/:id`

Updates a specific project.

### Delete Project (Admin/Manager)
**DELETE** `/projects/:id`

Deletes a specific project.

### Get Project Statistics
**GET** `/projects/:id/stats`

Returns statistics for a specific project.

---

## Team Endpoints

### Get Teams
**GET** `/teams`

Returns a paginated list of teams.

### Get Team by ID
**GET** `/teams/:id`

Returns a specific team with members.

### Create Team (Admin/Manager)
**POST** `/teams`

Creates a new team.

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "manager": "string (optional, user ID)",
  "members": ["string"] // optional array of user IDs
}
```

### Update Team (Admin/Manager)
**PUT** `/teams/:id`

Updates a specific team.

### Delete Team (Admin)
**DELETE** `/teams/:id`

Deletes a specific team.

### Add Team Member (Admin/Manager)
**POST** `/teams/:id/members`

Adds a member to a team.

**Request Body:**
```json
{
  "userId": "string (required, user ID)"
}
```

### Remove Team Member (Admin/Manager)
**DELETE** `/teams/:id/members`

Removes a member from a team.

**Request Body:**
```json
{
  "userId": "string (required, user ID)"
}
```

### Get Team Statistics
**GET** `/teams/:id/stats`

Returns statistics for a specific team.

---

## Comment Endpoints

### Get Comments
**GET** `/comments`

Returns comments for a specific task or project.

**Query Parameters:**
- `taskId`: Filter by task ID
- `projectId`: Filter by project ID
- `page`: Page number
- `limit`: Items per page

### Create Comment
**POST** `/comments`

Creates a new comment.

**Request Body:**
```json
{
  "content": "string (required, max 1000 chars)",
  "taskId": "string (optional, task ID)",
  "projectId": "string (optional, project ID)",
  "parentComment": "string (optional, parent comment ID for replies)"
}
```

### Update Comment
**PUT** `/comments/:id`

Updates a specific comment.

### Delete Comment
**DELETE** `/comments/:id`

Deletes a specific comment.

### Like Comment
**POST** `/comments/:id/like`

Likes or unlikes a comment.

---

## Attachment Endpoints

### Upload Attachments
**POST** `/attachments/upload`

Uploads one or more files.

**Request:**
- Content-Type: multipart/form-data
- Files: Up to 10 files, max 50MB each
- Supported formats: Images, documents, archives

**Query Parameters:**
- `taskId`: Associate with task
- `projectId`: Associate with project
- `commentId`: Associate with comment

### Get Attachments
**GET** `/attachments`

Returns a list of attachments.

### Download Attachment
**GET** `/attachments/:id/download`

Downloads a specific attachment.

### Get Attachment Metadata
**GET** `/attachments/:id/metadata`

Returns metadata for a specific attachment.

### Delete Attachment
**DELETE** `/attachments/:id`

Deletes a specific attachment.

### Bulk Delete Attachments (Admin/Manager)
**DELETE** `/attachments/bulk`

Deletes multiple attachments.

**Request Body:**
```json
{
  "attachmentIds": ["string"] // array of attachment IDs
}
```

---

## Calendar Endpoints

### Get Calendar View
**GET** `/calendar`

Returns calendar events (tasks with due dates).

**Query Parameters:**
- `start`: Start date (ISO 8601)
- `end`: End date (ISO 8601)
- `view`: View type (day|week|month)
- `userId`: Filter by user (optional)
- `projectId`: Filter by project (optional)

### Get Calendar Statistics
**GET** `/calendar/stats`

Returns calendar statistics.

### Get Upcoming Deadlines
**GET** `/calendar/deadlines`

Returns upcoming task deadlines.

**Query Parameters:**
- `days`: Number of days ahead (default: 7)

---

## Search Endpoints

### Global Search
**GET** `/search`

Performs a global search across all entities.

**Query Parameters:**
- `q`: Search query (required)
- `type`: Entity type (tasks|projects|users|teams|all)
- `page`: Page number
- `limit`: Items per page

### Advanced Search
**POST** `/search/advanced`

Performs an advanced search with complex filters.

**Request Body:**
```json
{
  "query": "string (optional)",
  "filters": {
    "entityTypes": ["tasks", "projects"],
    "dateRange": {
      "start": "ISO 8601 date",
      "end": "ISO 8601 date"
    },
    "status": ["todo", "in_progress"],
    "priority": ["high", "medium"],
    "tags": ["tag1", "tag2"]
  },
  "sortBy": "string",
  "sortOrder": "asc|desc",
  "page": 1,
  "limit": 10
}
```

### Search Suggestions
**GET** `/search/suggestions`

Returns search suggestions for autocomplete.

**Query Parameters:**
- `q`: Partial search query
- `type`: Entity type

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications`

Returns user notifications.

### Mark Notification as Read
**PUT** `/notifications/:id/read`

Marks a notification as read.

### Mark All as Read
**PUT** `/notifications/mark-all-read`

Marks all notifications as read.

### Delete Notification
**DELETE** `/notifications/:id`

Deletes a notification.

---

## Time Log Endpoints

### Get Time Logs
**GET** `/timelogs`

Returns time logs.

### Create Time Log
**POST** `/timelogs`

Creates a new time log entry.

**Request Body:**
```json
{
  "task": "string (required, task ID)",
  "startTime": "string (required, ISO 8601 date)",
  "endTime": "string (optional, ISO 8601 date)",
  "description": "string (optional, max 500 chars)",
  "duration": "number (optional, in minutes)"
}
```

### Update Time Log
**PUT** `/timelogs/:id`

Updates a time log entry.

### Delete Time Log
**DELETE** `/timelogs/:id`

Deletes a time log entry.

---

## Activity Log Endpoints

### Get Activity Logs
**GET** `/activitylogs`

Returns activity logs.

**Query Parameters:**
- `entityType`: Filter by entity type
- `entityId`: Filter by entity ID
- `userId`: Filter by user ID
- `action`: Filter by action type
- `page`: Page number
- `limit`: Items per page

---

## Subtask Endpoints

### Get Subtasks
**GET** `/subtasks`

Returns subtasks.

### Create Subtask
**POST** `/subtasks`

Creates a new subtask.

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 1000 chars)",
  "task": "string (required, task ID)",
  "assignee": "string (optional, user ID)",
  "dueDate": "string (optional, ISO 8601 date)",
  "status": "string (optional: todo|in_progress|done)"
}
```

### Update Subtask
**PUT** `/subtasks/:id`

Updates a subtask.

### Delete Subtask
**DELETE** `/subtasks/:id`

Deletes a subtask.

---

## File Upload Guidelines

### Supported File Types
- **Images**: jpg, jpeg, png, gif, bmp, webp
- **Documents**: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf
- **Archives**: zip, rar, 7z, tar, gz

### File Size Limits
- Maximum file size: 50MB per file
- Maximum files per upload: 10 files

### Image Processing
- Images are automatically resized if larger than 1920x1080
- Thumbnails are generated for images
- EXIF data is preserved

---

## Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **413**: Payload Too Large - File size exceeded
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error

---

## Examples

### Create a Task with Attachments
1. First, upload attachments:
```bash
curl -X POST \
  http://localhost:5000/api/attachments/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@document.pdf" \
  -F "files=@image.jpg"
```

2. Then create the task with attachment IDs:
```bash
curl -X POST \
  http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review documents",
    "description": "Review the uploaded documents",
    "priority": "high",
    "attachments": ["attachment_id_1", "attachment_id_2"]
  }'
```

### Search for Tasks
```bash
curl -X GET \
  "http://localhost:5000/api/search?q=urgent&type=tasks&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Calendar Events for This Month
```bash
curl -X GET \
  "http://localhost:5000/api/calendar?start=2025-06-01&end=2025-06-30&view=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
