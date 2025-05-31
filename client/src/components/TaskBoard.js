import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from './TaskCard';
import EditTaskDialog from './EditTaskDialog';
import { getAllTasks } from '../services/fakeDatabaseService';

const TaskBoard = ({ onTaskClick }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: null,
    assignee: ''
  });
  
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Search/filter state
  const [search, setSearch] = useState('');
  // Drag & drop state
  const [draggedTask, setDraggedTask] = useState(null);
  // Search/filter logic
  const filteredTasks = tasks.filter(task => {
    const q = search.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      (task.assigneeName && task.assigneeName.toLowerCase().includes(q))
    );
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError('Error loading tasks');
        console.error(err);
        const fakeTasks = await getAllTasks();
        setTasks(fakeTasks);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setUsers([
            { _id: '1', name: 'John Doe' },
            { _id: '2', name: 'Jane Smith' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([
          { _id: '1', name: 'John Doe' },
          { _id: '2', name: 'Jane Smith' }
        ]);
      }
    };
    
    fetchTasks();
    fetchUsers();
  }, []);
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setNewTask((prev) => ({ ...prev, dueDate: e.target.value }));
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setOpenSnackbar(true);
      setSnackbarMessage('Task title cannot be empty');
      setSnackbarSeverity('error');
      return;
    }
    
    try {
      setLoading(true);
      
      const priorityMap = {
        'Low': 'low',
        'Medium': 'medium',
        'High': 'high'
      };
      
      const statusMap = {
        'To Do': 'todo',
        'In Progress': 'inprogress',
        'Review': 'review',
        'Done': 'done'
      };
      
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: priorityMap[newTask.priority] || 'medium',
        status: statusMap[newTask.status] || 'todo',
        dueDate: newTask.dueDate,
      };
      // Chỉ thêm assignee nếu là ObjectId hợp lệ
      if (newTask.assignee && /^[a-f\d]{24}$/i.test(newTask.assignee)) {
        taskData.assignee = newTask.assignee;
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      
      const createdTask = await response.json();
      
      setTasks([createdTask, ...tasks]);
      
      setNewTask({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: null,
        assignee: ''
      });
      setOpenDialog(false);
      
      setOpenSnackbar(true);
      setSnackbarMessage('Task added successfully');
      setSnackbarSeverity('success');
      
    } catch (err) {
      console.error(err);
      setOpenSnackbar(true);
      setSnackbarMessage('Failed to add task');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
    }
  };
  
  const getTasksByStatus = (status) => {
    if (!filteredTasks || !Array.isArray(filteredTasks)) return [];
    const statusMap = {
      'To Do': 'todo',
      'In Progress': 'inprogress',
      'Review': 'review',
      'Done': 'done'
    };
    return filteredTasks.filter(task => {
      const dbStatus = task.status?.toLowerCase();
      const uiStatus = Object.keys(statusMap).find(key => statusMap[key] === dbStatus) || status;
      return uiStatus === status;
    });
  };
  // Edit task logic
  const handleEditTask = (task) => {
    setEditTask(task);
    setEditDialogOpen(true);
  };
  const handleDeleteTask = async (task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setLoading(true);
      await fetch(`/api/tasks/${task._id || task.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        }
      });
      setTasks(tasks.filter(t => (t._id || t.id) !== (task._id || task.id)));
      setOpenSnackbar(true);
      setSnackbarMessage('Task deleted');
      setSnackbarSeverity('success');
    } catch (err) {
      setOpenSnackbar(true);
      setSnackbarMessage('Failed to delete task');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
    }
  };
  const handleSaveEditTask = async (updated) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${editTask._id || editTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        },
        body: JSON.stringify(updated)
      });
      if (!response.ok) throw new Error('Failed to update task');
      const data = await response.json();
      setTasks(tasks.map(t => (t._id || t.id) === (editTask._id || editTask.id) ? data : t));
      setEditDialogOpen(false);
      setOpenSnackbar(true);
      setSnackbarMessage('Task updated');
      setSnackbarSeverity('success');
    } catch (err) {
      setOpenSnackbar(true);
      setSnackbarMessage('Failed to update task');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
    }
  };
  // Drag & drop handlers
  const handleDragStart = (task) => setDraggedTask(task);
  const handleDrop = (status) => {
    if (!draggedTask) return;
    handleSaveEditTask({ ...draggedTask, status });
    setDraggedTask(null);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h4">Tasks</Typography>
        <TextField
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220, mr: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Task
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5', minWidth: 260, display: 'flex', flexDirection: 'column' }}
            onDrop={() => handleDrop('To Do')}
            onDragOver={handleDragOver}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">To Do</Typography>
              <Chip label={getTasksByStatus('To Do').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('To Do').map((task) => (
                <div key={task._id || task.id} draggable onDragStart={() => handleDragStart(task)}>
                  <TaskCard 
                    task={task} 
                    onClick={onTaskClick} 
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenDialog(true)}>+ Add Task</Button>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#fff8e1', minWidth: 260, display: 'flex', flexDirection: 'column' }}
            onDrop={() => handleDrop('In Progress')}
            onDragOver={handleDragOver}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">In Progress</Typography>
              <Chip label={getTasksByStatus('In Progress').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('In Progress').map((task) => (
                <div key={task._id || task.id} draggable onDragStart={() => handleDragStart(task)}>
                  <TaskCard 
                    task={task} 
                    onClick={onTaskClick} 
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenDialog(true)}>+ Add Task</Button>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#e8f5e9', minWidth: 260, display: 'flex', flexDirection: 'column' }}
            onDrop={() => handleDrop('Review')}
            onDragOver={handleDragOver}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Review</Typography>
              <Chip label={getTasksByStatus('Review').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('Review').map((task) => (
                <div key={task._id || task.id} draggable onDragStart={() => handleDragStart(task)}>
                  <TaskCard 
                    task={task} 
                    onClick={onTaskClick} 
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenDialog(true)}>+ Add Task</Button>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#e3f2fd', minWidth: 260, display: 'flex', flexDirection: 'column' }}
            onDrop={() => handleDrop('Done')}
            onDragOver={handleDragOver}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Done</Typography>
              <Chip label={getTasksByStatus('Done').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('Done').map((task) => (
                <div key={task._id || task.id} draggable onDragStart={() => handleDragStart(task)}>
                  <TaskCard 
                    task={task} 
                    onClick={onTaskClick} 
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenDialog(true)}>+ Add Task</Button>
            </Stack>
      <EditTaskDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEditTask}
        task={editTask}
        users={users}
      />
          </Paper>
        </Grid>
      </Grid>
      
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            name="title"
            value={newTask.title}
            onChange={handleNewTaskChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={newTask.description}
            onChange={handleNewTaskChange}
            multiline
            rows={4}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={newTask.status}
                label="Status"
                onChange={handleNewTaskChange}
              >
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Review">Review</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={newTask.priority}
                label="Priority"
                onChange={handleNewTaskChange}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Due Date"
              type="date"
              name="dueDate"
              value={newTask.dueDate || ''}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                name="assignee"
                value={newTask.assignee}
                label="Assignee"
                onChange={handleNewTaskChange}
              >
                {(Array.isArray(users) ? users : []).map(user => (
                  <MenuItem key={user._id || user.id} value={user._id || user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddTask}>Add</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskBoard;
