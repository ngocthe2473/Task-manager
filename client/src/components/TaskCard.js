import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import AlarmIcon from '@mui/icons-material/Alarm';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import { addTask } from '../services/fakeDatabaseService';

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

const TaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  if (!task) return null;
  const { title, description, priority, assignee, assigneeName, dueDate, due } = task;
  const displayTitle = title || 'Untitled Task';
  const displayPriority = priority || 'Medium';
  const displayDueDate = dueDate || due || '';
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.charAt(0) || '?';
  };
  const dueDateObj = new Date(displayDueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;
  const isOverdue = daysUntilDue < 0;

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleEdit = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit && onEdit(task);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete && onDelete(task);
  };

  return (
    <StyledCard onClick={() => onClick && onClick(task)} sx={{ borderLeft: `6px solid ${priorityColors[displayPriority] || '#ccc'}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', mr: 1 }}>{getInitials(assigneeName)}</Avatar>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{displayTitle}</Typography>
          <Tooltip title="More">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={e => e.stopPropagation()}>
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{description}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={displayPriority} size="small" sx={{ bgcolor: priorityColors[displayPriority] || '#ccc', color: 'white' }} />
          {displayDueDate && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AlarmIcon fontSize="small" /><Typography variant="caption">{displayDueDate}</Typography></Box>}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default TaskCard;
