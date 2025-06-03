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
      tasksCompleted: 156,
      averageTime: 2.4,
      efficiency: 87,
      trend: 12,
    },
    team: {
      totalMembers: 8,
      activeMembers: 6,
      topPerformers: [
        { name: 'Trần Ngọc Thế', tasks: 42, avatar: 'T' },
        { name: 'Nguyễn Tấn Long', tasks: 38, avatar: 'L' },
        { name: 'Trần Đại Việt', tasks: 35, avatar: 'V' },
      ]
    },
    projects: {
      total: 12,
      completed: 8,
      inProgress: 3,
      delayed: 1,
    }
  });

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