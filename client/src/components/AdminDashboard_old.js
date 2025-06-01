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
  Switch,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
  AvatarGroup,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  Cloud as CloudIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Epic Admin Animations
const matrixRain = keyframes`
  0% { transform: translateY(-100vh); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const hologramGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 20px currentColor, 0 0 35px currentColor, 0 0 40px currentColor;
    transform: scale(1.02);
  }
`;

const dataFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const cyberpunkPulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const glitchEffect = keyframes`
  0%, 100% { transform: translate(0); }
  10% { transform: translate(-2px, 2px); }
  20% { transform: translate(-2px, -2px); }
  30% { transform: translate(2px, 2px); }
  40% { transform: translate(2px, -2px); }
  50% { transform: translate(-2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  70% { transform: translate(2px, 2px); }
  80% { transform: translate(-2px, -2px); }
  90% { transform: translate(2px, 2px); }
`;

// Cyberpunk Styled Components
const CyberpunkCard = styled(Card)(({ theme, variant = 'primary' }) => {
  const getGradient = (variant) => {
    switch (variant) {
      case 'danger':
        return 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)';
      case 'success':
        return 'linear-gradient(135deg, #00ff88 0%, #00b4db 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #ffb347 0%, #ff6b6b 100%)';
      case 'info':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: `2px solid transparent`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: getGradient(variant),
      borderRadius: '20px',
      padding: '2px',
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      maskComposite: 'subtract',
      zIndex: -1,
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
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
      animation: `${hologramGlow} 2s ease-in-out infinite`,
      '&::after': {
        left: '100%',
      },
    },
  };
});

const MatrixBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.03)})`,
  zIndex: -2,
  '&::before': {
    content: '"0101010110101010011010101010110101010101011010101010101101010101"',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '200%',
    color: alpha(theme.palette.primary.main, 0.1),
    fontSize: '12px',
    fontFamily: 'monospace',
    letterSpacing: '2px',
    lineHeight: '20px',
    animation: `${matrixRain} 20s linear infinite`,
    wordWrap: 'break-word',
    overflow: 'hidden',
  },
}));

const HologramCard = styled(Card)(({ theme, color = 'primary' }) => {
  const getColor = (color) => {
    switch (color) {
      case 'error': return theme.palette.error.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  return {
    background: `linear-gradient(135deg, ${alpha(getColor(color), 0.1)}, ${alpha(getColor(color), 0.05)})`,
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    border: `1px solid ${alpha(getColor(color), 0.3)}`,
    position: 'relative',
    overflow: 'hidden',
    animation: `${cyberpunkPulse} 3s ease-in-out infinite`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${getColor(color)}, transparent)`,

      animation: `${dataFlow} 3s ease-in-out infinite`,
    },
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 0 30px ${alpha(getColor(color), 0.5)}`,
      animation: `${hologramGlow} 1.5s ease-in-out infinite`,
    },
  };
});

const CyberButton = styled(Button)(({ theme, variant = 'primary' }) => {
  const getGradient = (variant) => {
    switch (variant) {
      case 'danger':
        return `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`;
      case 'success':
        return `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`;
      default:
        return `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
    }
  };

  return {
    background: getGradient(variant),
    borderRadius: '25px',
    color: 'white',
    padding: '12px 32px',
    fontWeight: 'bold',
    textTransform: 'none',
    position: 'relative',
    overflow: 'hidden',
    border: 'none',
    transition: 'all 0.3s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.6s ease',
    },
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      animation: `${glitchEffect} 0.3s ease-in-out`,
      '&::before': {
        left: '100%',
      },
    },
  };
});

const AdminPanel = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  minHeight: '80vh',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: `${dataFlow} 3s ease-in-out infinite`,
  },
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admin-tabpanel-${index}`}
    aria-labelledby={`admin-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
  </div>
);

const AdminDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 157,
    activeProjects: 23,
    completedTasks: 1247,
    systemHealth: 98.5,
    cpuUsage: 45,
    memoryUsage: 67,
    storageUsage: 34,
    networkTraffic: 89,
  });
  const [realtimeData, setRealtimeData] = useState({
    onlineUsers: 42,
    activeConnections: 156,
    requestsPerSecond: 234,
    errorRate: 0.2,
  });

  useEffect(() => {
    fetchAdminData();
    
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 6) - 3,
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 20) - 10,
        requestsPerSecond: prev.requestsPerSecond + Math.floor(Math.random() * 50) - 25,
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.1),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      // Mock data
      const mockUsers = [
        {
          _id: '1',
          name: 'Trần Ngọc Thế',
          email: 'the@example.com',
          role: 'admin',
          isActive: true,
          lastLogin: '2024-01-20T10:30:00Z',
          tasksCompleted: 45,
          avatar: 'T'
        },
        {
          _id: '2',
          name: 'Nguyễn Tấn Long',
          email: 'long@example.com',
          role: 'manager',
          isActive: true,
          lastLogin: '2024-01-20T09:15:00Z',
          tasksCompleted: 32,
          avatar: 'L'
        },
        {
          _id: '3',
          name: 'Trần Đại Việt',
          email: 'viet@example.com',
          role: 'user',
          isActive: false,
          lastLogin: '2024-01-19T16:45:00Z',
          tasksCompleted: 28,
          avatar: 'V'
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderSystemOverview = () => (
    <Grid container spacing={3}>
      {/* Real-time System Stats */}
      <Grid item xs={12}>
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SpeedIcon sx={{ mr: 2, fontSize: 40, color: theme.palette.primary.main }} />
              System Command Center
              <Chip 
                label="LIVE" 
                color="success" 
                size="small" 
                sx={{ 
                  ml: 2, 
                  animation: `${cyberpunkPulse} 2s infinite`,
                  fontWeight: 'bold'
                }}
              />
            </Typography>
          </Box>
        </Fade>
      </Grid>

      {/* Primary Stats Grid */}
      <Grid item xs={12} md={3}>
        <Zoom in timeout={400}>
          <HologramCard color="primary">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Badge badgeContent="+" color="success" sx={{ mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
              </Badge>
              <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                {systemStats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                +12 this week
              </Typography>
            </CardContent>
          </HologramCard>
        </Zoom>
      </Grid>

      <Grid item xs={12} md={3}>
        <Zoom in timeout={600}>
          <HologramCard color="success">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Badge badgeContent={realtimeData.onlineUsers} color="error" sx={{ mb: 2 }}>
                <AssignmentIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />
              </Badge>
              <Typography variant="h3" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                {systemStats.activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 'bold' }}>
                {realtimeData.onlineUsers} online now
              </Typography>
            </CardContent>
          </HologramCard>
        </Zoom>
      </Grid>

      <Grid item xs={12} md={3}>
        <Zoom in timeout={800}>
          <HologramCard color="info">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Badge badgeContent="99.8%" color="success" sx={{ mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.info.main }} />
              </Badge>
              <Typography variant="h3" fontWeight="bold" color="info.main" sx={{ mb: 1 }}>
                {systemStats.completedTasks.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasks Completed
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                Success Rate
              </Typography>
            </CardContent>
          </HologramCard>
        </Zoom>
      </Grid>

      <Grid item xs={12} md={3}>
        <Zoom in timeout={1000}>
          <HologramCard color="warning">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Badge badgeContent="OPTIMAL" color="success" sx={{ mb: 2 }}>
                <TrendingUpIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.warning.main,
                    animation: `${cyberpunkPulse} 2s infinite`
                  }} 
                />
              </Badge>
              <Typography variant="h3" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                {systemStats.systemHealth}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Health
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                All systems green
              </Typography>
            </CardContent>
          </HologramCard>
        </Zoom>
      </Grid>

      {/* Real-time Performance Monitor */}
      <Grid item xs={12} md={8}>
        <Slide direction="up" in timeout={1200}>
          <CyberpunkCard>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AnalyticsIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
                <Typography variant="h5" fontWeight="bold">
                  Real-time Performance Monitor
                </Typography>
                <Chip 
                  label={`${realtimeData.requestsPerSecond} req/s`}
                  size="small" 
                  color="info" 
                  sx={{ ml: 2, animation: `${dataFlow} 2s infinite` }}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">CPU Usage</Typography>
                      <Typography variant="body2" color="primary">{systemStats.cpuUsage}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemStats.cpuUsage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: alpha(theme.palette.grey[300], 0.3),
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">Memory Usage</Typography>
                      <Typography variant="body2" color="warning.main">{systemStats.memoryUsage}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemStats.memoryUsage}
                      color="warning"
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: alpha(theme.palette.grey[300], 0.3),
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">Storage Usage</Typography>
                      <Typography variant="body2" color="success.main">{systemStats.storageUsage}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemStats.storageUsage}
                      color="success"
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: alpha(theme.palette.grey[300], 0.3),
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">Network Traffic</Typography>
                      <Typography variant="body2" color="info.main">{systemStats.networkTraffic}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemStats.networkTraffic}
                      color="info"
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: alpha(theme.palette.grey[300], 0.3),
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Live Metrics */}
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                borderRadius: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <Grid container spacing={3} sx={{ textAlign: 'center' }}>
                  <Grid item xs={3}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {realtimeData.activeConnections}
                    </Typography>
                    <Typography variant="caption">Active Connections</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {realtimeData.requestsPerSecond}
                    </Typography>
                    <Typography variant="caption">Requests/sec</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h6" color="info.main" fontWeight="bold">
                      {realtimeData.onlineUsers}
                    </Typography>
                    <Typography variant="caption">Online Users</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {realtimeData.errorRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption">Error Rate</Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </CyberpunkCard>
        </Slide>
      </Grid>

      {/* Quick Actions Panel */}
      <Grid item xs={12} md={4}>
        <Slide direction="left" in timeout={1400}>
          <CyberpunkCard variant="info">
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AdminIcon sx={{ mr: 2, color: theme.palette.secondary.main, fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  Quick Actions
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CyberButton variant="primary" fullWidth startIcon={<AddIcon />}>
                  Create New User
                </CyberButton>
                <CyberButton variant="success" fullWidth startIcon={<AssignmentIcon />}>
                  Launch Project
                </CyberButton>
                <CyberButton variant="primary" fullWidth startIcon={<AnalyticsIcon />}>
                  Generate Report
                </CyberButton>
                <CyberButton variant="danger" fullWidth startIcon={<SecurityIcon />}>
                  Security Scan
                </CyberButton>
              </Box>

              {/* System Alerts */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  System Alerts
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  mb: 1
                }}>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ✓ All systems operational
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last checked: 2 minutes ago
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    ⚠ High memory usage detected
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consider optimizing queries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CyberpunkCard>
        </Slide>
      </Grid>
    </Grid>
  );

  const renderUserManagement = () => (
    <CyberpunkCard>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              User Management Console
            </Typography>
            <Badge badgeContent={users.length} color="primary" sx={{ ml: 2 }} />
          </Box>
          <CyberButton startIcon={<AddIcon />}>
            Add New User
          </CyberButton>
        </Box>

        <TableContainer component={Paper} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(10px)',
        }}>
          <Table>
            <TableHead sx={{ 
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>User Profile</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role & Permissions</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status & Activity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Performance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <Fade in timeout={400 + index * 200} key={user._id}>
                  <TableRow
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.05),
                        transform: 'scale(1.01)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            fontWeight: 'bold',
                            animation: user.isActive ? `${cyberpunkPulse} 3s infinite` : 'none',
                          }}
                        >
                          {user.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.toUpperCase()}
                        size="small"
                        color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'primary'}
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={user.isActive ? 'ONLINE' : 'OFFLINE'}
                          size="small"
                          color={user.isActive ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ 
                            mb: 1,
                            animation: user.isActive ? `${hologramGlow} 2s infinite` : 'none',
                          }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Last: {new Date(user.lastLogin).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                        <Typography variant="body2" fontWeight="bold">
                          {user.tasksCompleted}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          tasks
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small"
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': { 
                                background: alpha(theme.palette.primary.main, 0.2),
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Profile">
                          <IconButton 
                            size="small"
                            sx={{
                              background: alpha(theme.palette.info.main, 0.1),
                              '&:hover': { 
                                background: alpha(theme.palette.info.main, 0.2),
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <IconButton 
                            size="small"
                            sx={{
                              background: alpha(theme.palette.grey[500], 0.1),
                              '&:hover': { 
                                background: alpha(theme.palette.grey[500], 0.2),
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                </Fade>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </CyberpunkCard>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <MatrixBackground />
      
      <Box sx={{ position: 'relative', zIndex: 1, p: 4 }}>
        {/* Epic Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              fontWeight="bold"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${glitchEffect} 5s infinite`,
              }}
            >
              <AdminIcon sx={{ mr: 3, fontSize: 60, color: theme.palette.primary.main }} />
              ADMIN CONTROL CENTER
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="300">
              Complete system domination at your fingertips
            </Typography>
          </Box>
        </Fade>

        {/* Navigation Tabs */}
        <AdminPanel sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '& .MuiTab-root': {
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 72,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-2px)',
                },
              },
              '& .Mui-selected': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                animation: `${hologramGlow} 2s infinite`,
              },
            }}
          >
            <Tab icon={<DashboardIcon />} label="System Overview" />
            <Tab icon={<PeopleIcon />} label="User Management" />
            <Tab icon={<AssignmentIcon />} label="Project Control" />
            <Tab icon={<AnalyticsIcon />} label="Analytics Hub" />
            <Tab icon={<SecurityIcon />} label="Security Center" />
            <Tab icon={<SettingsIcon />} label="System Config" />
          </Tabs>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            {renderSystemOverview()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderUserManagement()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h4" sx={{ textAlign: 'center', py: 8 }}>
              Project Control Center - Coming Soon
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h4" sx={{ textAlign: 'center', py: 8 }}>
              Advanced Analytics Hub - Coming Soon
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h4" sx={{ textAlign: 'center', py: 8 }}>
              Security Command Center - Coming Soon
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h4" sx={{ textAlign: 'center', py: 8 }}>
              System Configuration - Coming Soon
            </Typography>
          </TabPanel>
        </AdminPanel>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
