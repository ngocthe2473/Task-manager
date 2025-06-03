import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  Popover,
  Divider,
  Stack,
  Badge,
  Fade,
  Zoom,
  alpha,
  LinearProgress,
  ButtonGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  PersonOutline as PersonOutlineIcon,
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { getCalendarTasks } from '../services/apiService';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  isSameMonth, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from 'date-fns';
import { vi } from 'date-fns/locale';

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
const GlassPaper = styled(Paper)(({ theme }) => ({
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

const TaskCard = styled(Box)(({ theme, priority }) => {
  const getGradient = (priority) => {
    switch (priority) {
      case 'High':
        return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
      case 'Medium':
        return 'linear-gradient(135deg, #ffa726, #ff9800)';
      case 'Low':
        return 'linear-gradient(135deg, #42a5f5, #1976d2)';
      default:
        return 'linear-gradient(135deg, #78909c, #546e7a)';
    }
  };

  return {
    background: getGradient(priority),
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'white',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.5s ease',
    },
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      '&::before': {
        left: '100%',
      },
    },
  };
});

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

const Calendar = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  // Đã loại bỏ loading, thay đổi code fetchTasks để không dùng setLoading
  const [hoveredTask, setHoveredTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });

  // Tạo khung giờ từ 8:00 đến 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour < 10 ? '0' + hour : hour}:00`;
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskData = await getCalendarTasks();
        // Thêm thông tin thời gian ngẫu nhiên cho các task
        const enhancedTasks = taskData.map(task => {
          const dueDate = task.dueDate || task.due;
          // Tạo giờ ngẫu nhiên
          const randomStartHour = 9 + Math.floor(Math.random() * 10);
          const randomEndHour = randomStartHour + 1 + Math.floor(Math.random() * 2);
          return {
            ...task,
            startTime: `${randomStartHour}:00`,
            endTime: `${randomEndHour}:${randomStartHour % 2 === 0 ? '00' : '30'}`,
            color: getTaskColor(task.priority, task.status),
            dueDate: dueDate
          };
        });
        setTasks(enhancedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  // Calculate stats when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const today = new Date();
      const stats = {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'done').length,
        inProgress: tasks.filter(task => task.status === 'inprogress').length,
        overdue: tasks.filter(task => {
          const dueDate = new Date(task.dueDate || task.due);
          return dueDate < today && task.status !== 'done';
        }).length,
      };
      setTaskStats(stats);
    }
  }, [tasks]);

  const getTaskColor = (priority, status) => {
    if (status === 'done') return '#00c875';
    
    const colorMap = {
      'High': '#ff7066',
      'Medium': '#fdab3d',
      'Low': '#579bfc'
    };
    
    return colorMap[priority] || '#e0e0e0';
  };

  const handleViewChange = (event, newValue) => {
    if (newValue !== null) {
      setViewMode(newValue);
      setSelectedTask(null); // Reset selected task when changing views
    }
  };

  const handlePreviousPeriod = () => {
    setCurrentDate(prevDate => {
      if (viewMode === 'day') {
        return subDays(prevDate, 1);
      } else if (viewMode === 'week') {
        return subDays(prevDate, 7);
      } else {
        return subMonths(prevDate, 1);
      }
    });
  };

  const handleNextPeriod = () => {
    setCurrentDate(prevDate => {
      if (viewMode === 'day') {
        return addDays(prevDate, 1);
      } else if (viewMode === 'week') {
        return addDays(prevDate, 7);
      } else {
        return addMonths(prevDate, 1);
      }
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskHover = (event, task) => {
    setHoveredTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setHoveredTask(null);
    setAnchorEl(null);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setHoveredTask(null); // Close popover if open
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl) && Boolean(hoveredTask);

  // Lấy các ngày trong tuần (Thứ 2 - Chủ nhật)
  const getWeekDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Bắt đầu từ Thứ 2
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Lấy task cho một ngày cụ thể
  const getTasksForDay = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => {
      const taskDate = task.dueDate || task.due;
      return taskDate === formattedDate;
    });
  };

  // Chuyển đổi thời gian thành vị trí trong calendar
  const formatTimeToPosition = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    // Tính vị trí dựa trên 8:00 là điểm bắt đầu (0%) và 21:00 là điểm kết thúc (100%)
    return ((hours - 8) + minutes / 60) * (100 / 13);
  };

  // Tính thời lượng của sự kiện
  const formatEventDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    return (endHour - startHour) + (endMinute - startMinute) / 60;
  };

  // Render Day View - với panel chi tiết bên phải
  const renderDayView = () => {
    const tasksForToday = getTasksForDay(currentDate);
    const dayName = format(currentDate, 'EEEE', { locale: vi });
    const dayNumber = format(currentDate, 'd');
    const monthName = format(currentDate, 'MMMM', { locale: vi });
    
    return (
      <Box sx={{ mt: 2, display: 'flex' }}>
        {/* Lịch ngày bên trái */}
        <Box sx={{ width: selectedTask ? 'calc(100% - 350px)' : '100%', transition: 'width 0.3s ease' }}>
          <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
            {dayName}, {dayNumber} {monthName}
          </Typography>
          
          <Grid container>
            {/* Cột thời gian */}
            <Grid item sx={{ width: '60px', flexShrink: 0 }}>
              <Box sx={{ pr: 1, pt: 1 }}>
                {timeSlots.map((time, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      height: 60,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      borderTop: '1px solid #e0e0e0',
                      position: 'relative',
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: 5,
                        color: theme.palette.text.secondary 
                      }}
                    >
                      {time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Cột task */}
            <Grid item sx={{ flexGrow: 1 }}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  height: timeSlots.length * 60,
                  borderLeft: '1px solid #e0e0e0'
                }}
              >
                {/* Các đường kẻ ngang */}
                {timeSlots.map((_, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      position: 'absolute',
                      top: index * 60,
                      left: 0,
                      right: 0,
                      height: 60,
                      borderTop: '1px solid #e0e0e0'
                    }}
                  />
                ))}
                
                {/* Các task */}
                {tasksForToday.map((task, taskIndex) => {
                  const startPos = formatTimeToPosition(task.startTime);
                  const duration = formatEventDuration(task.startTime, task.endTime);
                  const height = duration * (60 / 1); // 60px cho mỗi giờ
                  
                  return (
                    <Box
                      key={taskIndex}
                      sx={{
                        position: 'absolute',
                        top: `${startPos * 4.6}px`,
                        left: '8px',
                        right: '8px',
                        height: `${height}px`,
                        backgroundColor: task.color,
                        borderRadius: '4px',
                        padding: '8px 12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        zIndex: 10,
                        border: selectedTask?.id === task.id ? '2px solid #333' : 'none',
                        boxShadow: selectedTask?.id === task.id ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none',
                        '&:hover': {
                          filter: 'brightness(0.95)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 20
                        }
                      }}
                      onClick={() => handleTaskClick(task)}
                      onMouseEnter={(e) => handleTaskHover(e, task)}
                      onMouseLeave={handlePopoverClose}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: '#ffffff'
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'rgba(255, 255, 255, 0.85)'
                        }}
                      >
                        {task.startTime} - {task.endTime}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Panel chi tiết bên phải khi chọn task */}
        {selectedTask && (
          <Box 
            sx={{ 
              width: '350px', 
              borderLeft: '1px solid #e0e0e0', 
              pl: 2,
              ml: 2,
              position: 'relative'
            }}
          >
            <IconButton 
              size="small" 
              sx={{ position: 'absolute', top: 0, right: 0 }}
              onClick={() => setSelectedTask(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', pr: 4 }}>
              {selectedTask.title}
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {selectedTask.startTime} - {selectedTask.endTime}
                </Typography>
              </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {selectedTask.dueDate instanceof Date 
                    ? format(selectedTask.dueDate, 'MMM dd, yyyy') 
                    : typeof selectedTask.dueDate === 'string' 
                      ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')
                      : 'No due date'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlineIcon fontSize="small" color="action" />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedTask.assigneeName ? (
                    <>
                      <Avatar 
                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                      >
                        {selectedTask.assigneeName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {selectedTask.assigneeName}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Không có người được giao
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box>
                <Chip 
                  label={selectedTask.priority} 
                  sx={{ 
                    backgroundColor: selectedTask.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Divider />
              
              {selectedTask.description ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Mô tả
                  </Typography>
                  <Typography variant="body2">
                    {selectedTask.description}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có mô tả
                </Typography>
              )}
              
              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Bình luận ({selectedTask.comments.length})
                  </Typography>
                  {selectedTask.comments.map((comment, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {comment.userName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="caption" fontWeight="bold">
                          {comment.userName}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {comment.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Box>
    );
  };

  // Render Week View - với chiều rộng đầy đủ
  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const today = new Date();
    
    return (
      <Box sx={{ 
        mt: 2, 
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <Box sx={{ display: 'flex', width: '100%' }}>
          {/* Cột thời gian */}
          <Box sx={{ width: '60px', flexShrink: 0 }}>
            <Box sx={{ height: '60px' }} /> {/* Phần header trống */}
            
            {timeSlots.map((time, index) => (
              <Box 
                key={index} 
                sx={{ 
                  height: 60,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid #e0e0e0',
                  position: 'relative',
                  pr: 1
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    right: 5,
                    color: theme.palette.text.secondary 
                  }}
                >
                  {time}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Phần ngày trong tuần */}
          <Box sx={{ display: 'flex', flex: 1 }}>
            {weekDates.map((date, dateIndex) => {
              const isToday = isSameDay(date, today);
              const dayWidth = `${100/7}%`;
              
              return (
                <Box 
                  key={dateIndex} 
                  sx={{ 
                    width: dayWidth,
                    flexShrink: 0,
                    borderLeft: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Header ngày */}
                  <Box 
                    sx={{ 
                      p: 1, 
                      textAlign: 'center',
                      borderBottom: '1px solid #e0e0e0',
                      bgcolor: isToday ? 'rgba(0, 115, 234, 0.08)' : 'transparent',
                      height: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: isToday ? 'bold' : 'normal',
                        textTransform: 'capitalize'
                      }}
                    >
                      {format(date, 'EEE', { locale: vi })}
                    </Typography>
                    <Typography 
                      variant="h6"
                      sx={{
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? theme.palette.primary.main : 'inherit'
                      }}
                    >
                      {format(date, 'd')}
                    </Typography>
                  </Box>
                  
                  {/* Khung thời gian và tasks */}
                  <Box sx={{ position: 'relative', height: timeSlots.length * 60, flex: 1 }}>
                    {/* Đường kẻ ngang */}
                    {timeSlots.map((_, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'absolute',
                          top: index * 60,
                          left: 0,
                          right: 0,
                          height: 60,
                          borderTop: '1px solid #e0e0e0'
                        }}
                      />
                    ))}
                    
                    {/* Tasks */}
                    {getTasksForDay(date).map((task, taskIndex) => {
                      const startPos = formatTimeToPosition(task.startTime);
                      const duration = formatEventDuration(task.startTime, task.endTime);
                      const height = duration * (60 / 1); // 60px cho mỗi giờ
                      
                      return (
                        <Box
                          key={taskIndex}
                          sx={{
                            position: 'absolute',
                            top: `${startPos * 4.6}px`,
                            left: '4px',
                            right: '4px',
                            height: `${height}px`,
                            backgroundColor: task.color,
                            borderRadius: '4px',
                            padding: '4px 8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            zIndex: 10,
                            '&:hover': {
                              filter: 'brightness(0.95)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              zIndex: 20
                            }
                          }}
                          onClick={() => handleTaskClick(task)}
                          onMouseEnter={(e) => handleTaskHover(e, task)}  // Đảm bảo hover hiển thị chi tiết
                          onMouseLeave={handlePopoverClose}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: '#ffffff'
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontSize: '0.7rem',
                              color: 'rgba(255, 255, 255, 0.85)'
                            }}
                          >
                            {task.startTime} - {task.endTime}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };



  // Chi tiết task khi hover
  const renderTaskPopover = () => {
    return (
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
        sx={{ pointerEvents: 'none' }}
      >
        {hoveredTask && (
          <Card sx={{ maxWidth: 320, minWidth: 280 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1, fontWeight: 'bold' }}>
                {hoveredTask.title}
              </Typography>
              
              {hoveredTask.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {hoveredTask.description.length > 100 
                    ? hoveredTask.description.substring(0, 100) + '...' 
                    : hoveredTask.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                    <strong>Due:</strong> {hoveredTask.dueDate instanceof Date 
                      ? format(hoveredTask.dueDate, 'MMM dd, yyyy') 
                      : typeof hoveredTask.dueDate === 'string' 
                        ? format(new Date(hoveredTask.dueDate), 'MMM dd, yyyy')
                        : 'No due date'}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    <strong>Time:</strong> {hoveredTask.startTime} - {hoveredTask.endTime}
                  </Typography>
                </Box>
                <Chip 
                  label={hoveredTask.priority} 
                  size="small" 
                  sx={{ 
                    backgroundColor: hoveredTask.color, 
                    color: 'white',
                    height: 24,
                    alignSelf: 'flex-start'
                  }}
                />
              </Box>
              
              {hoveredTask.assigneeName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#1976d2' }}
                  >
                    {hoveredTask.assigneeName.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    {hoveredTask.assigneeName}
                  </Typography>
                </Box>
              )}
              
              {hoveredTask.status && (
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={hoveredTask.status} 
                    size="small" 
                    sx={{ 
                      textTransform: 'capitalize',
                      bgcolor: hoveredTask.status === 'done' ? '#00c875' : '#f5f5f5'
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Popover>
    );
  };

  // Định dạng tiêu đề dựa trên chế độ xem hiện tại
  const getDateTitle = () => {
    if (viewMode === 'day') {
      return format(currentDate, 'MMMM yyyy', { locale: vi });
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      if (format(weekStart, 'MMM', { locale: vi }) === format(weekEnd, 'MMM', { locale: vi })) {
        return `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} ${format(weekEnd, 'MMMM yyyy', { locale: vi })}`;
      } else {
        return `${format(weekStart, 'd MMM', { locale: vi })} - ${format(weekEnd, 'd MMM yyyy', { locale: vi })}`;
      }
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: vi });
    }
  };

  const renderEnhancedHeader = () => (
    <GlassPaper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 1,
            }}
          >
            Calendar Pro
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 300 }}>
            {getDateTitle()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ButtonGroup variant="contained" sx={{ borderRadius: '25px' }}>
            <IconButton onClick={handlePreviousPeriod}>
              <ArrowBackIcon />
            </IconButton>
            <NeonButton onClick={handleToday} sx={{ mx: 1 }}>
              Today
            </NeonButton>
            <IconButton onClick={handleNextPeriod}>
              <ArrowForwardIcon />
            </IconButton>
          </ButtonGroup>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: '20px',
                border: 'none',
                margin: '0 4px',
                background: alpha(theme.palette.primary.main, 0.1),
                '&.Mui-selected': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                },
              },
            }}
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {taskStats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={3}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {taskStats.completed}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={3}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <GroupIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {taskStats.inProgress}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={3}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <NotificationsIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {taskStats.overdue}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Overdue</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>
    </GlassPaper>
  );
  const renderEnhancedTaskCard = (task, height = 'auto') => (
    <Zoom in timeout={300} key={`task-zoom-${task.id}`}>
      <TaskCard
        priority={task.priority}
        sx={{ height, minHeight: '60px', mb: 0.5 }}
        onClick={() => handleTaskClick(task)}
        onMouseEnter={(e) => handleTaskHover(e, task)}
        onMouseLeave={handlePopoverClose}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            {task.title}
          </Typography>
          <Chip
            size="small"
            label={task.priority}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">
            {task.startTime} - {task.endTime}
          </Typography>
        </Box>

        {task.assigneeName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
              {task.assigneeName.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {task.assigneeName}
            </Typography>
          </Box>
        )}

        {/* Priority indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.8)',
            animation: task.priority === 'High' ? `${pulse} 2s infinite` : 'none',
          }}
        />
      </TaskCard>
    </Zoom>
  );

  // Enhanced Month View with animations
  const renderEnhancedMonthView = () => {
    // Lấy tất cả ngày trong tháng hiện tại
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Bắt đầu từ thứ 2
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Tạo các hàng tuần (mỗi tuần có 7 ngày)
    const weeks = [];
    let week = [];
    
    days.forEach((day) => {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });
    
    if (week.length > 0) {
      weeks.push(week);
    }
    
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    
    return (
      <GlassPaper sx={{ p: 0, overflow: 'hidden' }}>
        {/* Header với tên các ngày trong tuần */}
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          borderBottom: '1px solid #e0e0e0',
          borderLeft: '1px solid #e0e0e0',
          borderTop: '1px solid #e0e0e0'
        }}>
          {dayNames.map((name, index) => (
            <Box 
              key={index} 
              sx={{ 
                flex: 1,
                p: 2,
                textAlign: 'center',
                fontWeight: 'bold',
                color: index === 6 ? 'error.main' : 'text.primary', // CN màu đỏ
                borderRight: '1px solid #e0e0e0'
              }}
            >
              {name}
            </Box>
          ))}
        </Box>
        
        {weeks.map((week, weekIndex) => (
          <Fade in timeout={300 + weekIndex * 100} key={weekIndex}>
            <Box sx={{ display: 'flex', width: '100%' }}>
              {week.map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                const tasksForDay = getTasksForDay(day);
                
                return (
                  <Box
                    key={dayIndex}
                    sx={{
                      flex: 1,
                      height: 140,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      p: 1,
                      position: 'relative',
                      background: !isCurrentMonth
                        ? alpha(theme.palette.grey[100], 0.5)
                        : isToday
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.05),
                        transform: 'scale(1.02)',
                        zIndex: 10,
                      },
                    }}
                  >
                    {/* Enhanced day number */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? 800 : 'normal',
                          background: isToday
                            ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            : 'transparent',
                          backgroundClip: 'text',
                          textFillColor: isToday ? 'transparent' : 'inherit',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>
                    </Box>

                    {/* Enhanced tasks display */}
                    <Box sx={{ maxHeight: 80, overflow: 'hidden' }}>                      {tasksForDay.slice(0, 2).map((task, index) => (
                        <React.Fragment key={`task-${task.id}-${index}`}>
                          {renderEnhancedTaskCard(task, '30px')}
                        </React.Fragment>
                      ))}
                      {tasksForDay.length > 2 && (
                        <Chip
                          label={`+${tasksForDay.length - 2} more`}
                          size="small"
                          sx={{
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Box>

                    {/* Task count badge */}
                    {tasksForDay.length > 0 && (
                      <Badge
                        badgeContent={tasksForDay.length}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          '& .MuiBadge-badge': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            animation: tasksForDay.some(t => t.priority === 'High') ? `${pulse} 2s infinite` : 'none',
                          },
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Fade>
        ))}
      </GlassPaper>
    );
  };

  // Enhanced Detail Panel
  const renderEnhancedDetailPanel = () => (
    <Fade in timeout={500}>
      <GlassPaper
        sx={{
          width: '400px',
          p: 3,
          ml: 2,
          position: 'relative',
          animation: `${slideIn} 0.5s ease-out`,
        }}
      >
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: alpha(theme.palette.error.main, 0.1),
            '&:hover': { background: alpha(theme.palette.error.main, 0.2) },
          }}
          onClick={() => setSelectedTask(null)}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ pr: 6 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            {selectedTask.title}
          </Typography>

          <Stack spacing={3}>
            {/* Time info with enhanced styling */}
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon color="primary" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Schedule
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {selectedTask.startTime} - {selectedTask.endTime}
              </Typography>              <Typography variant="body2" color="text.secondary">
                {selectedTask.dueDate instanceof Date 
                  ? format(selectedTask.dueDate, 'MMM dd, yyyy') 
                  : typeof selectedTask.dueDate === 'string' 
                    ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')
                    : 'No due date'}
              </Typography>
            </Box>

            {/* Assignee info */}
            {selectedTask.assigneeName && (
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {selectedTask.assigneeName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {selectedTask.assigneeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Assignee
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Priority indicator */}
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon sx={{ color: selectedTask.color }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Priority: {selectedTask.priority}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={selectedTask.priority === 'High' ? 100 : selectedTask.priority === 'Medium' ? 60 : 30}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  background: alpha(theme.palette.grey[300], 0.3),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${selectedTask.color}, ${alpha(selectedTask.color, 0.7)})`,
                  },
                }}
              />
            </Box>

            {/* Description */}
            {selectedTask.description && (
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: alpha(theme.palette.grey[100], 0.5),
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTask.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </GlassPaper>
    </Fade>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`, minHeight: '100vh' }}>
      {renderEnhancedHeader()}
      
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1 }}>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderEnhancedMonthView()}
        </Box>
        
        {selectedTask && renderEnhancedDetailPanel()}
      </Box>

      {renderTaskPopover()}
    </Box>
  );
};

export default Calendar;
