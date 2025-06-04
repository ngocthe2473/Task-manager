import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import AlarmIcon from '@mui/icons-material/Alarm';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

const TaskCard = ({ task, onClick, onEdit, onDelete, canEdit, canDelete, canComment }) => {
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
    <Card 
      sx={{ 
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {displayTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={displayPriority}
              size="small"
              color={
                displayPriority === 'High' ? 'error' :
                displayPriority === 'Medium' ? 'warning' :
                'info'
              }
            />
            {(canEdit || canDelete) && (
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description || 'No description'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {assigneeName && (
              <Tooltip title={assigneeName}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {getInitials(assigneeName)}
                </Avatar>
              </Tooltip>
            )}
            <Typography variant="caption" color={isOverdue ? 'error' : isDueSoon ? 'warning.main' : 'text.secondary'}>
              Due: {formatDate(displayDueDate)}
            </Typography>
          </Box>
          <Chip 
            label={task.status}
            size="small"
            color={
              task.status === 'done' ? 'success' :
              task.status === 'in-progress' ? 'primary' :
              task.status === 'review' ? 'warning' :
              'default'
            }
          />
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TaskCard;
