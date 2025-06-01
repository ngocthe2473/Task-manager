import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Fab,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Rocket as RocketIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { format } from 'date-fns';

// Pro Animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 123, 255, 0.6); }
`;

const shimmerEffect = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const ProjectCard = styled(Card)(({ theme, priority }) => {
  const getGradient = (priority) => {
    switch (priority) {
      case 'High':
        return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #ff9ff3 100%)';
      case 'Medium':
        return 'linear-gradient(135deg, #ffa726 0%, #ff9800 50%, #ffcc80 100%)';
      case 'Low':
        return 'linear-gradient(135deg, #42a5f5 0%, #1976d2 50%, #90caf9 100%)';
      default:
        return 'linear-gradient(135deg, #78909c 0%, #546e7a 50%, #b0bec5 100%)';
    }
  };

  return {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: getGradient(priority),
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
      transition: 'left 0.8s ease',
    },
    '&:hover': {
      transform: 'translateY(-12px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
      animation: `${glowPulse} 2s ease-in-out infinite`,
      '&::after': {
        left: '100%',
      },
    },
  };
});

const StatsCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  animation: `${floatAnimation} 6s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    animation: `${floatAnimation} 8s ease-in-out infinite reverse`,
  },
}));

const ProjectManagement = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProjects = [
        {
          _id: '1',
          name: 'Task Manager Pro',
          description: 'Advanced task management system with real-time collaboration features',
          status: 'in_progress',
          priority: 'High',
          progress: 75,
          startDate: '2024-01-01',
          endDate: '2024-03-01',
          teamMembers: [
            { name: 'Trần Ngọc Thế', avatar: 'T', role: 'Manager' },
            { name: 'Nguyễn Tấn Long', avatar: 'L', role: 'Developer' },
            { name: 'Trần Đại Việt', avatar: 'V', role: 'Designer' }
          ],
          tasks: { total: 25, completed: 18, inProgress: 5, pending: 2 }
        },
        {
          _id: '2',
          name: 'E-Commerce Platform',
          description: 'Modern e-commerce solution with AI-powered recommendations',
          status: 'planning',
          priority: 'Medium',
          progress: 25,
          startDate: '2024-02-01',
          endDate: '2024-06-01',
          teamMembers: [
            { name: 'Nguyễn Tấn Long', avatar: 'L', role: 'Lead Developer' },
            { name: 'Trần Đại Việt', avatar: 'V', role: 'UI/UX Designer' }
          ],
          tasks: { total: 40, completed: 8, inProgress: 12, pending: 20 }
        },
        {
          _id: '3',
          name: 'Mobile App Development',
          description: 'Cross-platform mobile application for task management',
          status: 'completed',
          priority: 'Low',
          progress: 100,
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          teamMembers: [
            { name: 'Trần Ngọc Thế', avatar: 'T', role: 'Project Manager' },
            { name: 'Trần Đại Việt', avatar: 'V', role: 'Mobile Developer' }
          ],
          tasks: { total: 30, completed: 30, inProgress: 0, pending: 0 }
        }
      ];

      setProjects(mockProjects);
      
      // Calculate stats
      setStats({
        totalProjects: mockProjects.length,
        activeProjects: mockProjects.filter(p => p.status === 'in_progress').length,
        completedProjects: mockProjects.filter(p => p.status === 'completed').length,
        teamMembers: new Set(mockProjects.flatMap(p => p.teamMembers.map(m => m.name))).size,
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'on_hold': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'on_hold': return 'On Hold';
      default: return status;
    }
  };

  const getPriorityIcon = (priority) => {
    const count = priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;
    return Array.from({ length: count }, (_, i) => (
      <StarIcon key={i} sx={{ fontSize: 16, color: '#ffd700' }} />
    ));
  };

  const renderProjectCard = (project, index) => (
    <Grid item xs={12} md={6} lg={4} key={project._id}>
      <Zoom in timeout={400 + index * 100}>
        <ProjectCard priority={project.priority}>
          <CardContent sx={{ p: 3 }}>
            {/* Project Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {project.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getPriorityIcon(project.priority)}
                  <Typography variant="body2" color="text.secondary">
                    {project.priority} Priority
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setSelectedProject(project);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Status & Progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                  size="small"
                  variant="filled"
                />
                <Typography variant="body2" fontWeight="bold">
                  {project.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  background: alpha(theme.palette.grey[300], 0.3),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getProgressColor(project.progress)})`,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
              {project.description.substring(0, 100)}
              {project.description.length > 100 && '...'}
            </Typography>

            {/* Team Members */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Team Members
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
                  {project.teamMembers.map((member, idx) => (
                    <Tooltip key={idx} title={`${member.name} - ${member.role}`}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          fontWeight: 'bold'
                        }}
                      >
                        {member.avatar}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
                <Typography variant="caption" color="text.secondary">
                  {project.teamMembers.length} members
                </Typography>
              </Box>
            </Box>

            {/* Tasks Summary */}
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                <Grid item xs={3}>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {project.tasks.total}
                  </Typography>
                  <Typography variant="caption">Total</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {project.tasks.completed}
                  </Typography>
                  <Typography variant="caption">Done</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    {project.tasks.inProgress}
                  </Typography>
                  <Typography variant="caption">Active</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {project.tasks.pending}
                  </Typography>
                  <Typography variant="caption">Pending</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Timeline */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(project.startDate), 'MMM dd')} - {format(new Date(project.endDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          </CardContent>

          <CardActions sx={{ px: 3, pb: 3 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 3,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
              onClick={() => handleViewProject(project)}
            >
              View Details
            </Button>
          </CardActions>
        </ProjectCard>
      </Zoom>
    </Grid>
  );

  const getProgressColor = (progress) => {
    if (progress >= 80) return `${theme.palette.success.main}, ${theme.palette.success.light}`;
    if (progress >= 50) return `${theme.palette.info.main}, ${theme.palette.info.light}`;
    if (progress >= 20) return `${theme.palette.warning.main}, ${theme.palette.warning.light}`;
    return `${theme.palette.error.main}, ${theme.palette.error.light}`;
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 4,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RocketIcon sx={{ mr: 2, fontSize: 48, color: theme.palette.primary.main }} />
            Project Command Center
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="300">
            Orchestrate your projects with precision and style
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={800}>
            <StatsCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats.totalProjects}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Projects
                </Typography>
              </CardContent>
            </StatsCard>
          </Fade>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={1000}>
            <StatsCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats.activeProjects}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Active Projects
                </Typography>
              </CardContent>
            </StatsCard>
          </Fade>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={1200}>
            <StatsCard gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <AnalyticsIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats.completedProjects}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Completed
                </Typography>
              </CardContent>
            </StatsCard>
          </Fade>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={1400}>
            <StatsCard gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <PeopleIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats.teamMembers}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Team Members
                </Typography>
              </CardContent>
            </StatsCard>
          </Fade>
        </Grid>
      </Grid>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {projects.map((project, index) => renderProjectCard(project, index))}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          animation: `${floatAnimation} 3s ease-in-out infinite`,
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Edit Project</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>View Tasks</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Manage Team</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Archive Project</MenuItem>
      </Menu>

      {/* Project Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 'bold'
        }}>
          {selectedProject ? selectedProject.name : 'Create New Project'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Project details and advanced management features coming soon...
          </Typography>
          {selectedProject && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedProject.description}
              </Typography>
              {/* Add more project details here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {selectedProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;
