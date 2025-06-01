import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Fab,
  Snackbar,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  Badge,
  Zoom,
  Fade,
  Slide,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  RateReview as RateReviewIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { format } from 'date-fns';
import EditTaskDialog from './EditTaskDialog';

// Pro Animations
const slideInFromBottom = keyframes`
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const cardHover = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
`;

const neonGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
  50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Styled Components
const BoardContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
  minHeight: '100vh',
  padding: theme.spacing(3),
}));

const ColumnCard = styled(Card)(({ theme, status }) => {
  const getGradient = (status) => {
    switch (status) {
      case 'todo':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
      case 'inprogress':
        return 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
      case 'review':
        return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
      case 'done':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      default:
        return 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)';
    }
  };

  return {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.8)})`,
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    minHeight: '700px',
    position: 'relative',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '8px',
      background: getGradient(status),
      borderRadius: '24px 24px 0 0',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      background: getGradient(status),
      borderRadius: '26px',
      zIndex: -1,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      '&::after': {
        opacity: 0.1,
      },
    },
  };
});

const TaskCard = styled(Card)(({ theme, priority, isDragging }) => {
  const getPriorityGlow = (priority) => {
    switch (priority) {
      case 'High':
        return theme.palette.error.main;
      case 'Medium':
        return theme.palette.warning.main;
      case 'Low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[400];
    }
  };

  return {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.paper, 0.9)})`,
    backdropFilter: 'blur(15px)',
    borderRadius: '20px',
    border: `2px solid ${alpha(getPriorityGlow(priority), 0.2)}`,
    marginBottom: theme.spacing(2),
    cursor: 'grab',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    animation: `${slideInFromBottom} 0.6s ease-out`,
    transform: isDragging ? 'rotate(3deg) scale(1.05)' : 'none',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
      transition: 'left 0.8s ease',
    },
    '&:hover': {
      transform: isDragging ? 'rotate(3deg) scale(1.05)' : 'translateY(-8px) scale(1.02)',
      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px ${alpha(getPriorityGlow(priority), 0.3)}`,
      border: `2px solid ${getPriorityGlow(priority)}`,
      animation: priority === 'High' ? `${neonGlow} 2s ease-in-out infinite` : 'none',
      '&::before': {
        left: '100%',
      },
    },
    '&:active': {
      cursor: 'grabbing',
      transform: 'rotate(5deg) scale(1.1)',
    },
  };
});

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  animation: `${cardHover} 4s ease-in-out infinite`,
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    transform: 'scale(1.15)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
  },
}));

const StatsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.9)})`,
  color: 'white',
  borderRadius: '16px',
  padding: '8px 16px',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  animation: `${pulse} 3s ease-in-out infinite`,
}));

const PriorityIndicator = styled(Box)(({ theme, priority }) => {
  const getColor = (priority) => {
    switch (priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.info.main;
      default: return theme.palette.grey[400];
    }
  };

  return {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: getColor(priority),
    boxShadow: `0 0 10px ${alpha(getColor(priority), 0.5)}`,
    animation: priority === 'High' ? `${pulse} 2s infinite` : 'none',
  };
});

