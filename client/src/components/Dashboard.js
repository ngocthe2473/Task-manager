import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getAllTasks } from '../services/fakeDatabaseService';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="h3" color="primary">
              {taskStats.total}
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h3" color="success.main">
              {taskStats.completed}
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6" color="text.primary" gutterBottom>
              In Progress
            </Typography>
            <Typography variant="h3" color="info.main">
              {taskStats.inProgress}
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Overdue
            </Typography>
            <Typography variant="h3" color="error.main">
              {taskStats.overdue}
            </Typography>
          </Item>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Project Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={completionPercentage} color="primary" sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{Math.round(completionPercentage)}%</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {taskStats.completed} of {taskStats.total} tasks completed
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">To Do</Typography>
                <Typography variant="body2">{taskStats.pending}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={(taskStats.pending / taskStats.total) * 100 || 0} color="warning" sx={{ height: 8, borderRadius: 5, mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">In Progress</Typography>
                <Typography variant="body2">{taskStats.inProgress}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={(taskStats.inProgress / taskStats.total) * 100 || 0} color="info" sx={{ height: 8, borderRadius: 5, mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Completed</Typography>
                <Typography variant="body2">{taskStats.completed}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={(taskStats.completed / taskStats.total) * 100 || 0} color="success" sx={{ height: 8, borderRadius: 5 }} />
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
