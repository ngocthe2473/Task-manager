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
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

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

// Mock data for charts
const taskStatus = [
  { name: 'Completed', value: 68, color: '#4caf50' },
  { name: 'In Progress', value: 22, color: '#2196f3' },
  { name: 'Pending', value: 10, color: '#ff9800' }
];

const teamPerformance = [
  { name: 'Team A', completed: 45, inProgress: 15, pending: 5 },
  { name: 'Team B', completed: 30, inProgress: 20, pending: 8 },
  { name: 'Team C', completed: 55, inProgress: 10, pending: 3 },
  { name: 'Team D', completed: 25, inProgress: 25, pending: 12 }
];

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', joined: '2024-05-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'active', joined: '2024-05-12' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Developer', status: 'pending', joined: '2024-05-10' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Designer', status: 'inactive', joined: '2024-05-05' },
  { id: 5, name: 'Alex Brown', email: 'alex@example.com', role: 'Developer', status: 'active', joined: '2024-04-28' }
];

const recentProjects = [
  { 
    id: 1, 
    name: 'Website Redesign', 
    status: 'inProgress', 
    progress: 65, 
    members: 4,
    deadline: '2024-06-15'
  },
  { 
    id: 2, 
    name: 'Mobile App Development', 
    status: 'inProgress', 
    progress: 42, 
    members: 6,
    deadline: '2024-07-30'
  },
  { 
    id: 3, 
    name: 'Marketing Campaign', 
    status: 'completed', 
    progress: 100, 
    members: 3,
    deadline: '2024-05-20'
  },
  { 
    id: 4, 
    name: 'Database Migration', 
    status: 'pending', 
    progress: 10, 
    members: 2,
    deadline: '2024-08-01'
  },
  { 
    id: 5, 
    name: 'UI Component Library', 
    status: 'inProgress', 
    progress: 78, 
    members: 5,
    deadline: '2024-06-25'
  }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

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
                <StatValue>128</StatValue>
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
                <StatValue>24</StatValue>
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
                <StatValue>392</StatValue>
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
                      data={teamPerformance}
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
                        data={taskStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskStatus.map((entry, index) => (
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
                      {recentProjects.slice(0, 4).map((project) => (
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
                      {recentUsers.slice(0, 4).map((user) => (
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
                  {recentUsers.map((user) => (
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
                      <StyledTableCell>{formatDate(user.joined)}</StyledTableCell>
                      <StyledTableCell align="right">
                        <Tooltip title="Edit">
                          <ActionButton size="small" onClick={() => handleOpenUserDialog(user)}>
                            <EditIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <ActionButton size="small">
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
        </StyledCard>

        {/* User Dialog */}
        <StyledDialog open={userDialogOpen} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  defaultValue={selectedUser?.name || ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Email"
                  type="email"
                  defaultValue={selectedUser?.email || ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    defaultValue={selectedUser?.role || 'Developer'}
                    label="Role"
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Developer">Developer</MenuItem>
                    <MenuItem value="Designer">Designer</MenuItem>
                    <MenuItem value="Tester">Tester</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={selectedUser?.status || 'active'}
                    label="Status"
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
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      fullWidth
                      type="password"
                      label="Confirm Password"
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
            <ModernButton variant="contained" color="primary">
              {selectedUser ? 'Save Changes' : 'Add User'}
            </ModernButton>
          </DialogActions>
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
                </StyledTableHead>
                <TableBody>
                  {recentProjects.map((project) => (
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
                        </Tooltip>
                        <Tooltip title="Delete">
                          <ActionButton size="small">
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
        </StyledCard>

        {/* Project Dialog */}
        <StyledDialog open={projectDialogOpen} onClose={handleCloseProjectDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedProject ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Project Name"
                  defaultValue={selectedProject?.name || ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={selectedProject?.status || 'inProgress'}
                    label="Status"
                  >
                    <MenuItem value="inProgress">In Progress</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Deadline"
                  type="date"
                  defaultValue={selectedProject?.deadline || '2024-06-30'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Progress ({selectedProject?.progress || 0}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedProject?.progress || 0}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#2196f3'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Project Description"
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
            <ModernButton variant="contained" color="primary">
              {selectedProject ? 'Save Changes' : 'Create Project'}
            </ModernButton>
          </DialogActions>
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