const TaskBoard = () => {
  const theme = useTheme();  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [draggedTask, setDraggedTask] = useState(null);

  // Mock users data
  const mockUsers = [
    { _id: 'user1', name: 'Trần Ngọc Thế' },
    { _id: 'user2', name: 'Nguyễn Tấn Long' },
    { _id: 'user3', name: 'Lê Hoàng Nam' },
    { _id: 'user4', name: 'Phạm Minh Tuấn' },
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTasks = [
        {
          _id: '1',
          title: 'Design Login Interface',
          description: 'Create modern login form with validation',
          priority: 'High',
          status: 'todo',
          assignee: { name: 'Trần Ngọc Thế', _id: 'user1' },
          dueDate: '2024-01-20',
          progress: 0
        },
        {
          _id: '2',
          title: 'Implement Authentication',
          description: 'Add JWT token authentication system',
          priority: 'High',
          status: 'inprogress',
          assignee: { name: 'Nguyễn Tấn Long', _id: 'user2' },
          dueDate: '2024-01-25',
          progress: 45
        },
        {
          _id: '3',
          title: 'Database Setup',
          description: 'Configure MongoDB Atlas connection',
          priority: 'Medium',
          status: 'review',
          assignee: { name: 'Trần Đại Việt', _id: 'user3' },
          dueDate: '2024-01-18',
          progress: 80
        },
        {
          _id: '4',
          title: 'Testing Suite',
          description: 'Create comprehensive test cases',
          priority: 'Low',
          status: 'done',
          assignee: { name: 'Trần Ngọc Thế', _id: 'user1' },
          dueDate: '2024-01-15',
          progress: 100
        }
      ];
      setTasks(mockTasks);    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Handle task operations
  const handleCreateTask = (taskData) => {
    const newTask = {
      _id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status.toLowerCase().replace(' ', ''),
      assignee: mockUsers.find(u => u._id === taskData.assignee) || null,
      dueDate: taskData.dueDate,
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [...prev, newTask]);
    setOpenDialog(false);
    setSnackbar({ 
      open: true, 
      message: 'Task created successfully!', 
      severity: 'success' 
    });
  };

  const handleEditTask = (taskData) => {
    if (!editingTask) return;

    const updatedTask = {
      ...editingTask,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status.toLowerCase().replace(' ', ''),
      assignee: mockUsers.find(u => u._id === taskData.assignee) || null,
      dueDate: taskData.dueDate,
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => prev.map(task => 
      task._id === editingTask._id ? updatedTask : task
    ));
    setOpenDialog(false);
    setEditingTask(null);
    setSnackbar({ 
      open: true, 
      message: 'Task updated successfully!', 
      severity: 'success' 
    });
  };

  const handleOpenNewTaskDialog = (status = 'To Do') => {
    setEditingTask(null);
    setOpenDialog(true);
  };

  const handleOpenEditTaskDialog = (task) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      try {
        const updatedTasks = tasks.map(task =>
          task._id === draggedTask._id
            ? { ...task, status: newStatus, progress: getStatusProgress(newStatus) }
            : task
        );
        setTasks(updatedTasks);
        setSnackbar({ 
          open: true, 
          message: `Task moved to ${getStatusLabel(newStatus)}!`, 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Failed to update task status', 
          severity: 'error' 
        });
      }
    }
    setDraggedTask(null);
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'todo': return 0;
      case 'inprogress': return 50;
      case 'review': return 80;
      case 'done': return 100;
      default: return 0;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'inprogress': return 'In Progress';
      case 'review': return 'Review';
      case 'done': return 'Done';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { sx: { mr: 1, fontSize: 24 } };
    switch (status) {
      case 'todo':
        return <AssignmentIcon {...iconProps} sx={{ color: '#ff9a9e' }} />;
      case 'inprogress':
        return <ScheduleIcon {...iconProps} sx={{ color: '#a18cd1' }} />;
      case 'review':
        return <RateReviewIcon {...iconProps} sx={{ color: '#ffecd2' }} />;
      case 'done':
        return <CheckCircleIcon {...iconProps} sx={{ color: '#a8edea' }} />;
      default:
        return <AssignmentIcon {...iconProps} />;
    }
  };

  const renderTaskCard = (task, index) => (
    <Zoom in timeout={300 + index * 100} key={task._id}>
      <TaskCard
        priority={task.priority}
        isDragging={draggedTask?._id === task._id}
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onClick={() => setEditingTask(task)}
      >
        <PriorityIndicator priority={task.priority} />
        
        <CardContent sx={{ p: 3 }}>
          {/* Task Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
              {task.title}
            </Typography>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                background: `linear-gradient(45deg, ${getPriorityColor(task.priority)}, ${alpha(getPriorityColor(task.priority), 0.8)})`,
                color: 'white',
                fontWeight: 'bold',
                animation: task.priority === 'High' ? `${pulse} 2s infinite` : 'none',
              }}
            />
          </Box>

          {/* Task Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
            {task.description?.substring(0, 120)}
            {task.description?.length > 120 && '...'}
          </Typography>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {task.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                background: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  background: getProgressGradient(task.progress),
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Task Meta */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {task.assignee && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    fontWeight: 'bold'
                  }}
                >
                  {task.assignee.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {task.assignee.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Assignee
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Due Date */}
          {task.dueDate && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 1,
              borderRadius: 2,
              background: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.info.main }} />
              <Typography variant="caption" fontWeight="bold">
                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            startIcon={<EditIcon />}            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditTaskDialog(task);
            }}
            sx={{
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(task._id);
            }}
            sx={{
              background: alpha(theme.palette.error.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.error.main, 0.2),
              },
            }}
          >
            Delete
          </Button>
        </CardActions>
      </TaskCard>
    </Zoom>
  );

  const renderColumn = (status, title, tasks) => (
    <Grid item xs={12} md={3} key={status}>
      <Fade in timeout={800}>
        <ColumnCard status={status}>
          <Box sx={{ p: 3, position: 'relative' }}>
            {/* Column Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getStatusIcon(status)}
                <Typography variant="h6" fontWeight="bold">
                  {title}
                </Typography>
              </Box>
              <Badge 
                badgeContent={tasks.length} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    fontWeight: 'bold',
                  },
                }}
              />
            </Box>

            {/* Tasks Container */}
            <Box
              sx={{ minHeight: 500 }}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
            >
              {tasks.map((task, index) => renderTaskCard(task, index))}

              {/* Add Task Button */}
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 3,
                  borderStyle: 'dashed',
                  py: 3,
                  color: 'text.secondary',
                  borderColor: alpha(theme.palette.divider, 0.5),
                  background: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                  },
                }}                onClick={() => handleOpenNewTaskDialog(status)}
              >
                <AddIcon sx={{ mr: 1 }} />
                Add New Task
              </Button>
            </Box>
          </Box>
        </ColumnCard>
      </Fade>
    </Grid>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.info.main;
      default: return theme.palette.grey[400];
    }
  };

  const getProgressGradient = (progress) => {
    if (progress >= 80) return `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`;
    if (progress >= 50) return `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`;
    if (progress >= 20) return `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`;
    return `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`;
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(tasks.filter(task => task._id !== taskId));
      setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
  };

  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress');
  const reviewTasks = tasks.filter(task => task.status === 'review');
  const doneTasks = tasks.filter(task => task.status === 'done');

  // Calculate completion rate
  const completionRate = tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0;

  return (
    <BoardContainer>
      {/* Header with Stats */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4, position: 'relative' }}>
          <Typography 
            variant="h3" 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TimelineIcon sx={{ mr: 2, fontSize: 48, color: theme.palette.primary.main }} />
            Task Board Pro
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="300" sx={{ mb: 3 }}>
            Drag & drop your way to productivity excellence
          </Typography>

          {/* Live Stats */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                borderRadius: 2,
                p: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {tasks.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.1)})`,
                borderRadius: 2,
                p: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {Math.round(completionRate)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete Rate
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.1)})`,
                borderRadius: 2,
                p: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {inProgressTasks.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Tasks
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.light, 0.1)})`,
                borderRadius: 2,
                p: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {reviewTasks.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Review
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <StatsOverlay>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="body2" fontWeight="bold">
                Live Updates
              </Typography>
            </Box>
          </StatsOverlay>
        </Box>
      </Fade>

      {/* Board Columns */}
      <Grid container spacing={3}>
        {renderColumn('todo', 'To Do', todoTasks)}
        {renderColumn('inprogress', 'In Progress', inProgressTasks)}
        {renderColumn('review', 'Review', reviewTasks)}
        {renderColumn('done', 'Done', doneTasks)}
      </Grid>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => handleOpenNewTaskDialog()}>
        <AddIcon />
      </FloatingActionButton>      {/* Task Dialog */}
      <EditTaskDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
        users={mockUsers}
        isNewTask={!editingTask}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BoardContainer>
  );
};

export default TaskBoard;
