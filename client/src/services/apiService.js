import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để đính kèm token vào mọi yêu cầu
api.interceptors.request.use(
  (config) => {
    // Lấy token từ userInfo trong localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        console.log('UserData from localStorage:', userData); // Debug log
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
          console.log('Token being sent:', userData.token); // Debug log
        } else {
          console.log('No token found in userData'); // Debug log
        }
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    } else {
      console.log('No userInfo found in localStorage'); // Debug log
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Additional User Profile API
export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

// Tasks API
export const getAllTasks = async () => {
  const response = await api.get('/tasks');
  // Handle API response format { success: true, data: tasks }
  return response.data.data || response.data || [];
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const addTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

// Get tasks by project (all tasks in a project for authorized users)
export const getTasksByProject = async (projectId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.assignee) params.append('assignee', filters.assignee);
  if (filters.assignedToMe) params.append('assignedToMe', 'true');
  
  const queryString = params.toString();
  const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data.data || response.data || [];
};

// SubTasks API
export const getSubTasks = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/subtasks`);
  // Handle API response format { success: true, data: subtasks }
  return response.data.data || response.data || [];
};

export const addSubTask = async (taskId, subTaskData) => {
  const response = await api.post(`/tasks/${taskId}/subtasks`, subTaskData);
  return response.data;
};

export const updateSubTask = async (subTaskId, subTaskData) => {
  const response = await api.put(`/subtasks/${subTaskId}`, subTaskData);
  return response.data;
};

export const deleteSubTask = async (subTaskId) => {
  const response = await api.delete(`/subtasks/${subTaskId}`);
  return response.data;
};

// Projects API
export const getProjects = async () => {
  const response = await api.get('/projects');
  // Handle API response format { success: true, data: projects }
  return response.data.data || response.data || [];
};

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const addProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export const getProjectStats = async (id) => {
  const response = await api.get(`/projects/${id}/stats`);
  return response.data;
};

export const getProjectTasks = async (id) => {
  const response = await api.get(`/projects/${id}/tasks`);
  // Handle API response format { success: true, data: tasks }
  return response.data.data || response.data || [];
};

// Additional Project API
export const getMyProjects = async () => {
  const response = await api.get('/projects/my');
  // Handle API response format { success: true, data: projects }
  return response.data.data || response.data || [];
};

// Users API
export const getUsers = async () => {
  const response = await api.get('/users');
  // Handle API response format { success: true, data: users }
  return response.data.data || response.data || [];
};

// Calendar API
export const getCalendarTasks = async (params = {}) => {
  const response = await api.get('/calendar', { params });
  // Handle API response format { success: true, data: tasks }
  return response.data.data || response.data || [];
};

// Teams API
export const getTeams = async () => {
  const response = await api.get('/teams');
  // Handle API response format { success: true, data: teams }
  return response.data.data || response.data || [];
};

export const getMyTeams = async () => {
  const response = await api.get('/teams/my');
  // Handle API response format { success: true, data: teams }
  return response.data.data || response.data || [];
};

export const getTeamById = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return response.data;
};

export const addTeam = async (teamData) => {
  const response = await api.post('/teams', teamData);
  return response.data;
};

export const updateTeam = async (id, teamData) => {
  const response = await api.put(`/teams/${id}`, teamData);
  return response.data;
};

export const deleteTeam = async (id) => {
  const response = await api.delete(`/teams/${id}`);
  return response.data;
};

// Search API - Advanced search for tasks
export const searchTasksAdvanced = async (query, limit = 10) => {
  const response = await api.get(`/tasks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data.data || response.data || [];
};

// Notifications API
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  // Handle API response format { success: true, data: notifications }
  return response.data.data || response.data || [];
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Activity Log API
export const getActivityLogs = async (params = {}) => {
  const response = await api.get('/activity-logs', { params });
  // Handle API response format { success: true, data: logs }
  return response.data.data || response.data || [];
};

// Time Logs API
export const getTimeLogs = async (params = {}) => {
  const response = await api.get('/timelogs', { params });
  // Handle API response format { success: true, data: logs }
  return response.data.data || response.data || [];
};

export const addTimeLog = async (timeLogData) => {
  const response = await api.post('/timelogs', timeLogData);
  return response.data;
};

