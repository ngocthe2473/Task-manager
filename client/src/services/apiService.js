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
  return response.data;
};

// Users API
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Calendar API
export const getCalendarTasks = async (params = {}) => {
  const response = await api.get('/calendar', { params });
  return response.data;
};

// Teams API
export const getTeams = async () => {
  const response = await api.get('/teams');
  return response.data;
};

export const getMyTeams = async () => {
  const response = await api.get('/teams/my');
  return response.data;
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

// Search API
export const searchTasks = async (query) => {
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// Notifications API
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Activity Log API
export const getActivityLogs = async (params = {}) => {
  const response = await api.get('/activity-logs', { params });
  return response.data;
};

export default api;
