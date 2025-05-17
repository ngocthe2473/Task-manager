import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { getAllTasks } from '../services/fakeDatabaseService';

// Utility function to generate fake activity logs based on tasks
const generateActivityLogs = (tasks, users) => {
  const activities = [];
  const actionTypes = ['created', 'updated', 'completed', 'commented', 'assigned'];
  
  tasks.forEach(task => {
    // Generate creation activity
    activities.push({
      id: `act-${activities.length + 1}`,
      type: 'created',
      taskId: task.id,
      taskTitle: task.title,
      userId: task.assignee,
      timestamp: new Date(task.createdAt),
      details: `created task "${task.title}"`
    });
    
    // Generate comment activities
    task.comments?.forEach(comment => {
      activities.push({
        id: `act-${activities.length + 1}`,
        type: 'commented',
        taskId: task.id,
        taskTitle: task.title,
        userId: comment.user,
        timestamp: new Date(comment.createdAt),
        details: `commented on "${task.title}": "${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}"`
      });
    });
    
    // Generate random activities
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const date = new Date(task.createdAt);
      date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);
      
      if (type !== 'created' && type !== 'commented') {
        activities.push({
          id: `act-${activities.length + 1}`,
          type,
          taskId: task.id,
          taskTitle: task.title,
          userId: users[Math.floor(Math.random() * users.length)].id,
          timestamp: date,
          details: getActivityDetails(type, task)
        });
      }
    }
  });
  
  // Sort by timestamp descending
  return activities.sort((a, b) => b.timestamp - a.timestamp);
};

const getActivityDetails = (type, task) => {
  switch (type) {
    case 'updated':
      return `updated task "${task.title}"`;
    case 'completed':
      return `marked task "${task.title}" as complete`;
    case 'assigned':
      return `was assigned to task "${task.title}"`;
    default:
      return `acted on task "${task.title}"`;
  }
};

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionTypes: ['created', 'updated', 'completed', 'commented', 'assigned'],
    users: [],
    projects: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskData = await getAllTasks();
        const users = [
          { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
          { id: '3', name: 'Mike Johnson', email: 'mike@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
          { id: '4', name: 'Sarah Brown', email: 'sarah@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
          { id: '5', name: 'Alex Wilson', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?img=5' }
        ];
        
        const activityData = generateActivityLogs(taskData, users);
        setActivities(activityData);
        setFilters(prev => ({
          ...prev,
          users: users.map(user => user.id)
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error loading activities:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <AssignmentIcon />;
      case 'updated':
        return <EditIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'commented':
        return <CommentIcon />;
      case 'assigned':
        return <PersonIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'created':
        return 'primary';
      case 'updated':
        return 'info';
      case 'completed':
        return 'success';
      case 'commented':
        return 'secondary';
      case 'assigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredActivities = activities.filter(activity => 
    filters.actionTypes.includes(activity.type) && 
    filters.users.includes(activity.userId)
  );

  const getUserName = (userId) => {
    const users = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
      { id: '3', name: 'Mike Johnson' },
      { id: '4', name: 'Sarah Brown' },
      { id: '5', name: 'Alex Wilson' }
    ];
    return users.find(user => user.id === userId)?.name || 'Unknown User';
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Activity Log
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="action-types-label">Action Types</InputLabel>
            <Select
              labelId="action-types-label"
              id="action-types"
              name="actionTypes"
              multiple
              value={filters.actionTypes}
              onChange={handleFilterChange}
              input={<OutlinedInput label="Action Types" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {['created', 'updated', 'completed', 'commented', 'assigned'].map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={filters.actionTypes.indexOf(type) > -1} />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="users-label">Users</InputLabel>
            <Select
              labelId="users-label"
              id="users"
              name="users"
              multiple
              value={filters.users}
              onChange={handleFilterChange}
              input={<OutlinedInput label="Users" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length > 2
                    ? <Chip label={`${selected.length} selected`} size="small" />
                    : selected.map((value) => (
                      <Chip key={value} label={getUserName(value)} size="small" />
                    ))
                  }
                </Box>
              )}
            >
              {[
                { id: '1', name: 'John Doe' },
                { id: '2', name: 'Jane Smith' },
                { id: '3', name: 'Mike Johnson' },
                { id: '4', name: 'Sarah Brown' },
                { id: '5', name: 'Alex Wilson' }
              ].map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Checkbox checked={filters.users.indexOf(user.id) > -1} />
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 0 }}>
        <List sx={{ width: '100%' }}>
          {loading ? (
            <ListItem>
              <ListItemText primary="Loading activities..." />
            </ListItem>
          ) : filteredActivities.length === 0 ? (
            <ListItem>
              <ListItemText primary="No activities found matching your filters." />
            </ListItem>
          ) : (
            filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.light` }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="body1" fontWeight="bold">
                          {getUserName(activity.userId)}
                        </Typography>
                        <Chip 
                          label={activity.type} 
                          size="small" 
                          color={getActivityColor(activity.type)}
                          sx={{ height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.details}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {formatDate(activity.timestamp)}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ActivityLog;
