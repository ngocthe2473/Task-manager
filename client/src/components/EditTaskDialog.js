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
  Divider,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Assignment as TaskIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getSubTasks, addSubTask, updateSubTask, deleteSubTask, getUsers, getProjects, getMyTeamMembers, checkUserIsTeamLeader } from '../services/apiService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Modern minimalist styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '900px', // Increased from 700px to 900px
    width: '95%', // Increased from 100% to 95% for better responsive design
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

const EditTaskDialog = ({ open, onClose, task, onSave }) => {
  const { userInfo } = useContext(AuthContext);
  const isEditing = Boolean(task);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    assignee: null,
    project: null,
    progress: 0
  });

  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({ 
    title: '', 
    completed: false,
    description: '' 
  });  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isTeamLeader, setIsTeamLeader] = useState(false);

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
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignee: task.assignee || null,
        project: task.project || null,
        progress: task.progress || 0
      });

      // Fetch subtasks if editing an existing task
      if (task._id) {
        fetchSubtasks(task._id);
      }
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assignee: null,
        project: null,
        progress: 0
      });
      setSubtasks([]);
    }
    
    // Fetch users and projects
    fetchUsersAndProjects();
  }, [task]);

  const fetchSubtasks = async (taskId) => {
    setLoading(true);
    try {
      const data = await getSubTasks(taskId);
      setSubtasks(data);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };  const fetchUsersAndProjects = async () => {
    setLoading(true);
    try {
      const [usersData, projectsData, leaderStatus] = await Promise.all([
        getMyTeamMembers(), // Use team members instead of all users
        getProjects(),
        checkUserIsTeamLeader()
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      setIsTeamLeader(leaderStatus);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
  const handleSave = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        // Prepare task data
        const taskData = {
          ...formData,
          // Convert any objects to IDs for API
          assignee: formData.assignee?._id || formData.assignee,
          project: formData.project?._id || formData.project
        };
        
        // Save the task
        const savedTask = await onSave(taskData);
        
        // For new tasks with subtasks, add the subtasks after task is created
        if (!isEditing && subtasks.length > 0 && savedTask?._id) {
          for (const subtask of subtasks) {
            await addSubTask(savedTask._id, {
              title: subtask.title,
              description: subtask.description || '',
              completed: subtask.completed || false
            });
          }
        }
        
        onClose();
      } catch (error) {
        console.error('Error saving task:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const isSubtaskFormValid = () => {
    return newSubtask.title.trim() !== '' && newSubtask.description.trim() !== '';
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.title.trim()) return;
    
    try {
      if (!task || !task._id) {
        // For new tasks, just add to local state
        setSubtasks([...subtasks, { 
          ...newSubtask, 
          _id: `temp-${Date.now()}`,
          completed: false 
        }]);
      } else {
        // For existing tasks, add to API
        const addedSubtask = await addSubTask(task._id, {
          title: newSubtask.title,
          description: newSubtask.description,
          completed: false
        });
        
        setSubtasks([...subtasks, addedSubtask]);
      }
      
      // Reset new subtask form
      setNewSubtask({ title: '', description: '', completed: false });
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtask) => {
    try {
      const updatedSubtask = { ...subtask, completed: !subtask.completed };
      
      if (subtask._id.startsWith('temp-')) {
        // For temporary subtasks (new task being created)
        setSubtasks(subtasks.map(st => 
          st._id === subtask._id ? updatedSubtask : st
        ));
      } else {
        // For existing subtasks
        const updated = await updateSubTask(subtask._id, updatedSubtask);
        setSubtasks(subtasks.map(st => 
          st._id === subtask._id ? updated : st
        ));
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      if (subtaskId.startsWith('temp-')) {
        // For temporary subtasks (new task being created)
        setSubtasks(subtasks.filter(st => st._id !== subtaskId));
      } else {
        // For existing subtasks
        await deleteSubTask(subtaskId);
        setSubtasks(subtasks.filter(st => st._id !== subtaskId));
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

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
            <Grid xs={12}>
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

            <Grid xs={12} md={6}>
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

            <Grid xs={12} md={6}>
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

            <Grid xs={12}>
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
            <Grid xs={12}>
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
                </Box>              </TaskPreview>
            </Grid>
          </Grid>

          {/* Subtasks Section */}
          <FormSection>
            <SectionTitle>
              <CheckBoxIcon sx={{ fontSize: 16 }} />
              Subtasks
            </SectionTitle>
            <Paper elevation={0} sx={{ 
              p: 2, 
              backgroundColor: '#f9f9f9', 
              borderRadius: '8px',
              mb: 2
            }}>
              {/* Subtask List */}
              <List dense sx={{ mb: subtasks.length > 0 ? 2 : 0 }}>
                {subtasks.map((subtask) => (
                  <ListItem 
                    key={subtask._id}
                    sx={{
                      borderRadius: '8px',
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#ffffff'
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteSubtask(subtask._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton 
                      dense
                      onClick={() => handleToggleSubtask(subtask)}
                      sx={{ 
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                        color: subtask.completed ? '#999' : 'inherit'
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={subtask.completed || false}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={subtask.title}
                        secondary={subtask.description || ''}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              
              {/* Add New Subtask */}              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <StyledTextField
                  size="small"
                  label="New Subtask"
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask({...newSubtask, title: e.target.value})}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.title.trim()}
                  sx={{ 
                    height: '40px',
                    textTransform: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Add
                </Button>
              </Box>              <StyledTextField
                size="small"
                label="Description (optional)"
                value={newSubtask.description}
                onChange={(e) => setNewSubtask({...newSubtask, description: e.target.value})}
                fullWidth
                sx={{ mt: 1 }}
              />
            </Paper>
          </FormSection>
        </StyledDialogContent>        <StyledDialogActions>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          {!isEditing && !isTeamLeader && (
            <Typography variant="caption" color="error" sx={{ mr: 2 }}>
              Only team leaders can create tasks
            </Typography>
          )}
          <SaveButton 
            onClick={handleSave}
            disabled={!formData.title.trim() || (!isEditing && !isTeamLeader)}
          >
            {isEditing ? 'Update Task' : 'Create Task'}
          </SaveButton>
        </StyledDialogActions>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default EditTaskDialog;
