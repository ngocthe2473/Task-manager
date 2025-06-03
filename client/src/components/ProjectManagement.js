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
  InputAdornment,
  Stack
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
  Clear as ClearIcon
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
        return 'linear-gradient(135deg, #FF6B6B 0%, #EE5A24 50%, #FF416C 100%)';
      case 'Medium':
        return 'linear-gradient(135deg, #4481EB 0%, #04BEFE 50%, #4481EB 100%)';
      case 'Low':
        return 'linear-gradient(135deg, #43E97B 0%, #38F9D7 50%, #43E97B 100%)';
      default:
        return 'linear-gradient(135deg, #A8BFFF 0%, #884D80 50%, #A8BFFF 100%)';
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
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team: '',
    status: 'planning',
    priority: 'Medium',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Filter projects based on search term and filters
  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter]);
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      
      // Handle both array response and object response with data property
      const projectsData = Array.isArray(response) ? response : (response.data || []);
      setProjects(projectsData);
      
      // Calculate stats
      const totalProjects = projectsData.length;
      const activeProjects = projectsData.filter(p => p.status === 'in_progress').length;
      const completedProjects = projectsData.filter(p => p.status === 'completed').length;
      
      // Calculate unique team members from all projects
      const allMembers = new Set();
      projectsData.forEach(project => {
        if (project.team?.members) {
          project.team.members.forEach(member => allMembers.add(member._id || member));
        }
      });
      
      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        teamMembers: allMembers.size
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]); // Set empty array on error
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error loading projects',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchTeams = async () => {
    try {
      const response = await getUsers();
      // Handle response properly - could be array or object with data property
      const usersData = Array.isArray(response) ? response : (response.data || []);
      setTeams(usersData);
      
      // Update team members stat based on users
      setStats(prev => ({
        ...prev,
        teamMembers: usersData.length
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]); // Set empty array on error
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    // Team is optional
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
    return errors;
  };
  const handleCreateProject = async () => {
    setIsSubmitting(true);
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const projectData = {
          ...formData,
          team: formData.team || undefined // Send undefined if no team selected
        };
        
        const response = await addProject(projectData);
        const newProject = response.data || response; // Handle different response structures
        
        setProjects(prev => [newProject, ...prev]);
        setOpenDialog(false);
        resetForm();
        setSnackbar({
          open: true,
          message: 'Project created successfully!',
          severity: 'success'
        });
        await fetchProjects(); // Refresh to get updated data and stats
      } catch (error) {
        console.error('Error creating project:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error creating project',
          severity: 'error'
        });
      }
    }
    setIsSubmitting(false);
  };
  const handleUpdateProject = async () => {
    setIsSubmitting(true);
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const projectData = {
          ...formData,
          team: formData.team || undefined
        };
        
        const response = await updateProject(selectedProject._id, projectData);
        const updatedProject = response.data || response;
        
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
        await fetchProjects(); // Refresh to get updated stats
      } catch (error) {
        console.error('Error updating project:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error updating project',
          severity: 'error'
        });
      }
    }
    setIsSubmitting(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
    setFormErrors({});
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

  // Search and Filter handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const renderDialog = () => (
    <Dialog
      open={openDialog}
      onClose={() => {
        setOpenDialog(false);
        resetForm();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {selectedProject ? <EditIcon color="primary" /> : <AddBoxIcon color="primary" />}
        {selectedProject ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>      <DialogContent sx={{ mt: 2, p: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12}>
            <TextField
              name="name"
              label="Project Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>
          
          <Grid xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
              required
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors.team}>
              <InputLabel>Team (Optional)</InputLabel>              <Select
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                label="Team (Optional)"
                sx={{ 
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              >
                <MenuItem value="">
                  <em>No team assigned</em>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name || team.email}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.team && (
                <FormHelperText>{formErrors.team}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
                sx={{ 
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                label="Priority"
                sx={{ 
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              >
                <MenuItem value="High">High Priority</MenuItem>
                <MenuItem value="Medium">Medium Priority</MenuItem>
                <MenuItem value="Low">Low Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>          <Grid xs={12} sm={6}>
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              fullWidth
              value={formData.startDate}
              onChange={handleInputChange}
              error={!!formErrors.startDate}
              helperText={formErrors.startDate}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          <Grid xs={12} sm={6}>
            <TextField
              name="endDate"
              label="End Date"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={handleInputChange}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={() => {
            setOpenDialog(false);
            resetForm();
          }}
          variant="outlined"
          sx={{ 
            borderRadius: '12px',
            minWidth: 100
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={selectedProject ? handleUpdateProject : handleCreateProject}
          variant="contained"
          disabled={isSubmitting}
          sx={{ 
            borderRadius: '12px',
            minWidth: 120,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          }}
        >
          {isSubmitting ? 'Processing...' : (selectedProject ? 'Update Project' : 'Create Project')}
        </Button>
      </DialogActions>
    </Dialog>
  );
              value={formData.endDate}
              onChange={handleInputChange}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => {
            setOpenDialog(false);
            resetForm();
          }}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={selectedProject ? handleUpdateProject : handleCreateProject}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : (selectedProject ? <EditIcon /> : <AddIcon />)}
        >
          {isSubmitting ? 'Processing...' : (selectedProject ? 'Update Project' : 'Create Project')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderProjectCard = (project, index) => (
    <Grid xs={12} md={6} lg={4} key={project._id || index}>
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
                    {project.teamMembers.map((member, idx) => (                      <Tooltip key={idx} title={member.name}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            fontWeight: 'bold'
                          }}
                        >
                          {member.name?.charAt(0)?.toUpperCase()}
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
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Project Management
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedProject(null);
            setOpenDialog(true);
          }}
          sx={{
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          }}
        >
          Create Project        </Button>
      </Box>

      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ 
              flexGrow: 1, 
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on_hold">On Hold</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
              label="Priority"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="all">All Priority</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            sx={{ 
              borderRadius: '12px',
              minWidth: 'auto',
              height: '40px'
            }}
          >
            Clear
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatsCard
            gradient={`linear-gradient(135deg, #2193b0, #6dd5ed)`}
            sx={{ p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Total Projects</Typography>
            </Box>
            <Typography variant="h4">{stats.totalProjects}</Typography>
          </StatsCard>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatsCard
            gradient={`linear-gradient(135deg, #11998e, #38ef7d)`}
            sx={{ p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Active Projects</Typography>
            </Box>
            <Typography variant="h4">{stats.activeProjects}</Typography>
          </StatsCard>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatsCard
            gradient={`linear-gradient(135deg, #ee0979, #ff6a00)`}
            sx={{ p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <RocketIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Completed</Typography>
            </Box>
            <Typography variant="h4">{stats.completedProjects}</Typography>
          </StatsCard>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatsCard
            gradient={`linear-gradient(135deg, #4A00E0, #8E2DE2)`}
            sx={{ p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Team Members</Typography>
            </Box>
            <Typography variant="h4">{stats.teamMembers}</Typography>
          </StatsCard>
        </Grid>
      </Grid>      {/* Project Cards Grid */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid xs={12} sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading projects...
            </Typography>
          </Grid>
        ) : filteredProjects.length === 0 ? (
          <Grid xs={12} sx={{ textAlign: 'center', py: 5 }}>
            <FolderSpecialIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {projects.length === 0 ? 'No projects found' : 'No projects match your filters'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {projects.length === 0 ? 'Create your first project!' : 'Try adjusting your search or filters'}
            </Typography>
            {projects.length > 0 && (
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ mt: 2, borderRadius: '12px' }}
              >
                Clear Filters
              </Button>
            )}
          </Grid>
        ) : (
          filteredProjects.map(renderProjectCard)
        )}
      </Grid>

      {/* Project Dialog */}
      {renderDialog()}

      {/* Project Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditProject(selectedProject);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteProject(selectedProject._id);
          handleMenuClose();
        }} sx={{ color: theme.palette.error.main }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectManagement;
