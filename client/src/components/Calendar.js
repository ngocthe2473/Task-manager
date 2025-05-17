import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  Popover
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CircleIcon from '@mui/icons-material/Circle';
import { getAllTasks } from '../services/fakeDatabaseService';

const Calendar = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskData = await getAllTasks();
        setTasks(taskData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Get days for the current month view
  const getDaysForMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        day: daysInPrevMonth - firstDayOfMonth + i + 1,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get tasks for a specific day
  const getTasksForDay = (day, month, year) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => {
      const taskDate = task.dueDate || task.due;
      return taskDate === date;
    });
  };

  const handleTaskHover = (event, task) => {
    setHoveredTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setHoveredTask(null);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl) && Boolean(hoveredTask);

  // Render month view with similar layout to the image provided
  const renderMonthView = () => {
    const days = getDaysForMonthView();
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container sx={{ mb: 1 }}>
          {dayNames.map((dayName, index) => (
            <Grid item xs key={index} sx={{ 
              textAlign: 'center', 
              p: 1, 
              fontWeight: 'bold',
              color: index === 0 ? 'error.main' : 'text.primary' // Sunday in red
            }}>
              {dayName}
            </Grid>
          ))}
        </Grid>
        <Grid container>
          {days.map((day, index) => {
            const isToday = 
              day.day === today.getDate() && 
              day.month === today.getMonth() && 
              day.year === today.getFullYear();
            
            const isSunday = index % 7 === 0;
            const tasksForDay = getTasksForDay(day.day, day.month, day.year);
            
            return (
              <Grid item xs key={index}>
                <Box
                  sx={{
                    height: 100,
                    p: 1,
                    m: 0.5,
                    borderRadius: '4px',
                    border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid #eaeaea',
                    bgcolor: isToday ? alpha(theme.palette.primary.light, 0.1) : 'background.paper',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Typography 
                    align="center"
                    variant="body1" 
                    sx={{ 
                      fontWeight: isToday ? 'bold' : 'normal',
                      fontSize: '1.1rem',
                      color: !day.isCurrentMonth 
                        ? theme.palette.text.disabled 
                        : isSunday 
                          ? theme.palette.error.main 
                          : isToday 
                            ? theme.palette.primary.main 
                            : theme.palette.text.primary
                    }}
                  >
                    {day.day}
                  </Typography>
                  
                  {/* Task indicators */}
                  {tasksForDay.length > 0 && (
                    <Box sx={{ 
                      mt: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}>
                      {tasksForDay.slice(0, 3).map((task, i) => (
                        <Box 
                          key={i}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.04)'
                            }
                          }}
                          onMouseEnter={(e) => handleTaskHover(e, task)}
                          onMouseLeave={handlePopoverClose}
                        >
                          <CircleIcon sx={{ 
                            fontSize: '0.6rem', 
                            color: getPriorityColor(task.priority) 
                          }} />
                          <Typography 
                            variant="caption" 
                            noWrap
                            sx={{ 
                              fontSize: '0.7rem',
                              color: alpha(theme.palette.text.primary, 0.8)
                            }}
                          >
                            {task.title}
                          </Typography>
                        </Box>
                      ))}
                      {tasksForDay.length > 3 && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.7rem',
                            color: theme.palette.text.secondary,
                            ml: 2
                          }}
                        >
                          +{tasksForDay.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Task Popover with Details */}
        <Popover
          id="task-popover"
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          disableRestoreFocus
        >
          {hoveredTask && (
            <Card sx={{ maxWidth: 280, minWidth: 250 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
                  {hoveredTask.title}
                </Typography>
                
                {hoveredTask.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {hoveredTask.description.length > 80 
                      ? hoveredTask.description.substring(0, 80) + '...' 
                      : hoveredTask.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Due: {hoveredTask.dueDate || hoveredTask.due}
                  </Typography>
                  <Chip 
                    label={hoveredTask.priority} 
                    size="small" 
                    sx={{ 
                      bgcolor: priorityColors[hoveredTask.priority], 
                      color: 'white',
                      height: 20,
                      fontSize: '0.6rem'
                    }}
                  />
                </Box>
                
                {hoveredTask.assigneeName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#1976d2' }}
                    >
                      {hoveredTask.assigneeName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="caption">
                      {hoveredTask.assigneeName}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Popover>
      </Box>
    );
  };

  const alpha = (color, opacity) => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return theme.palette.error.main;
      case 'Medium':
        return theme.palette.warning.main;
      case 'Low':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  const priorityColors = {
    High: theme.palette.error.main,
    Medium: theme.palette.warning.main,
    Low: theme.palette.success.main
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {getMonthName(currentDate.getMonth())}
          <Typography 
            component="span" 
            variant="h4" 
            sx={{ 
              ml: 2,
              color: theme.palette.text.secondary,
              fontWeight: 'normal'
            }}
          >
            {currentDate.getFullYear()}
          </Typography>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<TodayIcon />}
            onClick={handleToday}
          >
            Today
          </Button>
          <IconButton onClick={handlePreviousPeriod}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={handleNextPeriod}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
        }}
      >
        {viewMode === 'month' && renderMonthView()}
        
        {/* Week and day views placeholder */}
        {viewMode === 'week' && (
          <Typography sx={{ p: 4, textAlign: 'center' }}>
            Week view will be implemented soon
          </Typography>
        )}
        
        {viewMode === 'day' && (
          <Typography sx={{ p: 4, textAlign: 'center' }}>
            Day view will be implemented soon
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Calendar;
