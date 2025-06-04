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
  FormHelperText,
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
  CircularProgress,
  Paper,
  Divider,
  Stack,
  Container,
  InputAdornment
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
  Visibility as ViewIcon,
  AddBox as AddBoxIcon,
  FolderSpecial as FolderSpecialIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GridView as GridViewIcon,
  List as ListViewIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { format, isAfter, isBefore } from 'date-fns';
import { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject,
  getProjectStats,
  getUsers,
  getAllTasks
} from '../services/apiService';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' ? '#0a0e27' : '#f8fafc',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 50%, #f3e5f5 100%)',
}));

const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette[color].main}15, ${theme.palette[color].main}25)`,
  border: `1px solid ${theme.palette[color].main}30`,
  borderRadius: 16,
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 40px ${theme.palette[color].main}20`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
  }
}));

const ProjectCard = styled(Card)(({ theme, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'in_progress': return theme.palette.info.main;
      case 'planning': return theme.palette.warning.main;
      case 'on_hold': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    borderRadius: 16,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: `1px solid ${alpha(getStatusColor(status), 0.2)}`,
    position: 'relative',
    animation: `${fadeInUp} 0.6s ease-out`,
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: `0 20px 40px ${alpha(getStatusColor(status), 0.15)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, ${getStatusColor(status)}, ${alpha(getStatusColor(status), 0.7)})`,
    }
  };
});

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
    }
  }
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: variant === 'contained' ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
  }
}));

const ProjectManagement = () => {
  const theme = useTheme();
  
  // State management
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    teamMembers: []
  });
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData, tasksData] = await Promise.all([
        getProjects(),
        getUsers(),
        getAllTasks()
      ]);
      
      setProjects(projectsData || []);
      setUsers(usersData || []);
      
      // Calculate enhanced stats
      const totalProjects = projectsData?.length || 0;
      const activeProjects = projectsData?.filter(p => p.status === 'in_progress').length || 0;
      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;
      const teamMembers = usersData?.length || 0;
      
      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        teamMembers
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'in_progress': return <PlayIcon />;
      case 'planning': return <TimeIcon />;
      case 'on_hold': return <PauseIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'planning': return 'warning';
      case 'on_hold': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const calculateProgress = (project) => {
    if (project.status === 'completed') return 100;
    if (project.status === 'planning') return 0;
    
    // Calculate based on date progress
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const now = new Date();
      
      if (isBefore(now, start)) return 0;
      if (isAfter(now, end)) return 100;
      
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.min(Math.max((elapsed / total) * 100, 0), 100);
    }
    
    return 30; // Default progress for in-progress projects
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Project CRUD operations
  const handleCreateProject = async () => {
    try {
      setLoading(true);
      const newProject = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addProject(newProject);
      await fetchData();
      setOpenDialog(false);
      resetForm();
      showSnackbar('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      showSnackbar('Error creating project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      setLoading(true);
      const updatedProject = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      await updateProject(selectedProject._id, updatedProject);
      await fetchData();
      setOpenDialog(false);
      resetForm();
      showSnackbar('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      showSnackbar('Error updating project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        await deleteProject(projectId);
        await fetchData();
        showSnackbar('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        showSnackbar('Error deleting project', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      teamMembers: []
    });
    setIsEditing(false);
    setSelectedProject(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'planning',
      priority: project.priority || 'Medium',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      teamMembers: project.teamMembers || []
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  if (loading && projects.length === 0) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Project Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your projects efficiently with real-time tracking and collaboration
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="primary">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.totalProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <FolderSpecialIcon fontSize="large" />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="info">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.activeProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <RocketIcon fontSize="large" />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="success">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.completedProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircleIcon fontSize="large" />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="secondary">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {stats.teamMembers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <PeopleIcon fontSize="large" />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Controls */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <SearchBox
                fullWidth
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  sx={{ borderRadius: 2 }}
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  sx={{ borderRadius: 2 }}
                >
                  <ListViewIcon />
                </IconButton>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <ActionButton
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
              >
                New Project
              </ActionButton>
            </Grid>
          </Grid>
        </Paper>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center',
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.5)
            }}
          >
            <FolderSpecialIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchTerm || filterStatus !== 'all' ? 'No projects found' : 'No projects yet'}
            </Typography>
            <Typography variant="body1" color="text.disabled" mb={3}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first project to get started with project management'
              }
            </Typography>
            {(!searchTerm && filterStatus === 'all') && (
              <ActionButton
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
              >
                Create First Project
              </ActionButton>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project, index) => (
              <Grid item xs={12} sm={6} lg={4} key={project._id}>
                <Fade in timeout={600 + index * 100}>
                  <ProjectCard status={project.status}>
                    <CardContent sx={{ pb: 1 }}>
                      {/* Project Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                            {project.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {project.description}
                          </Typography>
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

                      {/* Status and Priority */}
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          icon={getStatusIcon(project.status)}
                          label={project.status?.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(project.status)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={project.priority}
                          color={getPriorityColor(project.priority)}
                          size="small"
                        />
                      </Box>

                      {/* Progress */}
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {Math.round(calculateProgress(project))}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(project)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.grey[500], 0.2),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                            }
                          }}
                        />
                      </Box>

                      {/* Dates */}
                      {(project.startDate || project.endDate) && (
                        <Box display="flex" gap={2} mb={2}>
                          {project.startDate && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarTodayIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                Start: {format(new Date(project.startDate), 'MMM dd')}
                              </Typography>
                            </Box>
                          )}
                          {project.endDate && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarTodayIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                End: {format(new Date(project.endDate), 'MMM dd')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Team Members */}
                      {project.teamMembers && project.teamMembers.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PeopleIcon fontSize="small" color="action" />
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                            {project.teamMembers.map((memberId, idx) => {
                              const user = users.find(u => u._id === memberId);
                              return (
                                <Avatar key={idx} sx={{ bgcolor: 'primary.main' }}>
                                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                              );
                            })}
                          </AvatarGroup>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => {/* Navigate to project details */}}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(project)}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </ProjectCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            openEditDialog(selectedProject);
            setAnchorEl(null);
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
          <MenuItem onClick={() => {
            /* Navigate to project details */
            setAnchorEl(null);
          }}>
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleDeleteProject(selectedProject._id);
              setAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </Menu>

        {/* Create/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? 'Update project information' : 'Fill in the details to create a new project'}
            </Typography>
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="planning">Planning</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="on_hold">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Team Members</InputLabel>
                  <Select
                    multiple
                    value={formData.teamMembers}
                    onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                    label="Team Members"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((memberId) => {
                          const user = users.find(u => u._id === memberId);
                          return (
                            <Chip 
                              key={memberId} 
                              label={user?.name || 'Unknown'} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          {user.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <ActionButton
              variant="contained"
              onClick={isEditing ? handleUpdateProject : handleCreateProject}
              disabled={!formData.name.trim()}
            >
              {isEditing ? 'Update Project' : 'Create Project'}
            </ActionButton>
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
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </PageContainer>
  );
};

export default ProjectManagement;
