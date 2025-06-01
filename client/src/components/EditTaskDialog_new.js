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
  IconButton,
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Assignment as TaskIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Modern minimalist styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '700px',
    width: '100%',
    margin: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: '24px 24px 16px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #f0f0f0',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '24px',
  '&:first-of-type': {
    paddingTop: '24px',
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px 24px 24px',
  borderTop: '1px solid #f0f0f0',
  gap: '12px',
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: '24px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#666',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => {
  const colors = {
    low: { bg: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    medium: { bg: '#fff3e0', color: '#f57c00', border: '#ffcc02' },
    high: { bg: '#ffebee', color: '#d32f2f', border: '#ffcdd2' },
    urgent: { bg: '#fce4ec', color: '#c2185b', border: '#f8bbd9' }
  };
  
  const colorScheme = colors[priority] || colors.medium;
  
  return {
    backgroundColor: colorScheme.bg,
    color: colorScheme.color,
    border: `1px solid ${colorScheme.border}`,
    fontWeight: 600,
    fontSize: '12px',
    '&:hover': {
      backgroundColor: colorScheme.bg,
    },
  };
});

const AssigneeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  '& .MuiChip-avatar': {
    width: 24,
    height: 24,
    fontSize: '12px',
  },
  '& .MuiChip-label': {
    fontSize: '13px',
    fontWeight: 500,
  },
}));

const TaskPreview = styled(Paper)(({ theme }) => ({
  padding: '16px',
  backgroundColor: '#fafafa',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  marginTop: '16px',
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '8px',
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#2196f3',
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    backgroundColor: '#1976d2',
    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)',
  },
  '&:disabled': {
    backgroundColor: '#e0e0e0',
    color: '#999',
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: '#666',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2196f3',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2196f3',
    },
  },
}));

const EditTaskDialog = ({ open, onClose, task, onSave, users = [], projects = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee: null,
    project: null,
    dueDate: null,
    tags: [],
    progress: 0
  });

  const [errors, setErrors] = useState({});

  // Mock data for when props are not provided
  const defaultUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', avatar: null },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', avatar: null }
  ];

  const defaultProjects = [
    { id: 1, name: 'Web Redesign', color: '#2196f3' },
    { id: 2, name: 'Mobile App', color: '#4caf50' },
    { id: 3, name: 'Marketing Campaign', color: '#ff9800' }
  ];

  const availableUsers = users.length > 0 ? users : defaultUsers;
  const availableProjects = projects.length > 0 ? projects : defaultProjects;

  const priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
    { value: 'urgent', label: 'Urgent', color: '#e91e63' }
  ];

  const statuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'done', label: 'Done' }
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assignee: task.assignee || null,
        project: task.project || null,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tags: task.tags || [],
        progress: task.progress || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignee: null,
        project: null,
        dueDate: null,
        tags: [],
        progress: 0
      });
    }
    setErrors({});
  }, [task, open]);

  const handleInputChange = (field, value) => {
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

  const handleSave = () => {
    if (validateForm()) {
      const taskData = {
        ...formData,
        id: task?.id || Date.now(),
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onSave(taskData);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const isEditing = Boolean(task);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledDialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TaskIcon sx={{ color: '#2196f3' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#666' }}>
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormSection>
                <SectionTitle>
                  <TaskIcon sx={{ fontSize: 16 }} />
                  Basic Information
                </SectionTitle>
                <StyledTextField
                  fullWidth
                  label="Task Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                  placeholder="Enter task title..."
                  sx={{ mb: 2 }}
                />
                <StyledTextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  placeholder="Describe the task in detail..."
                />
              </FormSection>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSection>
                <SectionTitle>
                  <FlagIcon sx={{ fontSize: 16 }} />
                  Priority & Status
                </SectionTitle>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    sx={{ borderRadius: '8px' }}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: priority.color
                            }}
                          />
                          {priority.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    sx={{ borderRadius: '8px' }}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FormSection>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSection>
                <SectionTitle>
                  <PersonIcon sx={{ fontSize: 16 }} />
                  Assignment
                </SectionTitle>
                <Autocomplete
                  options={availableUsers}
                  getOptionLabel={(option) => option.name}
                  value={formData.assignee}
                  onChange={(event, newValue) => handleInputChange('assignee', newValue)}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Assignee"
                      placeholder="Select assignee..."
                      sx={{ mb: 2 }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                        {option.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />

                <Autocomplete
                  options={availableProjects}
                  getOptionLabel={(option) => option.name}
                  value={formData.project}
                  onChange={(event, newValue) => handleInputChange('project', newValue)}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Project"
                      placeholder="Select project..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '4px',
                          backgroundColor: option.color
                        }}
                      />
                      {option.name}
                    </Box>
                  )}
                />
              </FormSection>
            </Grid>

            <Grid item xs={12}>
              <FormSection>
                <SectionTitle>
                  <CalendarIcon sx={{ fontSize: 16 }} />
                  Timeline
                </SectionTitle>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(newValue) => handleInputChange('dueDate', newValue)}
                  renderInput={(params) => (
                    <StyledTextField {...params} fullWidth />
                  )}
                />
              </FormSection>
            </Grid>

            {/* Task Preview */}
            <Grid item xs={12}>
              <TaskPreview>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                  Task Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {formData.title || 'Untitled Task'}
                  </Typography>
                  <PriorityChip
                    priority={formData.priority}
                    label={formData.priority.toUpperCase()}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  {formData.description || 'No description provided'}
                </Typography>

                <Box sx={{ display: 'flex', flex: 'wrap', gap: 1, alignItems: 'center' }}>
                  {formData.assignee && (
                    <AssigneeChip
                      avatar={<Avatar sx={{ fontSize: '12px' }}>{formData.assignee.name.charAt(0)}</Avatar>}
                      label={formData.assignee.name}
                      size="small"
                    />
                  )}
                  
                  {formData.project && (
                    <Chip
                      label={formData.project.name}
                      size="small"
                      sx={{
                        backgroundColor: formData.project.color + '20',
                        color: formData.project.color,
                        fontWeight: 500
                      }}
                    />
                  )}
                  
                  {formData.dueDate && (
                    <Chip
                      icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                      label={formData.dueDate.toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </TaskPreview>
            </Grid>
          </Grid>
        </StyledDialogContent>

        <StyledDialogActions>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          <SaveButton 
            onClick={handleSave}
            disabled={!formData.title.trim()}
          >
            {isEditing ? 'Update Task' : 'Create Task'}
          </SaveButton>
        </StyledDialogActions>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default EditTaskDialog;
