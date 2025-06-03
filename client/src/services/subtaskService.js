import api from './apiService';

// SubTask API
export const getSubTasksByTaskId = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/subtasks`);
  return response.data;
};

export const getSubTaskById = async (id) => {
  const response = await api.get(`/subtasks/${id}`);
  return response.data;
};

export const addSubTask = async (taskId, subtaskData) => {
  const response = await api.post(`/tasks/${taskId}/subtasks`, subtaskData);
  return response.data;
};

export const updateSubTask = async (id, subtaskData) => {
  const response = await api.put(`/subtasks/${id}`, subtaskData);
  return response.data;
};

export const deleteSubTask = async (id) => {
  const response = await api.delete(`/subtasks/${id}`);
  return response.data;
};

export default {
  getSubTasksByTaskId,
  getSubTaskById,
  addSubTask,
  updateSubTask,
  deleteSubTask
};
