import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/apiService';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TasksIcon,
  People as TeamIcon,
  FolderOpen as ProjectIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  ErrorOutline as OverdueIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

// Modern minimalist styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
    borderRight: '1px solid #e0e0e0',
    paddingTop: '64px', // Account for navbar height
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '16px 0',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  fontWeight: 700,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '16px 24px 8px 24px',
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: '2px 16px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: active ? '#e3f2fd' : 'transparent',
  '&:hover': {
    backgroundColor: active ? '#e3f2fd' : '#f5f5f5',
  },
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
    color: active ? '#2196f3' : '#666',
  },
  '& .MuiListItemText-primary': {
    color: active ? '#2196f3' : '#333',
    fontWeight: active ? 600 : 400,
    fontSize: '14px',
  },
}));

const QuickStats = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  margin: '8px 16px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 0',
  '&:not(:last-child)': {
    borderBottom: '1px solid #f0f0f0',
  },
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  color: '#666',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333',
}));

const ProjectSection = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  margin: '8px 16px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
}));

const ProjectItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 0',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const ProjectInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

const ProjectAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: '12px',
  fontWeight: 600,
}));

const AddProjectButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  margin: '8px 0',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
}));

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectsExpanded, setProjectsExpanded] = useState(true);


  // State for real data
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        // Tính toán stats nếu cần
        let completed = 0, pending = 0, overdue = 0;
        const now = new Date();
        data.forEach(p => {
          if (p.status === 'completed' || p.status === 'done') completed++;
          else if (p.status === 'pending' || p.status === 'planning') pending++;
          if (p.dueDate && new Date(p.dueDate) < now && p.status !== 'completed' && p.status !== 'done') overdue++;
        });
        setStats({
          total: data.length,
          completed,
          pending,
          overdue
        });
      } catch (err) {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Team', icon: <TeamIcon />, path: '/team' },
    { text: 'Timeline', icon: <TimelineIcon />, path: '/timeline' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
    >
      <SidebarContainer>
        {/* Navigation Menu */}
        <Box>
          <SectionTitle>Navigation</SectionTitle>
          <List>
            {menuItems.map((item) => (
              <StyledListItem
                key={item.text}
                active={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ margin: '16px 0' }} />

        {/* Quick Stats */}
        <Box>
          <SectionTitle>Overview</SectionTitle>
          <QuickStats>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
              Task Summary
            </Typography>
            
            <StatItem>
              <StatLabel>
                <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                Completed
              </StatLabel>
              <StatValue>{stats.completed}</StatValue>
            </StatItem>
            
            <StatItem>
              <StatLabel>
                <PendingIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                Pending
              </StatLabel>
              <StatValue>{stats.pending}</StatValue>
            </StatItem>
            
            <StatItem>
              <StatLabel>
                <OverdueIcon sx={{ fontSize: 16, color: '#f44336' }} />
                Overdue
              </StatLabel>
              <StatValue>{stats.overdue}</StatValue>
            </StatItem>
          </QuickStats>
        </Box>

        {/* Projects Section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3 }}>
            <SectionTitle sx={{ padding: '0', margin: '0' }}>Projects</SectionTitle>
            <IconButton
              size="small"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              sx={{ color: '#666' }}
            >
              {projectsExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={projectsExpanded}>
            <ProjectSection>
              {projects.map((project) => (
                <ProjectItem key={project.id}>
                  <ProjectInfo>
                    <ProjectAvatar sx={{ backgroundColor: project.color }}>
                      {project.name.charAt(0)}
                    </ProjectAvatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                        {project.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {project.taskCount} tasks
                      </Typography>
                    </Box>
                  </ProjectInfo>
                  <Chip
                    label={project.taskCount}
                    size="small"
                    sx={{
                      backgroundColor: project.color + '20',
                      color: project.color,
                      fontWeight: 600,
                      fontSize: '11px'
                    }}
                  />
                </ProjectItem>
              ))}
              
              <AddProjectButton onClick={() => navigate('/projects/new')}>
                <AddIcon sx={{ fontSize: 18, color: '#666' }} />
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                  Add Project
                </Typography>
              </AddProjectButton>
            </ProjectSection>
          </Collapse>
        </Box>
      </SidebarContainer>
    </StyledDrawer>
  );
};

export default Sidebar;
