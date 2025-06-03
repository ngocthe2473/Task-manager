import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  AvatarGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AssignmentTurnedIn as TasksIcon,
  Alarm as AlarmIcon,
  EventNote as EventIcon,
  Assessment as ReportIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { getAllTasks, getUsers, getProjects, createUser, updateUser, deleteUser, addProject, updateProject, deleteProject } from '../services/apiService';

// Modern minimalist styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: '24px',
  backgroundColor: '#fafafa',
  minHeight: '100vh'
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 700,
  color: '#333',
  letterSpacing: '-0.5px',
  marginBottom: '24px'
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e0e0e0'
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontWeight: 700,
  color: '#333',
  marginBottom: '8px'
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#666'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: 'none',
  border: '1px solid #e0e0e0'
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#f5f5f5'
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  borderBottom: '1px solid #e0e0e0',
  fontSize: '14px',
  color: '#333'
}));

const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  borderBottom: '1px solid #e0e0e0',
  fontWeight: 600,
  color: '#555',
  backgroundColor: '#f5f5f5',
  fontSize: '14px'
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    active: { bg: '#e8f5e8', color: '#2e7d32' },
    pending: { bg: '#fff3e0', color: '#f57c00' },
    inactive: { bg: '#f5f5f5', color: '#757575' },
    overdue: { bg: '#ffebee', color: '#d32f2f' },
    completed: { bg: '#e8f5e8', color: '#2e7d32' },
    inProgress: { bg: '#e3f2fd', color: '#1976d2' }
  };
  
  const colorScheme = colors[status] || colors.pending;
  
  return {
    backgroundColor: colorScheme.bg,
    color: colorScheme.color,
    fontWeight: 600,
    fontSize: '12px',
    height: '24px'
  };
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: '24px',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 600,
    minHeight: '48px',
    color: '#666',
    '&.Mui-selected': {
      color: '#2196f3'
    }
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#2196f3',
    height: '3px',
    borderRadius: '2px'
  }
}));

const ModernButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  padding: '8px 16px'
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: '#666',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: '#333'
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px'
  }
}));

