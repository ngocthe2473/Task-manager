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
  Snackbar,
  Alert,
  CircularProgress
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { format } from 'date-fns';
import { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject,
  getProjectStats,
  getUsers 
} from '../services/apiService';

// Pro Animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 123, 255, 0.6); }
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
    '&:hover': {
      transform: 'translateY(-12px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
      animation: `${glowPulse} 2s ease-in-out infinite`,
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
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [teams, setTeams] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team: '',
    status: 'planning',
    priority: 'Medium',
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      
      // Calculate stats
      const totalProjects = data.length;
      const activeProjects = data.filter(p => p.status === 'in_progress').length;
      const completedProjects = data.filter(p => p.status === 'completed').length;
      
      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        teamMembers: 0 // Will be calculated from teams
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({
        open: true,
        message: 'Error loading projects',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const users = await getUsers();
      setTeams(users);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      const newProject = await addProject(formData);
      setProjects(prev => [newProject, ...prev]);
      setOpenDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: 'Project created successfully!',
        severity: 'success'
      });
      fetchProjects(); // Refresh to get updated stats
    } catch (error) {
      console.error('Error creating project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating project',
        severity: 'error'
      });
    }
  };

  const handleUpdateProject = async () => {
    try {
      const updatedProject = await updateProject(selectedProject._id, formData);
      setProjects(prev => 
        prev.map(p => p._id === selectedProject._id ? updatedProject : p)
      );
      setOpenDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: 'Project updated successfully!',
        severity: 'success'
      });
      fetchProjects(); // Refresh to get updated stats
    } catch (error) {
      console.error('Error updating project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating project',
        severity: 'error'
      });
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p._id !== projectId));
        setSnackbar({
          open: true,
          message: 'Project deleted successfully!',
          severity: 'success'
        });
        fetchProjects(); // Refresh to get updated stats
      } catch (error) {
        console.error('Error deleting project:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting project',
          severity: 'error'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      team: '',
      status: 'planning',
      priority: 'Medium',
      startDate: '',
      endDate: ''
    });
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      team: project.team?._id || '',
      status: project.status || 'planning',
      priority: project.priority || 'Medium',
      startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
      endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : ''
    });
    setOpenDialog(true);
  };

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'planning':
        return 'warning';
      case 'on_hold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'planning':
        return 'Planning';
      case 'on_hold':
        return 'On Hold';
      default:
        return 'Unknown';
    }
  };

  const getPriorityIcon = (priority) => {
    const count = priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;
    return Array.from({ length: count }, (_, i) => (
      <StarIcon key={i} sx={{ fontSize: 16, color: '#ffd700' }} />
    ));
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return `${theme.palette.success.main}, ${theme.palette.success.light}`;
    if (progress >= 50) return `${theme.palette.info.main}, ${theme.palette.info.light}`;
    if (progress >= 20) return `${theme.palette.warning.main}, ${theme.palette.warning.light}`;
    return `${theme.palette.error.main}, ${theme.palette.error.light}`;
  };

  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const renderProjectCard = (project, index) => (
    <Grid item xs={12} md={6} lg={4} key={project._id || index}>
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
                onClick={(e) => handleMenuClick(e, project)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Status & Progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip
                  label={getStatusText(project.status)}
                  color={getStatusColor(project.status)}
                  size="small"
                  variant="filled"
                />
                <Typography variant="body2" fontWeight="bold">
                  {calculateProgress(project)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(project)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  background: alpha(theme.palette.grey[300], 0.3),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getProgressColor(calculateProgress(project))})`,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
              {project.description ? (
                project.description.length > 100 
                  ? `${project.description.substring(0, 100)}...`
                  : project.description
              ) : 'No description available'}
            </Typography>

            {/* Team Members */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Team Members
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
                    {project.teamMembers.map((member, idx) => (
                      <Tooltip key={idx} title={member.name || member.username}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            fontWeight: 'bold'
                          }}
                        >
                          {(member.name || member.username)?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No team members assigned
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {project.teamMembers ? project.teamMembers.length : 0} members
                </Typography>
              </Box>
            </Box>

            {/* Timeline */}
            {(project.startDate || project.endDate) && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {project.startDate && format(new Date(project.startDate), 'MMM dd')}
                  {project.startDate && project.endDate && ' - '}
                  {project.endDate && format(new Date(project.endDate), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}
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
              onClick={() => handleEditProject(project)}
            >
              View Details
            </Button>
          </CardActions>
        </ProjectCard>
      </Zoom>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
        onClick={() => {
          resetForm();
          setOpenDialog(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditProject(selectedProject);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteProject(selectedProject._id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Project
        </MenuItem>
      </Menu>

      {/* Project Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
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
          {selectedProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
            onClick={selectedProject ? handleUpdateProject : handleCreateProject}
          >
            {selectedProject ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectManagement;
