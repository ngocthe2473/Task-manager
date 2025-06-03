import React, { useState, useEffect, useContext } from 'react';
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
  ErrorOutline as OverdueIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as AdminDashboardIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllTasks, getProjects } from '../services/apiService';

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

// Use shouldForwardProp to filter out transient props
const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== '$active',
})(({ theme, $active }) => ({
  margin: '2px 16px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: $active ? '#e3f2fd' : 'transparent',
  '&:hover': {
    backgroundColor: $active ? '#e3f2fd' : '#f5f5f5',
  },
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
    color: $active ? '#2196f3' : '#666',
  },
  '& .MuiListItemText-primary': {
    color: $active ? '#2196f3' : '#333',
    fontWeight: $active ? 600 : 400,
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

const Sidebar = ({ open = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch data from API
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await getAllTasks();
        console.log('Sidebar - Fetched tasks response:', tasksResponse); // Debug log
        
        // Handle API response format {success: true, data: array}
        const allTasks = tasksResponse?.data || tasksResponse || [];
        console.log('Sidebar - Processed tasks:', allTasks); // Debug log
        
        // Ensure allTasks is an array
        const tasksArray = Array.isArray(allTasks) ? allTasks : [];
        
        const completed = tasksArray.filter(task => task.status === 'done').length;
        const pending = tasksArray.filter(task => task.status === 'todo').length;
        const overdue = tasksArray.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
        ).length;        
        setStats({
          total: tasksArray.length,
          completed,
          pending,
          overdue
        });
        
        // Fetch projects
        const projectsResponse = await getProjects();
        console.log('Sidebar - Fetched projects response:', projectsResponse); // Debug log
        
        // Handle API response format {success: true, data: array}
        const allProjects = projectsResponse?.data || projectsResponse || [];
        console.log('Sidebar - Processed projects:', allProjects); // Debug log
        
        // Ensure allProjects is an array
        const projectsArray = Array.isArray(allProjects) ? allProjects : [];
        
        // Process projects to include task counts
        const processedProjects = projectsArray.map(project => {
          const projectTasks = tasksArray.filter(task => task.project && task.project._id === project._id);
          return {
            id: project._id,
            name: project.name,
            color: getProjectColor(project._id),
            taskCount: projectTasks.length
          };
        });
        
        setProjects(processedProjects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
        // Set default empty state on error
        setStats({ total: 0, completed: 0, pending: 0, overdue: 0 });
        setProjects([]);
        setLoading(false);
      }
    };
    
    fetchSidebarData();
  }, []);

  // Helper function to generate project colors
  const getProjectColor = (projectId) => {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];
    const index = projectId ? projectId.length % colors.length : 0;
    return colors[index];
  };  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Teams', icon: <TeamIcon />, path: '/teams' },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Activity Log', icon: <TimelineIcon />, path: '/activity' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <AdminDashboardIcon />, path: '/admin' },
    { text: 'Team Management', icon: <AdminIcon />, path: '/team-management' },
    { text: 'User Profile', icon: <ProfileIcon />, path: '/profile' }
  ];

  // Check if user is admin
  const isAdmin = userInfo?.role === 'admin' || userInfo?.isAdmin;

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
          <List>            {menuItems.map((item) => (
              <StyledListItem
                key={item.text}
                $active={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItem>
            ))}          </List>
        </Box>

        {/* Admin Menu - only show for admin users */}
        {isAdmin && (
          <>
            <Divider sx={{ margin: '16px 0' }} />
            <Box>
              <SectionTitle>Administration</SectionTitle>
              <List>
                {adminMenuItems.map((item) => (
                  <StyledListItem
                    key={item.text}
                    $active={isActive(item.path)}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </StyledListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        <Divider sx={{ margin: '16px 0' }} />

        {/* Quick Stats */}
        <Box>
          <SectionTitle>Overview</SectionTitle>
          <QuickStats>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
              Task Summary
            </Typography>            <StatItem>
              <StatLabel>
                <CompletedIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                Completed
              </StatLabel>
              <StatValue>{loading ? '-' : stats.completed}</StatValue>
            </StatItem>
            
            <StatItem>
              <StatLabel>
                <PendingIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                Pending
              </StatLabel>
              <StatValue>{loading ? '-' : stats.pending}</StatValue>
            </StatItem>
            
            <StatItem>
              <StatLabel>
                <OverdueIcon sx={{ fontSize: 16, color: '#f44336' }} />
                Overdue
              </StatLabel>
              <StatValue>{loading ? '-' : stats.overdue}</StatValue>
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
              {loading ? (
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                  Loading projects...
                </Typography>
              ) : projects.length > 0 ? (
                projects.map((project) => (
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
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                  No projects found
                </Typography>
              )}
              
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