// Mock data for charts removed - using real data from API

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  // Generate chart data from real data
  const getTaskStatusData = () => {
    if (!tasks.length) return [];
    
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status;
      if (status === 'done' || status === 'completed') {
        acc.completed = (acc.completed || 0) + 1;
      } else if (status === 'in-progress' || status === 'in_progress') {
        acc.inProgress = (acc.inProgress || 0) + 1;
      } else {
        acc.pending = (acc.pending || 0) + 1;
      }
      return acc;
    }, {});

    return [
      { name: 'Completed', value: statusCounts.completed || 0, color: '#4caf50' },
      { name: 'In Progress', value: statusCounts.inProgress || 0, color: '#2196f3' },
      { name: 'Pending', value: statusCounts.pending || 0, color: '#ff9800' }
    ];
  };

  const getTeamPerformanceData = () => {
    if (!tasks.length || !projects.length) return [];
    
    // Group tasks by project/team
    const projectStats = projects.slice(0, 4).map(project => {
      const projectTasks = tasks.filter(task => 
        task.project?._id === project._id || 
        task.project === project._id ||
        task.projectId === project._id
      );
      const completed = projectTasks.filter(task => task.status === 'done' || task.status === 'completed').length;
      const inProgress = projectTasks.filter(task => task.status === 'in-progress' || task.status === 'in_progress').length;
      const pending = projectTasks.filter(task => !['done', 'completed', 'in-progress', 'in_progress'].includes(task.status)).length;
      
      return {
        name: project.name || `Project ${project._id?.slice(-4)}`,
        completed,
        inProgress,
        pending
      };
    });
    
    return projectStats;
  };

  const getRecentUsers = () => {
    return users.slice(0, 5).map(user => ({
      id: user._id,
      name: user.name || user.username,
      email: user.email,
      role: user.role || 'User',
      status: user.isActive !== false ? 'active' : 'inactive',
      joined: new Date(user.createdAt || Date.now()).toLocaleDateString()
    }));
  };

  const getRecentProjects = () => {
    return projects.slice(0, 5).map(project => ({
      id: project._id,
      name: project.name,
      status: project.status || 'pending',
      progress: project.progress || 0,
      members: project.team?.members?.length || 0,
      deadline: project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, projectsData, tasksData] = await Promise.all([
        getUsers(),
        getProjects(),
        getAllTasks()
      ]);

      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        activeProjects: projectsData.filter(p => p.status === 'in_progress').length,
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter(t => t.status === 'done' || t.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenUserDialog = (user = null) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenProjectDialog = (project = null) => {
    setSelectedProject(project);
    setProjectDialogOpen(true);
  };
  const handleCloseProjectDialog = () => {
    setProjectDialogOpen(false);
    setSelectedProject(null);
  };

  // User CRUD handlers
  const handleSaveUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      status: formData.get('status'),
    };

    if (!selectedUser) {
      userData.password = formData.get('password');
    }

    try {
      if (selectedUser) {
        await updateUser(selectedUser._id, userData);
      } else {
        await createUser(userData);
      }
      handleCloseUserDialog();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  // Project CRUD handlers
  const handleSaveProject = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const projectData = {
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
    };

    try {
      if (selectedProject) {
        await updateProject(selectedProject._id, projectData);
      } else {
        await addProject(projectData);
      }
      handleCloseProjectDialog();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  // Function to format date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // TabPanel component for switching between views
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

  return (
    <DashboardContainer>
      <PageTitle>Admin Dashboard</PageTitle>
      
      <StyledTabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Overview" icon={<AssessmentIcon />} iconPosition="start" />
        <Tab label="Users" icon={<PersonIcon />} iconPosition="start" />
        <Tab label="Projects" icon={<EventIcon />} iconPosition="start" />
        <Tab label="Tasks" icon={<TasksIcon />} iconPosition="start" />
      </StyledTabs>

      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <PersonIcon sx={{ color: '#2196f3' }} />
                  Total Users
                </CardTitle>
                <StatValue>{stats.totalUsers}</StatValue>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                  <StatLabel>+12% since last month</StatLabel>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <EventIcon sx={{ color: '#ff9800' }} />
                  Active Projects
                </CardTitle>
                <StatValue>{stats.activeProjects}</StatValue>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                  <StatLabel>+5 new this month</StatLabel>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <TasksIcon sx={{ color: '#4caf50' }} />
                  Completed Tasks
                </CardTitle>
                <StatValue>{stats.completedTasks}</StatValue>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                  <StatLabel>+18% this week</StatLabel>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <AlarmIcon sx={{ color: '#f44336' }} />
                  Overdue Tasks
                </CardTitle>
                <StatValue>8</StatValue>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#f44336', fontSize: 18, transform: 'rotate(180deg)' }} />
                  <StatLabel>-24% since last week</StatLabel>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <ReportIcon sx={{ color: '#2196f3' }} />
                  Team Performance
                </CardTitle>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getTeamPerformanceData()}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#4caf50" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" name="In Progress" fill="#2196f3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#ff9800" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <TasksIcon sx={{ color: '#2196f3' }} />
                  Task Status
                </CardTitle>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTaskStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >                        {getTaskStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <CardTitle>
                    <EventIcon sx={{ color: '#2196f3' }} />
                    Recent Projects
                  </CardTitle>
                  <ModernButton 
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => setActiveTab(2)}
                  >
                    View All
                  </ModernButton>
                </Box>
                
                <StyledTableContainer>
                  <Table size="medium">
                    <StyledTableHead>
                      <TableRow>
                        <StyledHeadCell>Project Name</StyledHeadCell>
                        <StyledHeadCell>Status</StyledHeadCell>
                        <StyledHeadCell>Progress</StyledHeadCell>
                        <StyledHeadCell>Team</StyledHeadCell>
                        <StyledHeadCell>Deadline</StyledHeadCell>
                      </TableRow>
                    </StyledTableHead>
                    <TableBody>
                      {getRecentProjects().slice(0, 4).map((project) => (
                        <TableRow key={project.id}>
                          <StyledTableCell>{project.name}</StyledTableCell>
                          <StyledTableCell>
                            <StatusChip 
                              label={project.status === 'inProgress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              status={project.status}
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{ 
                                  flex: 1, 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: '#f0f0f0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: project.status === 'completed' ? '#4caf50' : '#2196f3'
                                  }
                                }}
                              />
                              <Typography variant="caption" color="textSecondary">
                                {project.progress}%
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                              {[...Array(project.members)].map((_, index) => (
                                <Avatar 
                                  key={index} 
                                  sx={{ 
                                    width: 28, 
                                    height: 28, 
                                    fontSize: 12,
                                    backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                                  }}
                                >
                                  {String.fromCharCode(65 + index)}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2">
                              {formatDate(project.deadline)}
                            </Typography>
                          </StyledTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <CardTitle>
                    <PersonIcon sx={{ color: '#2196f3' }} />
                    Recent Users
                  </CardTitle>
                  <ModernButton 
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => setActiveTab(1)}
                  >
                    View All
                  </ModernButton>
                </Box>
                
                <StyledTableContainer>
                  <Table size="medium">
                    <StyledTableHead>
                      <TableRow>
                        <StyledHeadCell>User</StyledHeadCell>
                        <StyledHeadCell>Role</StyledHeadCell>
                        <StyledHeadCell>Status</StyledHeadCell>
                        <StyledHeadCell>Joined</StyledHeadCell>
                      </TableRow>
                    </StyledTableHead>
                    <TableBody>
                      {getRecentUsers().slice(0, 4).map((user) => (
                        <TableRow key={user.id}>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: `hsl(${user.id * 60}, 70%, 60%)`,
                                  fontSize: 14
                                }}
                              >
                                {user.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>{user.role}</StyledTableCell>
                          <StyledTableCell>
                            <StatusChip 
                              label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              status={user.status}
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell>{formatDate(user.joined)}</StyledTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={activeTab} index={1}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <CardTitle>
                <PersonIcon sx={{ color: '#2196f3' }} />
                Users Management
              </CardTitle>
              <ModernButton 
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenUserDialog()}
              >
                Add New User
              </ModernButton>
            </Box>
            
            <StyledTableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledHeadCell>User</StyledHeadCell>
                    <StyledHeadCell>Email</StyledHeadCell>
                    <StyledHeadCell>Role</StyledHeadCell>
                    <StyledHeadCell>Status</StyledHeadCell>
                    <StyledHeadCell>Joined Date</StyledHeadCell>
                    <StyledHeadCell align="right">Actions</StyledHeadCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {getRecentUsers().map((user) => (
                    <TableRow key={user.id}>
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: `hsl(${user.id * 60}, 70%, 60%)`,
                              fontSize: 16
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>{user.email}</StyledTableCell>
                      <StyledTableCell>{user.role}</StyledTableCell>
                      <StyledTableCell>
                        <StatusChip 
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          status={user.status}
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell>{formatDate(user.joined)}</StyledTableCell>                      <StyledTableCell align="right">
                        <Tooltip title="Edit">
                          <ActionButton size="small" onClick={() => handleOpenUserDialog(user)}>
                            <EditIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <ActionButton size="small" onClick={() => handleDeleteUser(user._id)}>
                            <DeleteIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </CardContent>
        </StyledCard>        {/* User Dialog */}
        <StyledDialog open={userDialogOpen} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSaveUser}>
            <DialogTitle>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    defaultValue={selectedUser?.name || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      defaultValue={selectedUser?.role || 'user'}
                      label="Role"
                      required
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      defaultValue={selectedUser?.status || 'active'}
                      label="Status"
                      required
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {!selectedUser && (
                  <>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        type="password"
                        label="Password"
                        name="password"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        type="password"
                        label="Confirm Password"
                        name="confirmPassword"
                        required
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ padding: '16px 24px' }}>
              <Button onClick={handleCloseUserDialog} color="inherit">
                Cancel
              </Button>
              <ModernButton type="submit" variant="contained" color="primary">
                {selectedUser ? 'Save Changes' : 'Add User'}
              </ModernButton>
            </DialogActions>
          </form>
        </StyledDialog>
      </TabPanel>

      {/* Projects Tab */}
      <TabPanel value={activeTab} index={2}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <CardTitle>
                <EventIcon sx={{ color: '#2196f3' }} />
                Projects Management
              </CardTitle>
              <ModernButton 
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenProjectDialog()}
              >
                Add New Project
              </ModernButton>
            </Box>
            
            <StyledTableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledHeadCell>Project Name</StyledHeadCell>
                    <StyledHeadCell>Status</StyledHeadCell>
                    <StyledHeadCell>Progress</StyledHeadCell>
                    <StyledHeadCell>Team Members</StyledHeadCell>
                    <StyledHeadCell>Deadline</StyledHeadCell>
                    <StyledHeadCell align="right">Actions</StyledHeadCell>
                  </TableRow>
                </StyledTableHead>                <TableBody>
                  {getRecentProjects().map((project) => (
                    <TableRow key={project.id}>
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: `hsl(${project.id * 60}, 70%, 60%)`,
                              fontSize: 16
                            }}
                          >
                            {project.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {project.name}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <StatusChip 
                          label={project.status === 'inProgress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          status={project.status}
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{ 
                              flex: 1, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: project.status === 'completed' ? '#4caf50' : '#2196f3'
                              }
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {project.progress}%
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                          {[...Array(project.members)].map((_, index) => (
                            <Avatar 
                              key={index} 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                fontSize: 12,
                                backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                              }}
                            >
                              {String.fromCharCode(65 + index)}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </StyledTableCell>
                      <StyledTableCell>{formatDate(project.deadline)}</StyledTableCell>
                      <StyledTableCell align="right">
                        <Tooltip title="Edit">
                          <ActionButton size="small" onClick={() => handleOpenProjectDialog(project)}>
                            <EditIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>                        <Tooltip title="Delete">
                          <ActionButton size="small" onClick={() => handleDeleteProject(project._id)}>
                            <DeleteIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </CardContent>
        </StyledCard>        {/* Project Dialog */}
        <StyledDialog open={projectDialogOpen} onClose={handleCloseProjectDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSaveProject}>
            <DialogTitle>
              {selectedProject ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Project Name"
                    name="name"
                    defaultValue={selectedProject?.name || ''}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      defaultValue={selectedProject?.status || 'planning'}
                      label="Status"
                      required
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
                      name="priority"
                      defaultValue={selectedProject?.priority || 'medium'}
                      label="Priority"
                      required
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Start Date"
                    name="startDate"
                    type="date"
                    defaultValue={selectedProject?.startDate ? selectedProject.startDate.split('T')[0] : ''}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="End Date"
                    name="endDate"
                    type="date"
                    defaultValue={selectedProject?.endDate ? selectedProject.endDate.split('T')[0] : ''}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Project Description"
                    name="description"
                    multiline
                    rows={3}
                    defaultValue={selectedProject?.description || ''}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ padding: '16px 24px' }}>
              <Button onClick={handleCloseProjectDialog} color="inherit">
                Cancel
              </Button>
              <ModernButton type="submit" variant="contained" color="primary">
                {selectedProject ? 'Save Changes' : 'Create Project'}
              </ModernButton>
            </DialogActions>
          </form>
        </StyledDialog>
      </TabPanel>

      {/* Tasks Tab */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <CheckCircleIcon sx={{ color: '#4caf50' }} />
                  Completed Tasks
                </CardTitle>
                <Box sx={{ mt: 2 }}>
                  <StatValue>392</StatValue>
                  <StatLabel>Last 30 days</StatLabel>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    On time: 352
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Late: 40
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <ScheduleIcon sx={{ color: '#2196f3' }} />
                  In Progress Tasks
                </CardTitle>
                <Box sx={{ mt: 2 }}>
                  <StatValue>57</StatValue>
                  <StatLabel>Across all teams</StatLabel>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    On schedule: 42
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Delayed: 15
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <CardTitle>
                  <ErrorIcon sx={{ color: '#f44336' }} />
                  Overdue Tasks
                </CardTitle>
                <Box sx={{ mt: 2 }}>
                  <StatValue>8</StatValue>
                  <StatLabel>Priority tasks</StatLabel>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    High priority: 5
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Medium priority: 3
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </TabPanel>
    </DashboardContainer>
  );
};

export default AdminDashboard;
