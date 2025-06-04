import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getAllTasks, getProjects, getUsers, getMyTasks, getDashboardStats, getMyTeams, getMyTeamMembers } from '../services/apiService';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    upcomingTasks: 0,
    overdueTasks: 0,
    productivity: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
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
        // Fetch dashboard stats, user's tasks, and teams
        const dashboardData = await getDashboardStats();
        const userTasks = await getMyTasks(); // This should only return tasks assigned to or created by the user
        const userTeams = await getMyTeams(); // Fetch user's teams directly
        
        // Filter tasks to only include those assigned to or created by the user
        const filteredTasks = userTasks.filter(task => 
          task.assignee?._id === user._id || 
          task.creator?._id === user._id ||
          task.assignee === user._id ||
          task.creator === user._id
        );
        
        // Set stats from filtered tasks
        setStats({
          totalTasks: filteredTasks.length,
          completedTasks: filteredTasks.filter(task => task.status === 'done').length,
          inProgressTasks: filteredTasks.filter(task => task.status === 'in-progress').length,
          upcomingTasks: filteredTasks.filter(task => task.status === 'todo').length,
          overdueTasks: filteredTasks.filter(task => 
            task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
          ).length,
          productivity: Math.round((filteredTasks.filter(task => task.status === 'done').length / filteredTasks.length) * 100) || 0
        });
          // Set recent tasks from filtered tasks
        setRecentTasks(
          [...filteredTasks]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 5)
        );
        
        // Process team stats from fetched teams data
        console.log('Raw userTeams from API:', userTeams); // Debug log
        
        // Transform team data to match expected format
        const processedTeamStats = userTeams.map(team => {
          // Get tasks for this team
          const teamTasks = filteredTasks.filter(task => 
            team.members.some(member => 
              member.user && (
                (typeof member.user === 'object' && member.user._id === (task.assignee?._id || task.assignee)) ||
                (typeof member.user === 'string' && member.user === (task.assignee?._id || task.assignee))
              )
            )
          );
          
          const completedTeamTasks = teamTasks.filter(task => task.status === 'done').length;
          const productivity = teamTasks.length > 0 ? Math.round((completedTeamTasks / teamTasks.length) * 100) : 0;
          
          return {
            teamId: team._id,
            teamName: team.name,
            members: team.members.map(member => ({
              id: typeof member.user === 'object' ? member.user._id : member.user,
              name: typeof member.user === 'object' ? member.user.name : 'Unknown User',
              role: member.team_role || 'member',
              email: typeof member.user === 'object' ? member.user.email : ''
            })),
            totalTasks: teamTasks.length,
            completedTasks: completedTeamTasks,
            productivity: productivity
          };
        });
          console.log('Processed team stats:', processedTeamStats); // Debug log
        setTeamStats(processedTeamStats);
        
        // Fetch team members using dedicated API
        const teamMembers = await getMyTeamMembers();
        console.log('Team members from API:', teamMembers); // Debug log
        setTeamMembers(teamMembers);
        
        // Fetch and filter projects
        const allProjects = await getProjects();
        const userProjectIds = filteredTasks.map(task => task.project?._id).filter(Boolean);
        const userProjects = allProjects.filter(project => 
          userProjectIds.includes(project._id)
        );
        
        // Process projects data
        const processedProjects = userProjects.map(project => {
          const projectTasks = filteredTasks.filter(task => 
            task.project && task.project._id === project._id
          );
          const completedProjectTasks = projectTasks.filter(task => task.status === 'done').length;
          const progress = projectTasks.length > 0 ? 
            Math.round((completedProjectTasks / projectTasks.length) * 100) : 0;
          
          return {
            ...project,
            id: project._id,
            taskCount: projectTasks.length,
            completedTasks: completedProjectTasks,
            progress: progress,
            color: getProjectColor(project._id)
          };
        });
        
        setProjects(processedProjects);
        
        // Create upcoming events from user's tasks
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingTaskEvents = filteredTasks
          .filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate <= nextWeek && task.status !== 'done';
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 3)
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

  // Navigation handler for View All Tasks
  const handleViewAllTasks = () => {
    // Navigate to Tasks page using React Router
    navigate('/tasks');
  };

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
                  onClick={handleViewAllTasks}
                >
                  View All Tasks
                </ViewAllButton>
              </StyledPaper>
                {/* Team Productivity - Multiple Teams */}
              <StyledPaper sx={{ mt: 3 }}>
                <SectionTitle>
                  <SpeedIcon sx={{ color: '#2196f3' }} />
                  Team Productivity
                </SectionTitle>
                
                {teamStats.length > 0 ? (
                  <Grid container spacing={3}>
                    {teamStats.map((team, index) => (
                      <Grid item xs={12} key={team.teamId}>
                        <Box sx={{ 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '12px',
                          mb: index < teamStats.length - 1 ? 2 : 0
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                            {team.teamName}
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={team.productivity}
                                  size={120}
                                  thickness={5}
                                  sx={{
                                    color: index === 0 ? '#2196f3' : index === 1 ? '#4caf50' : '#ff9800',
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
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                                    {team.productivity}%
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
                                    {team.completedTasks} / {team.totalTasks}
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate"
                                  value={(team.completedTasks / (team.totalTasks || 1)) * 100}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#f0f0f0',
                                    mb: 2,
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 4,
                                      backgroundColor: index === 0 ? '#2196f3' : index === 1 ? '#4caf50' : '#ff9800',
                                    }
                                  }}
                                />
                                
                                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                  Team Members: {team.members.length}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {team.members.slice(0, 3).map((member) => (
                                    <Tooltip key={member.id} title={member.name}>
                                      <Avatar 
                                        sx={{ 
                                          width: 28, 
                                          height: 28, 
                                          fontSize: 12,
                                          bgcolor: `hsl(${member.id.length * 60}, 70%, 60%)`
                                        }}
                                      >
                                        {member.name ? member.name.charAt(0) : 'U'}
                                      </Avatar>
                                    </Tooltip>
                                  ))}
                                  {team.members.length > 3 && (
                                    <Avatar sx={{ width: 28, height: 28, fontSize: 10, bgcolor: '#999' }}>
                                      +{team.members.length - 3}
                                    </Avatar>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: '#999'
                  }}>
                    <SpeedIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No Team Data Available
                    </Typography>
                    <Typography variant="body2">
                      You are not a member of any team yet.
                    </Typography>
                  </Box>
                )}
              </StyledPaper>
            </Grid>
            
            <Grid item xs={12} lg={4}>              {/* Team Members by Teams */}
              <StyledPaper>
                <SectionTitle>
                  <PeopleIcon sx={{ color: '#2196f3' }} />
                  Team Members
                </SectionTitle>
                  <Box>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <TeamMember key={member._id}>
                        <MemberAvatar sx={{ bgcolor: `hsl(${member._id.length * 60}, 70%, 60%)` }}>
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
