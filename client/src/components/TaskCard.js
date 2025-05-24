import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AlarmIcon from '@mui/icons-material/Alarm';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { addTask } from '../services/fakeDatabaseService';

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[4],
    cursor: 'pointer',
    '& .card-actions': {
      opacity: 1
    }
  }
}));

const CardActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '5px',
  right: '5px',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  display: 'flex',
  gap: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '4px',
  padding: '2px'
}));

const priorityColors = {
  High: '#f44336',
  Medium: '#ff9800',
  Low: '#4caf50'
};

const TaskCard = ({ task, onClick, onAddSubtask }) => {
  // Always define hooks at the top level, not conditionally
  const [showActions, setShowActions] = useState(false);
  
  if (!task) return null;
  
  // Safely destructure task properties
  const { id, title, description, priority, assignee, assigneeName, dueDate, due } = task;
  
  // Use fallback values for properties that might be undefined
  const displayTitle = title || 'Untitled Task';
  const displayPriority = priority || 'Medium';
  const displayDueDate = dueDate || due || '';
  
  // Safely get initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0) || '?';
  };
  
  // Calculate if due date is approaching
  const dueDateObj = new Date(displayDueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;
  const isOverdue = daysUntilDue < 0;

  const handleAddSubtask = (e) => {
    e.stopPropagation(); // Prevent the card click from triggering
    
    if (onAddSubtask) {
      onAddSubtask(task);
    } else {
      // Open a dialog or provide another way to add a subtask
      console.log("Add subtask for:", task.id);
      
      // This is where you would connect to your subtask creation logic
      // For example:
      const subtask = {
        title: `Subtask for ${task.title}`,
        description: '',
        status: task.status,
        priority: task.priority,
        parentTask: task.id,
        assignee: task.assignee,
        assigneeName: task.assigneeName,
        project: task.project,
        projectName: task.projectName
      };
      
      addTask(subtask).then(newSubtask => {
        console.log("Created subtask:", newSubtask);
      });
    }
  };

  const handleMoreOptions = (e) => {
    e.stopPropagation();
    console.log("Show more options for:", task.id);
  };

  return (
    <StyledCard 
      onClick={() => onClick(task)} 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardActions className="card-actions">
        <Tooltip title="Add subtask">
          <IconButton size="small" onClick={handleAddSubtask}>
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="More options">
          <IconButton size="small" onClick={handleMoreOptions}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
      
      <CardContent>
        <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
          {displayTitle}
        </Typography>
        
        {description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical' 
            }}
          >
            {description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Avatar 
            sx={{ 
              width: 28, 
              height: 28, 
              fontSize: '0.75rem', 
              bgcolor: assignee ? '#1976d2' : '#e0e0e0' 
            }}
          >
            {assigneeName ? getInitials(assigneeName) : '?'}
          </Avatar>
          
          <Chip 
            label={displayPriority}
            size="small"
            sx={{ 
              bgcolor: priorityColors[displayPriority] || '#777',
              color: 'white',
              height: '22px',
              fontSize: '0.7rem',
            }}
          />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 1, 
          fontSize: '0.75rem',
          color: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'text.secondary' 
        }}>
          <AlarmIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : displayDueDate}
          </Typography>
        </Box>
        
        {task.subtasks && task.subtasks.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Subtasks: {task.subtasks.length}
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default TaskCard;
