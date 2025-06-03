import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, List, ListItem, ListItemText, IconButton, Button } from '@mui/material';
import { DeleteIcon, AddIcon } from '@mui/icons-material';
import { getProjects, getTeams, getMyTasks } from '../services/taskService';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'todo',
    dueDate: task?.dueDate || '',
    assignee: task?.assignee || '',
    project: task?.project || '',
    subtasks: task?.subtasks || []
  });

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects and team members
        const [projectsData, teamsData] = await Promise.all([
          getProjects(),
          getTeams()
        ]);

        // Get user info to filter team members
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const currentUser = userInfo?.user;

        // Filter projects to only include those where user has tasks
        const userTasks = await getMyTasks();
        const userProjectIds = userTasks.map(task => task.project?._id).filter(Boolean);
        const filteredProjects = projectsData.filter(project => 
          userProjectIds.includes(project._id)
        );
        setProjects(filteredProjects);

        // Get team members from all teams user belongs to
        const allTeamMembers = [];
        teamsData.forEach(team => {
          if (team.members.some(member => member.id === currentUser._id)) {
            team.members.forEach(member => {
              if (member.id !== currentUser._id) { // Exclude current user
                allTeamMembers.push({
                  id: member.id,
                  name: member.name,
                  role: member.role
                });
              }
            });
          }
        });
        setTeamMembers(allTeamMembers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch form data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Dialog 
      open={true} 
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minWidth: '600px',
          maxWidth: '800px'
        }
      }}
    >
      <DialogTitle>
        {task ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  label="Project"
                >
                  {projects.map(project => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  label="Assignee"
                >
                  {teamMembers.map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Subtasks
              </Typography>
              <List>
                {formData.subtasks.map((subtask, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={subtask.title} />
                    <IconButton onClick={() => {
                      const newSubtasks = [...formData.subtasks];
                      newSubtasks.splice(index, 1);
                      setFormData(prev => ({ ...prev, subtasks: newSubtasks }));
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  const newSubtask = { title: '', completed: false };
                  setFormData(prev => ({
                    ...prev,
                    subtasks: [...prev.subtasks, newSubtask]
                  }));
                }}
              >
                Add Subtask
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm; 