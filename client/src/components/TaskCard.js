import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AlarmIcon from '@mui/icons-material/Alarm';

const StyledCard = styled(Card)(({ theme }) => ({
  '&:hover': {
    boxShadow: theme.shadows[4],
    cursor: 'pointer'
  }
}));

const priorityColors = {
  High: '#f44336',
  Medium: '#ff9800',
  Low: '#4caf50'
};

const TaskCard = ({ task }) => {
  const { title, assignee, priority, due } = task;
  const initials = assignee.split(' ').map(name => name[0]).join('');
  
  // Calculate if due date is approaching
  const dueDate = new Date(due);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;
  const isOverdue = daysUntilDue < 0;

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem', bgcolor: '#1976d2' }}>
            {initials}
          </Avatar>
          
          <Chip 
            label={priority}
            size="small"
            sx={{ 
              bgcolor: priorityColors[priority], 
              color: 'white',
              height: 24,
              fontSize: '0.75rem'
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'text.secondary' }}>
          <AlarmIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : due}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default TaskCard;