export const updateTimeLog = async (id, timeLogData) => {
  const response = await api.put(`/timelogs/${id}`, timeLogData);
  return response.data;
};

export const deleteTimeLog = async (id) => {
  const response = await api.delete(`/timelogs/${id}`);
  return response.data;
};

// Comments API
export const getTaskComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  // Handle API response format { success: true, data: comments }
  return response.data.data || response.data || [];
};

export const addComment = async (taskId, commentData) => {
  const response = await api.post(`/tasks/${taskId}/comments`, commentData);
  return response.data;
};

export const updateComment = async (commentId, commentData) => {
  const response = await api.put(`/comments/${commentId}`, commentData);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// Attachments API
export const getAttachments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/attachments`);
  // Handle API response format { success: true, data: attachments }
  return response.data.data || response.data || [];
};

export const uploadAttachment = async (taskId, formData) => {
  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response.data;
};

// Admin API
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Team Management API
export const addTeamMember = async (teamId, userId) => {
  const response = await api.post(`/teams/${teamId}/members`, { userId });
  return response.data;
};

export const removeTeamMember = async (teamId, userId) => {
  const response = await api.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};

export const updateTeamMemberRole = async (teamId, userId, role) => {
  const response = await api.put(`/teams/${teamId}/members/${userId}`, { role });
  return response.data;
};

// Get user's tasks (assigned or created by user)
export const getMyTasks = async () => {
  const response = await api.get('/tasks/my-tasks');
  return response.data.data || response.data || [];
};

// Get dashboard stats for current user
export const getDashboardStats = async () => {
  const response = await api.get('/tasks/dashboard-stats');
  return response.data.data || response.data || {};
};

// Get all confirmed team members for current user
export const getMyTeamMembers = async () => {
  const response = await api.get('/teams/my-members');
  return response.data.data || response.data || [];
};

// Check if current user is a team leader
export const checkUserIsTeamLeader = async () => {
  const response = await api.get('/teams/check-leader');
  return response.data.isLeader || false;
};

// Search user by email
// Sử dụng đúng route cho user thường (không phải admin)
export const searchUsersByEmail = async (email) => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(email)}`);
    // Trả về mảng user phù hợp
    return response.data.data || response.data || [];
  } catch (err) {
    // Nếu lỗi 400 (Bad Request) hoặc 403 thì trả về mảng rỗng, tránh văng lỗi ra UI
    if (err.response && (err.response.status === 400 || err.response.status === 403)) {
      return [];
    }
    throw err;
  }
};

// === NEW SEARCH AND ANALYTICS APIs ===

// Search tasks by title/description
export const searchTasks = async (query, limit = 10) => {
  const response = await api.get(`/tasks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data.data || response.data || [];
};

// Search users by name/email from team members
export const searchTeamUsers = async (query, limit = 10) => {
  const response = await api.get(`/tasks/search-users?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data.data || response.data || [];
};

// Search projects by name
export const searchProjectsByName = async (query, limit = 10) => {
  const response = await api.get(`/tasks/search-projects?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data.data || response.data || [];
};

// Get comprehensive statistics for current user
export const getComprehensiveStats = async () => {
  const response = await api.get('/tasks/stats');
  return response.data.data || response.data || {};
};

// Get team analytics and productivity data
export const getTeamAnalytics = async () => {
  const response = await api.get('/tasks/team-analytics');
  return response.data.data || response.data || [];
};

// Get task timeline/activity for current user
export const getTaskTimeline = async (limit = 20, days = 30) => {
  const response = await api.get(`/tasks/timeline?limit=${limit}&days=${days}`);
  return response.data.data || response.data || {};
};

// Get project analytics
export const getProjectAnalytics = async () => {
  const response = await api.get('/projects/analytics');
  return response.data.data || response.data || {};
};

// Detailed search for projects
export const detailedSearchProjects = async (query, options = {}) => {
  const { limit = 10, status, team } = options;
  let url = `/projects/detailed-search?q=${encodeURIComponent(query)}&limit=${limit}`;
  
  if (status) url += `&status=${status}`;
  if (team) url += `&team=${team}`;
  
  const response = await api.get(url);
  return response.data.data || response.data || [];
};

// Reports API
export const getReportStats = async () => {
  const response = await api.get('/reports/stats');
  return response.data.data || response.data || {};
};

export default api;
