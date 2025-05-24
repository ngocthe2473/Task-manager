import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from './TaskCard';
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
        assignee: newTask.assignee
      };
      
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
    if (!tasks || !Array.isArray(tasks)) return [];
    
    const statusMap = {
      'To Do': 'todo',
      'In Progress': 'inprogress',
      'Review': 'review',
      'Done': 'done'
    };
    
    return tasks.filter(task => {
      const dbStatus = task.status?.toLowerCase();
      const uiStatus = Object.keys(statusMap).find(key => statusMap[key] === dbStatus) || status;
      return uiStatus === status;
    });
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Tasks</Typography>
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
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">To Do</Typography>
              <Chip label={getTasksByStatus('To Do').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('To Do').map((task) => (
                <TaskCard key={task._id || task.id} task={task} onClick={onTaskClick} />
              ))}
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#fff8e1' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">In Progress</Typography>
              <Chip label={getTasksByStatus('In Progress').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('In Progress').map((task) => (
                <TaskCard key={task._id || task.id} task={task} onClick={onTaskClick} />
              ))}
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Review</Typography>
              <Chip label={getTasksByStatus('Review').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('Review').map((task) => (
                <TaskCard key={task._id || task.id} task={task} onClick={onTaskClick} />
              ))}
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Done</Typography>
              <Chip label={getTasksByStatus('Done').length} size="small" />
            </Box>
            <Stack spacing={2}>
              {getTasksByStatus('Done').map((task) => (
                <TaskCard key={task._id || task.id} task={task} onClick={onTaskClick} />
              ))}
            </Stack>
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
