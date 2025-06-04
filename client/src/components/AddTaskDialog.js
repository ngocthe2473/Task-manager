import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Avatar,
  Autocomplete,
  Grid,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUsers, getProjects, addTask } from '../services/apiService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    width: '100%',    
    maxWidth: '800px',
    padding: '0',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e9ecef',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '24px',
  backgroundColor: '#ffffff',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px',
  backgroundColor: '#f8f9fa',
  borderTop: '1px solid #e9ecef',
  gap: '12px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#495057',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '12px',
  backgroundColor: priority === 'high' ? '#fef2f2' : 
                  priority === 'medium' ? '#fef3c7' : '#f0f9ff',
  color: priority === 'high' ? '#dc2626' : 
         priority === 'medium' ? '#d97706' : '#2563eb',
  border: `1px solid ${priority === 'high' ? '#fca5a5' : 
                      priority === 'medium' ? '#fcd34d' : '#93c5fd'}`,
}));

const AddTaskDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    assignedTo: null,
    project: null,
    tags: []
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [usersData, projectsData] = await Promise.all([
        getUsers(),
        getProjects()
      ]);
      setUsers(usersData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        assignedTo: formData.assignedTo?._id || formData.assignedTo,
        project: formData.project?._id || formData.project,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null
      };

      const response = await addTask(taskData);
      
      if (onSave) {
        onSave(response.data || response);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
      // Handle error (could show a snackbar)
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignedTo: null,
      project: null,
      tags: []
    });
    setErrors({});
    onClose();
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: '#6366f1' },
    { value: 'in-progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'done', label: 'Done', color: '#10b981' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledDialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <StyledDialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <TaskIcon color="primary" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Create New Task
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <SectionTitle>
                <TaskIcon sx={{ fontSize: 16 }} />
                Basic Information
              </SectionTitle>
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Enter task title"
              />
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Enter task description"
                multiline
                rows={4}
              />
            </Grid>

            {/* Task Details */}
            <Grid item xs={12}>
              <SectionTitle>
                <FlagIcon sx={{ fontSize: 16 }} />
                Task Details
              </SectionTitle>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: option.color
                          }}
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  label="Priority"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <PriorityChip
                        label={option.label}
                        priority={option.value}
                        size="small"
                      />
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Assignment & Project */}
            <Grid item xs={12}>
              <SectionTitle>
                <PersonIcon sx={{ fontSize: 16 }} />
                Assignment & Project
              </SectionTitle>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => option.name || ''}
                value={formData.assignedTo}
                onChange={(event, newValue) => handleChange('assignedTo', newValue)}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Assign To"
                    placeholder="Select user"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {option.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={projects}
                getOptionLabel={(option) => option.name || ''}
                value={formData.project}
                onChange={(event, newValue) => handleChange('project', newValue)}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Project"
                    placeholder="Select project"
                  />
                )}
              />
            </Grid>

            {/* Due Date */}
            <Grid item xs={12}>
              <SectionTitle>
                <CalendarIcon sx={{ fontSize: 16 }} />
                Due Date
              </SectionTitle>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(newValue) => handleChange('dueDate', newValue)}
                renderInput={(params) => (
                  <StyledTextField {...params} fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </StyledDialogContent>

        <StyledDialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: '8px' }}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </StyledDialogActions>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default AddTaskDialog;
