import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Badge,
  AvatarGroup,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { getTeams, getUsers, getAllTasks } from '../services/apiService';

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

// Styled Components
const GlassPaper = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  border: 0,
  borderRadius: '25px',
  color: 'white',
  padding: '8px 24px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    animation: `${glow} 1.5s ease-in-out infinite`,
    transform: 'translateY(-2px)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const TeamManagement = () => {
  const theme = useTheme();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teamsData = await getTeams();
        const usersData = await getUsers();
        const tasksData = await getAllTasks();
        
        // Extract team members from teams and combine with user data
        const allTeamMembers = [];
        if (teamsData && Array.isArray(teamsData)) {
          teamsData.forEach(team => {
            if (team.members && Array.isArray(team.members)) {
              team.members.forEach(memberId => {
                const user = usersData.find(u => u._id === memberId);
                if (user) {
                  // Calculate tasks completed for this user
                  const userTasks = tasksData.filter(task => task.assignedTo === user._id);
                  const completedTasks = userTasks.filter(task => task.status === 'done').length;
                  
                  allTeamMembers.push({
                    id: user._id,
                    name: user.name,
                    role: user.role || 'Team Member',
                    avatar: user.name ? user.name.charAt(0).toUpperCase() : 'U',
                    status: 'online', // Default status, would need real-time data
                    tasksCompleted: completedTasks,
                    efficiency: userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0,
                    skills: user.skills || [],
                    joinDate: user.createdAt || new Date().toISOString(),
                  });
                }
              });
            }
          });
        }
        
        setTeamMembers(allTeamMembers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 4,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
      minHeight: '100vh',
    }}>
      {/* Epic Team Management Content */}
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
        Team Management
      </Typography>

      <Grid container spacing={4}>
        {teamMembers.map(member => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <GlassPaper sx={{ p: 3, position: 'relative' }}>
              {/* Status Badge */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                badgeContent={
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: member.status === 'online' ? '#44b700' : member.status === 'offline' ? '#f44336' : '#ff9800',
                      border: '2px solid white',
                    }}
                  />
                }
              >
                <Avatar sx={{ width: 56, height: 56, fontSize: '1.5rem', bgcolor: theme.palette.primary.main }}>
                  {member.avatar}
                </Avatar>
              </Badge>

              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500, textAlign: 'center' }}>
                {member.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                {member.role}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tasks Completed
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {member.tasksCompleted}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {member.efficiency}%
                  </Typography>
                </Box>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={member.efficiency} 
                sx={{ height: 8, borderRadius: 4, background: alpha(theme.palette.grey[300], 0.3), '& .MuiLinearProgress-bar': { background: theme.palette.success.main } }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Skills:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {member.skills.map((skill, index) => (
                  <Chip key={index} label={skill} size="small" sx={{ bgcolor: theme.palette.primary.main, color: 'white' }} />
                ))}
              </Box>

              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  width: '100%', 
                  borderRadius: '20px',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
                startIcon={<PersonAddIcon />}
              >
                Add to Team
              </Button>
            </GlassPaper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TeamManagement;