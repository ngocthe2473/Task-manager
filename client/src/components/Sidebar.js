import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box,
  Paper,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/tasks', label: 'Tasks', icon: <AssignmentIcon /> },
    { path: '/teams', label: 'Teams', icon: <PeopleIcon /> },
    { path: '/activity', label: 'Activity', icon: <HistoryIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> }
  ];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: '250px', 
        minWidth: '250px',
        background: '#f4f5f7', 
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        display: { xs: 'none', sm: 'block' }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 2, fontWeight: 'bold', fontSize: '1.2rem' }}>
          Task Manager
        </Box>
        <Divider />
        <List>
          {menuItems.map(item => (
            <Tooltip title={item.label} placement="right" key={item.path}>
              <ListItem 
                button 
                component={Link} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 115, 234, 0.08)',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 115, 234, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: 1,
                  },
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 'medium' : 'regular',
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary' 
                  }} 
                />
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default Sidebar;
