import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Box,
  Typography, Chip, Avatar, IconButton, Fade, Slide, Zoom
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Assignment as TaskIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Cyberpunk Animations
const neonPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
  }
  50% { 
    box-shadow: 0 0 15px currentColor, 0 0 25px currentColor, 0 0 35px currentColor;
  }
`;

const holographicShimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const dataMatrix = keyframes`
  0% { transform: translateY(100%) scaleY(0); }
  50% { transform: translateY(0%) scaleY(1); }
  100% { transform: translateY(-100%) scaleY(0); }
`;

// Styled Components
const CyberDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.primary.dark, 0.1)})`,
    backdropFilter: 'blur(20px)',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    borderRadius: '20px',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    position: 'relative',
    overflow: 'hidden',
    minWidth: '600px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
      animation: `${holographicShimmer} 3s infinite`,
    },
  },
}));

const CyberDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  position: 'relative',
  '& .MuiTypography-root': {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
  },
}));

const CyberTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '15px',
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.primary.main, 0.02)})`,
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
      animation: `${neonPulse} 2s infinite`,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      animation: `${neonPulse} 2s infinite`,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 'medium',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const CyberFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '15px',
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.primary.main, 0.02)})`,
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
      animation: `${neonPulse} 2s infinite`,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      animation: `${neonPulse} 2s infinite`,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 'medium',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const CyberButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '25px',
  fontWeight: 'bold',
  textTransform: 'none',
  padding: '12px 24px',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: 'white',
    border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
      animation: `${neonPulse} 2s infinite`,
    },
  }),
  ...(variant === 'outlined' && {
    background: 'transparent',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    color: theme.palette.primary.main,
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
      border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
      transform: 'translateY(-2px)',
      animation: `${neonPulse} 2s infinite`,
    },
  }),
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => {
  const getColor = (priority) => {
    switch (priority) {
      case 'High': return { bg: theme.palette.error.main, color: 'white' };
      case 'Medium': return { bg: theme.palette.warning.main, color: 'white' };
      case 'Low': return { bg: theme.palette.success.main, color: 'white' };
      default: return { bg: theme.palette.grey[400], color: 'white' };
    }
  };
  
  const colors = getColor(priority);
  return {
    background: `linear-gradient(135deg, ${colors.bg}, ${alpha(colors.bg, 0.8)})`,
    color: colors.color,
    fontWeight: 'bold',
    border: `1px solid ${alpha(colors.bg, 0.3)}`,
    '&:hover': {
      animation: `${neonPulse} 2s infinite`,
    },
  };
});

const EditTaskDialog = ({ open, onClose, onSave, task, users, isNewTask = false }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignee: ''
  });

  useEffect(() => {
    if (task && !isNewTask) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || '',
        assignee: task.assignee || ''
      });
    } else if (isNewTask) {
      // Reset form for new task
      setForm({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
        assignee: ''
      });
    }
  }, [task, isNewTask, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    onSave(form);
    if (isNewTask) {
      // Reset form after saving new task
      setForm({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
        assignee: ''
      });
    }
  };

  const handleClose = () => {
    onClose();
    if (isNewTask) {
      // Reset form when closing new task dialog
      setForm({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
        assignee: ''
      });
    }
  };

  return (
    <CyberDialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md"
      TransitionComponent={Fade}
      transitionDuration={500}
    >
      <CyberDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TaskIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography component="span">
              {isNewTask ? 'Create New Task' : 'Edit Task'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </CyberDialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Title Field */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TaskIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Task Information</Typography>
            </Box>
            <CyberTextField 
              label="Task Title" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              fullWidth 
              required
              placeholder="Enter a descriptive task title..."
            />
          </Box>

          {/* Description Field */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Description</Typography>
            </Box>
            <CyberTextField 
              label="Task Description" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              fullWidth 
              multiline 
              rows={4}
              placeholder="Describe the task in detail..."
            />
          </Box>

          {/* Status and Priority */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FlagIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Status & Priority</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CyberFormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={form.status} label="Status" onChange={handleChange}>
                  <MenuItem value="To Do">📋 To Do</MenuItem>
                  <MenuItem value="In Progress">⚡ In Progress</MenuItem>
                  <MenuItem value="Review">👀 Review</MenuItem>
                  <MenuItem value="Done">✅ Done</MenuItem>
                </Select>
              </CyberFormControl>
              
              <CyberFormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select name="priority" value={form.priority} label="Priority" onChange={handleChange}>
                  <MenuItem value="Low">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityChip label="Low" priority="Low" size="small" />
                      Low Priority
                    </Box>
                  </MenuItem>
                  <MenuItem value="Medium">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityChip label="Medium" priority="Medium" size="small" />
                      Medium Priority
                    </Box>
                  </MenuItem>
                  <MenuItem value="High">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityChip label="High" priority="High" size="small" />
                      High Priority
                    </Box>
                  </MenuItem>
                </Select>
              </CyberFormControl>
            </Box>
          </Box>

          {/* Due Date and Assignee */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Assignment Details</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CyberTextField 
                label="Due Date" 
                type="date" 
                name="dueDate" 
                value={form.dueDate} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
              
              <CyberFormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select name="assignee" value={form.assignee} label="Assignee" onChange={handleChange}>
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      Unassigned
                    </Box>
                  </MenuItem>
                  {(Array.isArray(users) ? users : []).map(user => (
                    <MenuItem key={user._id || user.id} value={user._id || user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        {user.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </CyberFormControl>
            </Box>
          </Box>

          {/* Task Preview */}
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha('#e3f2fd', 0.1)}, ${alpha('#f3e5f5', 0.1)})`,
            borderRadius: '15px',
            border: `1px solid ${alpha('#2196f3', 0.2)}`,
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
              Task Preview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {form.title || 'Task Title'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {form.description || 'Task description will appear here...'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={form.status} size="small" variant="outlined" />
                <PriorityChip label={form.priority} priority={form.priority} size="small" />
                {form.dueDate && (
                  <Chip 
                    icon={<CalendarIcon />} 
                    label={form.dueDate} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <CyberButton 
          onClick={handleClose} 
          variant="outlined"
          startIcon={<CancelIcon />}
        >
          Cancel
        </CyberButton>
        <CyberButton 
          onClick={handleSave} 
          variant="contained"
          startIcon={isNewTask ? <AddIcon /> : <SaveIcon />}
        >
          {isNewTask ? 'Create Task' : 'Update Task'}
        </CyberButton>
      </DialogActions>
    </CyberDialog>
  );
};

export default EditTaskDialog;
