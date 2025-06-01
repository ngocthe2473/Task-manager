import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, LinearProgress, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  Divider, Chip, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp, TrendingDown, Schedule, Assignment,
  CheckCircle, Warning, Person, Today
} from '@mui/icons-material';
import { getAllTasks } from '../services/fakeDatabaseService';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('week'); // day, week, month
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  
  const [advancedStats, setAdvancedStats] = useState({
    completionRate: 0,
    averageCompletionTime: 0,
    tasksByPriority: { high: 0, medium: 0, low: 0 },
    recentActivity: [],
    productivityTrend: 'up', // up, down, stable
    upcomingDeadlines: [],
    teamPerformance: [],
    weeklyProgress: []
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const tasks = await getAllTasks();
        
        // Filter tasks based on timeframe
        const now = new Date();
        const filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt || task.updatedAt || now);
          const daysDiff = (now - taskDate) / (1000 * 60 * 60 * 24);
          
          switch (timeFrame) {
            case 'day':
              return daysDiff <= 1;
            case 'week':
              return daysDiff <= 7;
            case 'month':
              return daysDiff <= 30;
            default:
              return true;
          }
        });
        
        // Calculate basic statistics
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(task => task.status === 'done').length;
        const inProgress = filteredTasks.filter(task => task.status === 'inprogress').length;
        const review = filteredTasks.filter(task => task.status === 'review').length;
        const pending = filteredTasks.filter(task => task.status === 'todo').length;
        
        // Calculate overdue tasks
        const overdue = filteredTasks.filter(task => {
          if (task.status !== 'done' && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            return dueDate < now;
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

        // Calculate advanced statistics
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        
        // Priority distribution
        const tasksByPriority = {
          high: filteredTasks.filter(task => task.priority === 'high').length,
          medium: filteredTasks.filter(task => task.priority === 'medium').length,
          low: filteredTasks.filter(task => task.priority === 'low').length
        };

        // Upcoming deadlines (next 7 days)
        const upcomingDeadlines = tasks
          .filter(task => {
            if (task.status === 'done' || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);
            return daysDiff >= 0 && daysDiff <= 7;
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        // Recent activity (last completed tasks)
        const recentActivity = tasks
          .filter(task => task.status === 'done')
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 5);

        // Productivity trend calculation
        const previousPeriodTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt || task.updatedAt || now);
          const daysDiff = (now - taskDate) / (1000 * 60 * 60 * 24);
          
          switch (timeFrame) {
            case 'day':
              return daysDiff > 1 && daysDiff <= 2;
            case 'week':
              return daysDiff > 7 && daysDiff <= 14;
            case 'month':
              return daysDiff > 30 && daysDiff <= 60;
            default:
              return false;
          }
        });

        const previousCompleted = previousPeriodTasks.filter(task => task.status === 'done').length;
        const currentCompleted = completed;
        
        let productivityTrend = 'stable';
        if (currentCompleted > previousCompleted) productivityTrend = 'up';
        else if (currentCompleted < previousCompleted) productivityTrend = 'down';

        setAdvancedStats({
          completionRate,
          averageCompletionTime: 0, // Would need more detailed tracking
          tasksByPriority,
          recentActivity,
          productivityTrend,
          upcomingDeadlines,
          teamPerformance: [], // Would need team data
          weeklyProgress: [] // Would need historical data
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="div">
          Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Frame</InputLabel>
          <Select
            value={timeFrame}
            label="Time Frame"
            onChange={(e) => setTimeFrame(e.target.value)}
          >
            <MenuItem value="day">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Main Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Assignment sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="text.primary">
                Total Tasks
              </Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {taskStats.total}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {advancedStats.productivityTrend === 'up' ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              ) : advancedStats.productivityTrend === 'down' ? (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
              ) : null}
              <Typography variant="caption" color="text.secondary">
                {timeFrame === 'day' ? 'Today' : timeFrame === 'week' ? 'This week' : 'This month'}
              </Typography>
            </Box>
          </Item>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6" color="text.primary">
                Completed
              </Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {taskStats.completed}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {advancedStats.completionRate.toFixed(1)}% completion rate
            </Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6" color="text.primary">
                In Progress
              </Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {taskStats.inProgress}
            </Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6" color="text.primary">
                Overdue
              </Typography>
            </Box>
            <Typography variant="h3" color="error.main">
              {taskStats.overdue}
            </Typography>
            {taskStats.overdue > 0 && (
              <Chip 
                label="Needs Attention" 
                color="error" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Item>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Project Progress */}
        <Grid item xs={12} md={8}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Project Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={advancedStats.completionRate} 
                  color="primary" 
                  sx={{ height: 10, borderRadius: 5 }} 
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(advancedStats.completionRate)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {taskStats.completed} of {taskStats.total} tasks completed
            </Typography>
            
            {/* Task Distribution */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Task Distribution
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, minWidth: 150 }}>
                  <Typography variant="body2">To Do</Typography>
                  <Typography variant="body2">{taskStats.pending}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(taskStats.pending / taskStats.total) * 100 || 0} 
                  color="warning" 
                  sx={{ height: 8, borderRadius: 5, mb: 2, minWidth: 120 }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, minWidth: 150 }}>
                  <Typography variant="body2">In Progress</Typography>
                  <Typography variant="body2">{taskStats.inProgress}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(taskStats.inProgress / taskStats.total) * 100 || 0} 
                  color="info" 
                  sx={{ height: 8, borderRadius: 5, mb: 2, minWidth: 120 }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, minWidth: 150 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="body2">{taskStats.completed}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(taskStats.completed / taskStats.total) * 100 || 0} 
                  color="success" 
                  sx={{ height: 8, borderRadius: 5, minWidth: 120 }} 
                />
              </Box>
            </Box>
          </Item>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Priority Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip label="High" color="error" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">High Priority</Typography>
                </Box>
                <Typography variant="h6">{advancedStats.tasksByPriority.high}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip label="Med" color="warning" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Medium Priority</Typography>
                </Box>
                <Typography variant="h6">{advancedStats.tasksByPriority.medium}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip label="Low" color="info" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Low Priority</Typography>
                </Box>
                <Typography variant="h6">{advancedStats.tasksByPriority.low}</Typography>
              </Box>
            </Box>
          </Item>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Upcoming Deadlines
            </Typography>
            {advancedStats.upcomingDeadlines.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No upcoming deadlines
              </Typography>
            ) : (
              <List dense>
                {advancedStats.upcomingDeadlines.map((task, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Today fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={task.priority} 
                      size="small" 
                      color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'info'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Item>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {advancedStats.recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No recent activity
              </Typography>
            ) : (
              <List dense>
                {advancedStats.recentActivity.map((task, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <CheckCircle fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={`Completed ${new Date(task.updatedAt || task.createdAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
