import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Dialog, TextField, FormControl, InputLabel, Select, MenuItem, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from './TaskCard';
import { getAllTasks, addTask } from '../services/fakeDatabaseService';

const TaskBoard = ({ onTaskClick }) => {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'todo',
    dueDate: '',
    assignee: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasks = await getAllTasks();
        const usersData = await fetch('/api/users').then(res => res.json()).catch(() => [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' }
        ]);
        
        setUsers(usersData);
        
        // Group tasks by status
        const todo = tasks.filter(task => task.status === 'todo');
        const inProgress = tasks.filter(task => task.status === 'inprogress');
        const review = tasks.filter(task => task.status === 'review');
        const done = tasks.filter(task => task.status === 'done');
        
        setColumns([
          {
            id: 'todo',
            title: 'To Do',
            color: '#e2ebf6',
            tasks: todo
          },
          {
            id: 'inprogress',
            title: 'In Progress',
            color: '#fff8dd',
            tasks: inProgress
          },
          {
            id: 'review',
            title: 'Review',
            color: '#defbe6',
            tasks: review
          },
          {
            id: 'done',
            title: 'Done',
            color: '#edf5ff',
            tasks: done
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTask = async () => {
    try {
      const createdTask = await addTask({
        ...newTask,
        assigneeName: users.find(user => user.id === newTask.assignee)?.name || '',
        project: '1', // Default project ID
        projectName: 'Main Project' // Default project name
      });

      // Update the columns with the new task
      const updatedColumns = [...columns];
      const columnIndex = updatedColumns.findIndex(column => column.id === createdTask.status);
      
      if (columnIndex !== -1) {
        updatedColumns[columnIndex].tasks = [...updatedColumns[columnIndex].tasks, createdTask];
        setColumns(updatedColumns);
      }

      // Reset form and close dialog
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'todo',
        dueDate: '',
        assignee: ''
      });
      setOpenNewTaskDialog(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpenNewTaskDialog(true)}
        >
          Create New Task
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {columns.map(column => (
          <Paper
            key={column.id}
            sx={{
              width: 300,
              minWidth: 300,
              minHeight: 'calc(100vh - 250px)',
              backgroundColor: column.color,
              padding: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6">
                {column.title} ({column.tasks.length})
              </Typography>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewTask(prev => ({ ...prev, status: column.id }));
                  setOpenNewTaskDialog(true);
                }}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              overflowY: 'auto',
              flexGrow: 1
            }}>
              {column.tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Dialog for creating new task */}
      <Dialog open={openNewTaskDialog} onClose={() => setOpenNewTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={newTask.title}
              onChange={handleNewTaskChange}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              name="description"
              value={newTask.description}
              onChange={handleNewTaskChange}
              fullWidth
              multiline
              rows={3}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
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
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newTask.status}
                  label="Status"
                  onChange={handleNewTaskChange}
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="inprogress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={handleNewTaskChange}
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
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTaskDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateTask}
            disabled={!newTask.title}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskBoard;
