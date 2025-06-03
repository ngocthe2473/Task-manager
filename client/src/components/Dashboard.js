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
  LinearProgress,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip
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
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getAllTasks, getProjects, getUsers } from '../services/apiService';
import { format } from 'date-fns';

// Modern minimalist styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: '24px',
  backgroundColor: '#fafafa',
  minHeight: '100vh'
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  marginBottom: '32px',
}));

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 700,
  color: '#333',
  marginBottom: '8px',
  letterSpacing: '-0.5px',
}));

const WelcomeSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#666',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e0e0e0',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e0e0e0',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const TaskItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0
  }
}));

const TaskInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}));

const TaskAvatar = styled(Avatar)(({ theme, priority }) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    urgent: '#e91e63'
  };
  
  return {
    width: 32,
    height: 32,
    backgroundColor: colors[priority] || colors.medium,
    fontSize: 14
  };
});

const TaskDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column'
}));

const TaskTitle = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333'
}));

const TaskMeta = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  color: '#666'
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    done: { bg: '#e8f5e8', color: '#2e7d32' },
    'in-progress': { bg: '#e3f2fd', color: '#1976d2' },
    review: { bg: '#fff3e0', color: '#f57c00' },
    todo: { bg: '#f5f5f5', color: '#757575' },
    overdue: { bg: '#ffebee', color: '#d32f2f' }
  };
  
  const colorScheme = colors[status] || colors.todo;
  
  return {
    backgroundColor: colorScheme.bg,
    color: colorScheme.color,
    fontWeight: 600,
    fontSize: '11px',
    height: '20px'
  };
});

const TeamMember = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  fontSize: 14,
}));

const MemberInfo = styled(Box)(({ theme }) => ({
  marginLeft: '12px'
}));

const MemberName = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333'
}));

const MemberRole = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  color: '#666'
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  padding: '8px 16px',
  marginTop: '16px'
}));

const ProjectCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e0e0e0',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const ProjectHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px'
}));

const ProjectTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: '#333'
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    upcomingTasks: 0,
    overdueTasks: 0,
    productivity: 0
  });  const [recentTasks, setRecentTasks] = useState([]);  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Get user info from localStorage 
  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        return userData.user || { name: 'User', role: 'User' };
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
    return { name: 'User', role: 'User' };
  };
  const user = getUserInfo();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const allTasks = await getAllTasks();
        
        const completed = allTasks.filter(task => task.status === 'done').length;
        const inProgress = allTasks.filter(task => task.status === 'in-progress').length;
        const upcoming = allTasks.filter(task => task.status === 'todo').length;
        const overdue = allTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
        ).length;
          // Calculate productivity percentage
        const productivity = Math.round((completed / (completed + inProgress + upcoming)) * 100) || 0;
        
        setStats({
          totalTasks: allTasks.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          upcomingTasks: upcoming,
          overdueTasks: overdue,
          productivity
        });
        
        // Set recent tasks - get the 5 most recent
        setRecentTasks(
          [...allTasks]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 5)
        );
        
        // Fetch projects
        const allProjects = await getProjects();
        console.log('Fetched projects:', allProjects); // Debug log
        
        // Process projects data to include task counts and progress
        const processedProjects = allProjects.map(project => {
          // Filter tasks by project
          const projectTasks = allTasks.filter(task => task.project && task.project._id === project._id);
          const completedProjectTasks = projectTasks.filter(task => task.status === 'done').length;
          const progress = projectTasks.length > 0 ? Math.round((completedProjectTasks / projectTasks.length) * 100) : 0;
          
          return {
            ...project,
            id: project._id,
            taskCount: projectTasks.length,
            completedTasks: completedProjectTasks,
            progress: progress,
            color: getProjectColor(project._id) // Generate a color based on project ID
          };        });
        
        setProjects(processedProjects);
        
        // Fetch team members (users)
        const allUsers = await getUsers();
        console.log('Fetched team members:', allUsers); // Debug log
        
        // Process users to create team members list (exclude current user)
        const members = allUsers
          .filter(user => user._id !== getUserInfo()._id) // Exclude current user
          .slice(0, 4) // Limit to 4 members for display
          .map(user => ({
            id: user._id,
            name: user.name,
            role: user.role === 'admin' ? 'Admin' : 'Team Member',
            avatar: null
          }));
          setTeamMembers(members);
        
        // Create upcoming events from tasks with due dates in the next 7 days
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingTaskEvents = allTasks
          .filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate <= nextWeek && task.status !== 'done';
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 3) // Limit to 3 upcoming events
          .map(task => ({
            id: task._id,
            title: `Task: ${task.title}`,
            date: formatDate(task.dueDate),
            time: task.priority === 'high' ? 'High Priority' : task.priority === 'urgent' ? 'Urgent' : 'Normal',
            type: 'task'
          }));
          
        setUpcomingEvents(upcomingTaskEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to generate project colors
  const getProjectColor = (projectId) => {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548'];
    const index = projectId ? projectId.length % colors.length : 0;
    return colors[index];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd');
    } catch (error) {
      return 'N/A';
    }
  };
  
  // Helper function to check if a date is overdue
  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };
  
  // Calculate current time
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = 'Good Evening';
  if (currentHour < 12) {
    greeting = 'Good Morning';
  } else if (currentHour < 18) {
    greeting = 'Good Afternoon';
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeTitle>{greeting}, {user.name}!</WelcomeTitle>
        <WelcomeSubtitle>
          Here's what's happening with your projects today.
        </WelcomeSubtitle>
      </DashboardHeader>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <CardTitle>
                    <AssignmentIcon sx={{ color: '#2196f3' }} />
                    Total Tasks
                  </CardTitle>
                  <StatValue>{stats.totalTasks}</StatValue>
                  <StatLabel>Across all projects</StatLabel>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <CardTitle>
                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                    Completed
                  </CardTitle>
                  <StatValue>{stats.completedTasks}</StatValue>
                  <StatLabel>Tasks finished</StatLabel>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <CardTitle>
                    <ScheduleIcon sx={{ color: '#ff9800' }} />
                    In Progress
                  </CardTitle>
                  <StatValue>{stats.inProgressTasks}</StatValue>
                  <StatLabel>Tasks in progress</StatLabel>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <CardTitle>
                    <WarningIcon sx={{ color: '#f44336' }} />
                    Overdue
                  </CardTitle>
                  <StatValue>{stats.overdueTasks}</StatValue>
                  <StatLabel>Tasks past due date</StatLabel>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
          
          <Grid container spacing={3}>
            {/* Recent Tasks */}
            <Grid item xs={12} lg={8}>
              <StyledPaper>
                <SectionTitle>
                  <AssignmentIcon sx={{ color: '#2196f3' }} />
                  Recent Tasks
                </SectionTitle>
                <Box>
                  {recentTasks.length > 0 ? (
                    recentTasks.map(task => (
                      <TaskItem key={task.id}>
                        <TaskInfo>                          <TaskAvatar priority={task.priority}>
                            {task.title ? task.title.charAt(0) : 'T'}
                          </TaskAvatar>
                          <TaskDetails>
                            <TaskTitle>{task.title}</TaskTitle>
                            <TaskMeta>
                              {task.project?.name || 'No Project'} • Due {formatDate(task.dueDate)}
                            </TaskMeta>
                          </TaskDetails>
                        </TaskInfo>                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {task.assigneeName && (
                            <Tooltip title={task.assigneeName}>
                              <Avatar 
                                sx={{ width: 24, height: 24, fontSize: 12 }}
                              >
                                {task.assigneeName.charAt(0)}
                              </Avatar>
                            </Tooltip>
                          )}                          <StatusChip 
                            label={task.status === 'in-progress' ? 'In Progress' : 
                                   (task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Unknown')}
                            status={isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue' : 
                                    (task.status || 'todo')}
                            size="small"
                          />
                        </Box>
                      </TaskItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No recent tasks found.
                    </Typography>
                  )}
                </Box>
                <ViewAllButton 
                  variant="outlined"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  View All Tasks
                </ViewAllButton>
              </StyledPaper>
              
              {/* Productivity */}
              <StyledPaper sx={{ mt: 3 }}>
                <SectionTitle>
                  <SpeedIcon sx={{ color: '#2196f3' }} />
                  Team Productivity
                </SectionTitle>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={stats.productivity}
                        size={140}
                        thickness={5}
                        sx={{
                          color: '#2196f3',
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
                          {stats.productivity}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Efficiency
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Tasks Completed
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {stats.completedTasks} / {stats.totalTasks}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate"
                        value={(stats.completedTasks / (stats.totalTasks || 1)) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#f0f0f0',
                          mb: 3,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            backgroundColor: '#4caf50',
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Tasks In Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {stats.inProgressTasks} / {stats.totalTasks}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate"
                        value={(stats.inProgressTasks / (stats.totalTasks || 1)) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#f0f0f0',
                          mb: 3,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            backgroundColor: '#2196f3',
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Tasks Pending
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {stats.upcomingTasks} / {stats.totalTasks}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate"
                        value={(stats.upcomingTasks / (stats.totalTasks || 1)) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            backgroundColor: '#ff9800',
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </StyledPaper>
            </Grid>
            
            <Grid item xs={12} lg={4}>              {/* Team */}
              <StyledPaper>
                <SectionTitle>
                  <PeopleIcon sx={{ color: '#2196f3' }} />
                  Team Members
                </SectionTitle>
                
                <Box>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <TeamMember key={member.id}>
                        <MemberAvatar sx={{ bgcolor: `hsl(${member.id.length * 60}, 70%, 60%)` }}>
                          {member.name ? member.name.charAt(0) : 'U'}
                        </MemberAvatar>
                        <MemberInfo>
                          <MemberName>{member.name}</MemberName>
                          <MemberRole>{member.role}</MemberRole>
                        </MemberInfo>
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </TeamMember>
                    ))
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 3,
                      color: '#999'
                    }}>
                      <PeopleIcon sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2">
                        No team members found
                      </Typography>
                    </Box>
                  )}
                </Box>
              </StyledPaper>
                {/* Upcoming Events */}
              <StyledPaper sx={{ mt: 3 }}>
                <SectionTitle>
                  <CalendarIcon sx={{ color: '#2196f3' }} />
                  Upcoming Events
                </SectionTitle>
                
                <Box>
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <Box 
                        key={event.id} 
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 500, mb: 1 }}>
                          {event.date} • {event.time}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                          {event.title}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 3,
                      color: '#999'
                    }}>
                      <CalendarIcon sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="body2">
                        No upcoming deadlines
                      </Typography>
                    </Box>
                  )}
                </Box>
              </StyledPaper>
            </Grid>
              {/* Projects */}
            <Grid item xs={12}>
              <Box sx={{ mt: 3 }}>
                <SectionTitle>
                  <TimelineIcon sx={{ color: '#2196f3' }} />
                  Active Projects
                </SectionTitle>
                
                {projects.length > 0 ? (
                  <Grid container spacing={3}>
                    {projects.map((project) => (
                      <Grid item xs={12} md={4} key={project.id}>
                        <ProjectCard>
                          <CardContent>
                            <ProjectHeader>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: project.color
                                  }}
                                >
                                  {project.name ? project.name.charAt(0) : 'P'}
                                </Avatar>
                                <ProjectTitle>{project.name}</ProjectTitle>
                              </Box>
                              <Chip
                                label={`${project.completedTasks}/${project.taskCount} tasks`}
                                size="small"
                                sx={{
                                  backgroundColor: project.color + '20',
                                  color: project.color,
                                  fontWeight: 600,
                                  fontSize: '11px',
                                }}
                              />
                            </ProjectHeader>
                            
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  Progress
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                  {project.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: '#f0f0f0',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: project.color,
                                  }
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {project.description || 'No description'}
                              </Typography>
                              <Button 
                                variant="text" 
                                color="primary" 
                                endIcon={<ArrowForwardIcon />}
                                size="small"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </ProjectCard>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    border: '2px dashed #e0e0e0',
                    borderRadius: '16px',
                    backgroundColor: '#fafafa'
                  }}>
                    <TimelineIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                      No Active Projects
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Create your first project to get started
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
