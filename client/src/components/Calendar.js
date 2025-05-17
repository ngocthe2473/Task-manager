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
  Badge
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CircleIcon from '@mui/icons-material/Circle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { getAllTasks } from '../services/fakeDatabaseService';
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
  getDay,
  parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';

const Calendar = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  const [loading, setLoading] = useState(true);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Tạo khung giờ từ 8:00 đến 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour < 10 ? '0' + hour : hour}:00`;
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskData = await getAllTasks();
        
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
        setLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
                  {selectedTask.dueDate}
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

  // Render Month View - chia đều khoảng cách các ngày và lấp đầy chiều rộng
  const renderMonthView = () => {
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
      <Box sx={{ 
        mt: 2, 
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
        
        {/* Grid các ngày trong tháng */}
        {weeks.map((week, weekIndex) => (
          <Box 
            key={weekIndex} 
            sx={{ 
              display: 'flex', 
              width: '100%',
              borderBottom: '1px solid #e0e0e0',
              borderLeft: '1px solid #e0e0e0'
            }}
          >
            {week.map((day, dayIndex) => {
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              const tasksForDay = getTasksForDay(day);
              
              return (
                <Box 
                  key={dayIndex}
                  sx={{ 
                    flex: 1, 
                    height: 110,
                    borderRight: '1px solid #e0e0e0',
                    p: 1,
                    position: 'relative',
                    bgcolor: !isCurrentMonth 
                      ? '#f9f9f9' // Màu cho ngày không thuộc tháng hiện tại
                      : isToday 
                        ? 'rgba(0, 115, 234, 0.08)' 
                        : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.6  // Giảm độ mờ để màu nền thấy rõ hơn
                  }}
                >
                  {/* Ngày */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontWeight: isToday ? 'bold' : 'normal',
                        bgcolor: isToday ? theme.palette.primary.main : 'transparent',
                        color: isToday 
                          ? 'white' 
                          : !isCurrentMonth 
                            ? 'text.disabled' 
                            : 'inherit',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                  </Box>
                  
                  {/* Tasks */}
                  <Box sx={{ 
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    {tasksForDay.slice(0, 3).map((task, index) => (
                      <Box 
                        key={index}
                        sx={{
                          p: '2px 4px',
                          bgcolor: task.color,
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          color: 'white',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          '&:hover': {
                            filter: 'brightness(0.95)'
                          }
                        }}
                        onClick={() => handleTaskClick(task)}
                        onMouseEnter={(e) => handleTaskHover(e, task)}
                        onMouseLeave={handlePopoverClose}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.7rem',
                            display: 'block',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
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
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem'
                        }}
                      >
                        +{tasksForDay.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
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
                <Box>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                    <strong>Due:</strong> {hoveredTask.dueDate}
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

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      {/* Header với các nút điều hướng và chọn chế độ xem */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
          Upcoming
          <Typography 
            component="span" 
            variant="h4" 
            sx={{ 
              ml: 2,
              color: theme.palette.text.secondary,
              fontWeight: 'normal'
            }}
          >
            {getDateTitle()}
          </Typography>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={handlePreviousPeriod} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Button 
            variant="text"
            onClick={handleToday}
            sx={{ mx: 1 }}
          >
            Today
          </Button>
          <IconButton onClick={handleNextPeriod} size="small">
            <ArrowForwardIcon />
          </IconButton>
          
          <Box sx={{ ml: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              aria-label="calendar view"
              size="small"
            >
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Nội dung lịch */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
        {renderTaskPopover()}
      </Paper>

      {/* Date picker popup - tương tự như ảnh mẫu đầu tiên */}
      {/* Phần này có thể thêm sau nếu cần */}
    </Box>
  );
};

export default Calendar;
