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
  CircularProgress,
  Paper,
  IconButton,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  RocketLaunch as RocketIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { getAllTasks } from '../services/fakeDatabaseService';
import { format } from 'date-fns';

// Pro Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  100% { box-shadow: 0 0 5px currentColor; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const HeroCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  borderRadius: '32px',
  padding: '32px',
  position: 'relative',
  overflow: 'hidden',
  animation: `${float} 6s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    animation: `${pulse} 4s ease-in-out infinite`,
    pointerEvents: 'none',
  },
}));

const StatsCard = styled(Card)(({ theme, delay = 0 }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: '24px',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  animation: `${slideInFromLeft} 0.8s ease-out ${delay}s both`,
  '&:hover': {
    transform: 'translateY(-12px) scale(1.03)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    '& .stats-icon': {
      animation: `${glow} 2s ease-in-out infinite`,
    },
  },
}));

const MetricCard = styled(Card)(({ theme, index = 0 }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.8)})`,
  backdropFilter: 'blur(15px)',
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  animation: `${slideInFromRight} 0.6s ease-out ${index * 0.1}s both`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
    '&::before': {
      left: '100%',
    },
  },
}));

const ProgressCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: '3rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  textFillColor: 'transparent',
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const GlowingChip = styled(Chip)(({ theme, glowcolor }) => ({
  background: `linear-gradient(45deg, ${glowcolor}, ${alpha(glowcolor, 0.8)})`,
  color: 'white',
  fontWeight: 'bold',
  animation: `${glow} 3s ease-in-out infinite`,
  boxShadow: `0 0 20px ${alpha(glowcolor, 0.5)}`,
}));

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const tasks = await getAllTasks();
        
        // Calculate statistics
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'done').length;
        const inProgress = tasks.filter(task => task.status === 'inprogress').length;
        const review = tasks.filter(task => task.status === 'review').length;
        const pending = tasks.filter(task => task.status === 'todo').length;
        
        // Calculate overdue tasks
        const today = new Date();
        const overdue = tasks.filter(task => {
          if (task.status !== 'done') {
            const dueDate = new Date(task.dueDate);
            return dueDate < today;
          }
          return false;
        }).length;
        
        setTaskStats({
          total,
          completed,
          inProgress: inProgress + review,
          pending,
          overdue,
        });

        // Set recent tasks
        setRecentTasks(tasks.slice(0, 5));
        
        // Mock team performance data
        setTeamPerformance([
          { name: 'Trần Ngọc Thế', tasks: 12, completed: 10, avatar: 'T' },
          { name: 'Nguyễn Tấn Long', tasks: 8, completed: 6, avatar: 'L' },
          { name: 'Trần Đại Việt', tasks: 15, completed: 13, avatar: 'V' },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading task data:', error);
        setLoading(false);
      }
    };

    fetchTaskData();
  }, []);

  // Calculate completion percentage
  const completionPercentage = taskStats.total > 0 
    ? (taskStats.completed / taskStats.total) * 100 
    : 0;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading awesome dashboard...
          </Typography>
        </Box>
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
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <HeroCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <RocketIcon sx={{ mr: 2, fontSize: 48 }} />
                    Welcome Back!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                    Your productivity command center
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <GlowingChip 
                      label={`${taskStats.total} Total Tasks`} 
                      icon={<AssignmentIcon />}
                      glowcolor={theme.palette.info.main}
                    />
                    <GlowingChip 
                      label={`${Math.round(completionPercentage)}% Complete`} 
                      icon={<TrendingUpIcon />}
                      glowcolor={theme.palette.success.main}
                    />
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <SpeedIcon sx={{ fontSize: 80, opacity: 0.3, animation: `${pulse} 3s infinite` }} />
                </Box>
              </Box>
            </Box>
          </HeroCard>
        </Box>
      </Fade>

      {/* Stats Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard delay={0.1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <AssignmentIcon 
                  className="stats-icon"
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.primary.main,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  }} 
                />
                <Badge
                  badgeContent="New"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    '& .MuiBadge-badge': {
                      animation: `${pulse} 2s infinite`,
                    },
                  }}
                />
              </Box>
              <AnimatedNumber variant="h3">
                {taskStats.total}
              </AnimatedNumber>
              <Typography variant="body1" color="text.secondary" fontWeight="bold">
                Total Tasks
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={85} 
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  background: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }} 
              />
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard delay={0.2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon 
                className="stats-icon"
                sx={{ 
                  fontSize: 48, 
                  color: theme.palette.success.main, 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                }} 
              />
              <AnimatedNumber variant="h3" sx={{ color: theme.palette.success.main }}>
                {taskStats.completed}
              </AnimatedNumber>
              <Typography variant="body1" color="text.secondary" fontWeight="bold">
                Completed
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                color="success"
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  background: alpha(theme.palette.success.main, 0.1),
                }} 
              />
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard delay={0.3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon 
                className="stats-icon"
                sx={{ 
                  fontSize: 48, 
                  color: theme.palette.info.main, 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                }} 
              />
              <AnimatedNumber variant="h3" sx={{ color: theme.palette.info.main }}>
                {taskStats.inProgress}
              </AnimatedNumber>
              <Typography variant="body1" color="text.secondary" fontWeight="bold">
                In Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.inProgress / taskStats.total) * 100 || 0} 
                color="info"
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  background: alpha(theme.palette.info.main, 0.1),
                }} 
              />
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard delay={0.4}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <WarningIcon 
                  className="stats-icon"
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.error.main,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  }} 
                />
                {taskStats.overdue > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: theme.palette.error.main,
                      animation: `${pulse} 1.5s infinite`,
                    }}
                  />
                )}
              </Box>
              <AnimatedNumber variant="h3" sx={{ color: theme.palette.error.main }}>
                {taskStats.overdue}
              </AnimatedNumber>
              <Typography variant="body1" color="text.secondary" fontWeight="bold">
                Overdue
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.overdue / taskStats.total) * 100 || 0} 
                color="error"
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  background: alpha(theme.palette.error.main, 0.1),
                }} 
              />
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Project Progress */}
        <Grid item xs={12} md={8}>
          <Slide direction="up" in timeout={1000}>
            <ProgressCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TimelineIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Overall Progress
                  </Typography>
                  <Chip 
                    label="Live" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 2, animation: `${pulse} 2s infinite` }}
                  />
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {Math.round(completionPercentage)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {taskStats.completed} of {taskStats.total} tasks completed
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionPercentage} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      background: alpha(theme.palette.grey[300], 0.3),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 6,
                      },
                    }} 
                  />
                </Box>

                {/* Task Distribution */}
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <MetricCard index={0}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="warning.main" fontWeight="bold">
                          {taskStats.pending}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          To Do
                        </Typography>
                      </CardContent>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={4}>
                    <MetricCard index={1}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="info.main" fontWeight="bold">
                          {taskStats.inProgress}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          In Progress
                        </Typography>
                      </CardContent>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={4}>
                    <MetricCard index={2}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {taskStats.completed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Done
                        </Typography>
                      </CardContent>
                    </MetricCard>
                  </Grid>
                </Grid>
              </CardContent>
            </ProgressCard>
          </Slide>
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} md={4}>
          <Slide direction="left" in timeout={1200}>
            <ProgressCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PeopleIcon sx={{ mr: 2, color: theme.palette.secondary.main, fontSize: 32 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Team Performance
                  </Typography>
                </Box>
                
                {teamPerformance.map((member, index) => (
                  <Zoom in timeout={800 + index * 200} key={member.name}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            animation: `${float} ${3 + index}s ease-in-out infinite`,
                          }}
                        >
                          {member.avatar}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.completed}/{member.tasks} tasks
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${Math.round((member.completed / member.tasks) * 100)}%`}
                          size="small"
                          color={member.completed / member.tasks > 0.8 ? 'success' : 'warning'}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(member.completed / member.tasks) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          background: alpha(theme.palette.grey[300], 0.3),
                        }} 
                      />
                    </Box>
                  </Zoom>
                ))}

                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ 
                    mt: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  View All Members
                </Button>
              </CardContent>
            </ProgressCard>
          </Slide>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Fade in timeout={1400}>
            <ProgressCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AnalyticsIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Recent Tasks
                    </Typography>
                    <Badge 
                      badgeContent={recentTasks.length} 
                      color="primary" 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      borderRadius: 3,
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    View All
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {recentTasks.map((task, index) => (
                    <Grid item xs={12} sm={6} md={4} key={task.id}>
                      <Zoom in timeout={600 + index * 100}>
                        <MetricCard index={index}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {task.title}
                              </Typography>
                              <Chip 
                                label={task.priority} 
                                size="small"
                                color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'info'}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {task.description?.substring(0, 60)}...
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip 
                                label={task.status} 
                                size="small"
                                variant="outlined"
                              />                              <Typography variant="caption" color="text.secondary">
                                Due: {typeof task.dueDate === 'string' ? task.dueDate : format(new Date(task.dueDate), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </MetricCard>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </ProgressCard>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
