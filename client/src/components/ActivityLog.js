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
  Checkbox,
  CircularProgress
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { getActivityLogs, getUsers } from '../services/apiService';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    actionTypes: ['created', 'updated', 'completed', 'commented', 'assigned'],
    users: [],
    projects: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [activityData, usersData] = await Promise.all([
          getActivityLogs(),
          getUsers()
        ]);
        
        console.log('Activity logs received:', activityData);
        console.log('Users received:', usersData);
        
        setUsers(usersData || []);
        setActivities(activityData || []);
        
        // Set initial filter to include all users
        setFilters(prev => ({
          ...prev,
          users: (usersData || []).map(user => user._id || user.id)
        }));
      } catch (error) {
        console.error('Error loading activities:', error);
        setError('Failed to load activity logs');
        setActivities([]);
        setUsers([]);
      } finally {
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
  const filteredActivities = activities.filter(activity => {
    const activityType = activity.action || activity.type || 'unknown';
    const activityUserId = activity.user?._id || activity.user?.id || activity.userId || activity.user;
    
    return filters.actionTypes.includes(activityType) && 
           filters.users.includes(activityUserId);
  });

  const getUserName = (userId) => {
    if (typeof userId === 'object' && userId.name) {
      return userId.name || userId.username || userId.email;
    }
    const user = users.find(user => (user._id || user.id) === userId);
    return user?.name || user?.username || user?.email || 'Unknown User';
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, padding: 3, paddingTop: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, padding: 3, paddingTop: 5 }}>
        <Typography variant="h4" gutterBottom component="div">
          Activity Log
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3, paddingTop: 5 }}>
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
              )}            >
              {users.map((user) => (
                <MenuItem key={user._id || user.id} value={user._id || user.id}>
                  <Checkbox checked={filters.users.indexOf(user._id || user.id) > -1} />
                  {user.name || user.username || user.email}
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
          ) : (            filteredActivities.map((activity, index) => {
              const activityType = activity.action || activity.type || 'unknown';
              const activityUserId = activity.user?._id || activity.user?.id || activity.userId || activity.user;
              const activityDetails = activity.description || activity.details || `${activityType} action performed`;
              const activityDate = new Date(activity.createdAt || activity.timestamp || Date.now());
              
              return (
                <React.Fragment key={activity._id || activity.id || index}>
                  {index > 0 && <Divider variant="inset" component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getActivityColor(activityType)}.light` }}>
                        {getActivityIcon(activityType)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span" variant="body1" fontWeight="bold">
                            {getUserName(activityUserId)}
                          </Typography>
                          <Chip 
                            label={activityType} 
                            size="small" 
                            color={getActivityColor(activityType)}
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activityDetails}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {formatDate(activityDate)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ActivityLog;
