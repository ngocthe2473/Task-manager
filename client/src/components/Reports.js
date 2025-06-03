import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { getAllTasks, getProjects, getUsers, getActivityLogs } from '../services/apiService';

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

const Reports = () => {
  const theme = useTheme();
  const [reportData, setReportData] = useState({
    productivity: {
      tasksCompleted: 0,
      averageTime: 0,
      efficiency: 0,
      trend: 0,
    },
    team: {
      totalMembers: 0,
      activeMembers: 0,
      topPerformers: []
    },
    projects: {
      total: 0,
      completed: 0,
      inProgress: 0,
      delayed: 0,
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [tasksData, projectsData, usersData] = await Promise.all([
          getAllTasks(),
          getProjects(),
          getUsers()
        ]);
        
        // Calculate productivity metrics
        const completedTasks = tasksData.filter(task => task.status === 'done');
        const efficiency = tasksData.length > 0 ? Math.round((completedTasks.length / tasksData.length) * 100) : 0;
        
        // Calculate project stats
        const completedProjects = projectsData.filter(project => project.status === 'completed');
        const inProgressProjects = projectsData.filter(project => project.status === 'in-progress');
        const delayedProjects = projectsData.filter(project => 
          project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed'
        );
        
        // Calculate top performers
        const userTaskCounts = usersData.map(user => {
          const userTasks = tasksData.filter(task => task.assignedTo === user._id && task.status === 'done');
          return {
            name: user.name,
            tasks: userTasks.length,
            avatar: user.name ? user.name.charAt(0).toUpperCase() : 'U'
          };
        }).sort((a, b) => b.tasks - a.tasks).slice(0, 3);
        
        setReportData({
          productivity: {
            tasksCompleted: completedTasks.length,
            averageTime: 0, // Would need time tracking data
            efficiency,
            trend: 0, // Would need historical data
          },
          team: {
            totalMembers: usersData.length,
            activeMembers: usersData.filter(user => user.isActive !== false).length,
            topPerformers: userTaskCounts
          },
          projects: {
            total: projectsData.length,
            completed: completedProjects.length,
            inProgress: inProgressProjects.length,
            delayed: delayedProjects.length,
          }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 4,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
      minHeight: '100vh',
    }}>
      {/* Epic Reports Content */}
      {/* ...report components... */}
    </Box>
  );
};

export default Reports;