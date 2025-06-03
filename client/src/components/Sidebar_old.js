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
  Tooltip,
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
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

const dataFlow = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const CyberSidebar = styled(Paper)(({ theme }) => ({
  width: '280px',
  minWidth: '280px',
  background: `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.95)}, ${alpha(theme.palette.secondary.dark, 0.85)})`,
  backdropFilter: 'blur(10px)',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  borderRight: `2px solid ${alpha(theme.palette.primary.light, 0.3)}`,
  display: { xs: 'none', sm: 'block' },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-100%',
    right: 0,
    width: '2px',
    height: '100%',
    background: `linear-gradient(180deg, transparent, ${theme.palette.primary.light}, transparent)`,
    animation: `${dataFlow} 3s infinite`,
  },
}));

const CyberListItem = styled(ListItem)(({ theme, isActive }) => ({
  margin: '8px 16px',
  borderRadius: '15px',
  transition: 'all 0.3s ease',
  background: isActive 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.2)})`
    : 'transparent',
  border: isActive 
    ? `1px solid ${alpha(theme.palette.primary.light, 0.4)}`
    : '1px solid transparent',
  '&:hover': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
    transform: 'translateX(5px)',
    animation: isActive ? 'none' : `${neonPulse} 2s infinite`,
  },
  ...(isActive && {
    animation: `${neonPulse} 3s infinite`,
  }),
}));

const CyberListItemIcon = styled(ListItemIcon)(({ theme, isActive }) => ({
  color: isActive ? theme.palette.primary.light : alpha(theme.palette.common.white, 0.7),
  minWidth: '40px',
  transition: 'all 0.3s ease',
}));

const CyberListItemText = styled(ListItemText)(({ theme, isActive }) => ({
  '& .MuiListItemText-primary': {
    color: isActive ? 'white' : alpha(theme.palette.common.white, 0.8),
    fontWeight: isActive ? 'bold' : 'medium',
    fontSize: '0.95rem',
    textShadow: isActive ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
    transition: 'all 0.3s ease',
  },
}));

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
    <CyberSidebar elevation={8}>
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            mb: 1,
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
          }}
        >
          Task Manager
        </Typography>
        
        <Divider 
          sx={{ 
            mb: 3,
            borderColor: alpha('#fff', 0.2),
            '&::before, &::after': {
              borderColor: alpha('#fff', 0.2),
            }
          }} 
        />
        
        <List sx={{ pt: 0 }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip title={item.label} placement="right" key={item.path}>
                <CyberListItem 
                  button 
                  component={Link} 
                  to={item.path}
                  isActive={isActive}
                >
                  <CyberListItemIcon isActive={isActive}>
                    {item.icon}
                  </CyberListItemIcon>
                  <CyberListItemText 
                    primary={item.label} 
                    isActive={isActive}
                  />
                </CyberListItem>
              </Tooltip>
            );
          })}
        </List>
        
        {/* Decorative cyber elements */}
        <Box 
          sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: `1px solid ${alpha('#fff', 0.1)}`,
            textAlign: 'center' 
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha('#fff', 0.5),
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            System Online
          </Typography>
          <Box 
            sx={{ 
              width: '100%', 
              height: '2px', 
              background: `linear-gradient(90deg, transparent, #00ff41, transparent)`,
              mt: 1,
              borderRadius: '1px',
              animation: `${neonPulse} 2s infinite`,
            }} 
          />
        </Box>
      </Box>
    </CyberSidebar>
  );
};

export default Sidebar;
