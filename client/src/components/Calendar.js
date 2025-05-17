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
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import { getAllTasks } from '../services/fakeDatabaseService';

const Calendar = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);

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
    return tasks.filter(task => task.dueDate === date);
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysForMonthView();
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container>
          {dayNames.map((dayName, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center', p: 1, fontWeight: 'bold' }}>
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
            
            const tasksForDay = getTasksForDay(day.day, day.month, day.year);
            
            return (
              <Grid item xs key={index}>
                <Paper
                  sx={{
                    height: 120,
                    p: 1,
                    m: 0.5,
                    bgcolor: isToday ? alpha(theme.palette.primary.light, 0.1) : 'background.paper',
                    color: day.isCurrentMonth ? 'text.primary' : 'text.disabled',
                    border: isToday ? `1px solid ${theme.palette.primary.main}` : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isToday ? 'primary.main' : (day.isCurrentMonth ? 'text.primary' : 'text.disabled')
                    }}
                  >
                    {day.day}
                  </Typography>
                  <Box sx={{ mt: 1, overflow: 'hidden' }}>
                    {tasksForDay.slice(0, 2).map(task => (
                      <Box 
                        key={task.id} 
                        sx={{ 
                          bgcolor: getPriorityColor(task.priority), 
                          p: 0.5, 
                          borderRadius: 1, 
                          mb: 0.5, 
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {task.title}
                      </Box>
                    ))}
                    {tasksForDay.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{tasksForDay.length - 2} more
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const alpha = (color, opacity) => {
    return color + opacity.toString(16).padStart(2, '0');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return alpha(theme.palette.error.main, 40);
      case 'Medium':
        return alpha(theme.palette.warning.main, 40);
      case 'Low':
        return alpha(theme.palette.success.main, 40);
      default:
        return alpha(theme.palette.info.main, 40);
    }
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
        <Typography variant="h4" component="div">
          Calendar
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="view-mode-label">View</InputLabel>
            <Select
              labelId="view-mode-label"
              id="view-mode"
              value={viewMode}
              label="View"
              onChange={(e) => setViewMode(e.target.value)}
            >
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="day">Day</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<TodayIcon />}
            onClick={handleToday}
          >
            Today
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={handlePreviousPeriod}>
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h6">
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </Typography>
          
          <IconButton onClick={handleNextPeriod}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
        
        {viewMode === 'month' && renderMonthView()}
        
        {/* We can implement week and day views later */}
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
