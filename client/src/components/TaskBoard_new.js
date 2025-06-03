import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fab,
  Snackbar,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import EditTaskDialog from './EditTaskDialog';

// Modern minimalist styled components
const BoardContainer = styled(Box)(({ theme }) => ({
  padding: '24px',
  backgroundColor: '#fafafa',
  minHeight: '100vh',
}));

const BoardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '32px',
  padding: '0 8px',
}));

const BoardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 700,
  color: '#333',
  letterSpacing: '-0.5px',
}));

const ColumnContainer = styled(Grid)(({ theme }) => ({
  height: 'calc(100vh - 200px)',
  overflowY: 'auto',
}));

const Column = styled(Paper)(({ theme }) => ({
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  height: 'fit-content',
  minHeight: '400px',
}));

const ColumnHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '2px solid #f0f0f0',
}));

const ColumnTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: '#333',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const TaskCount = styled(Chip)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: '#666',
  fontWeight: 600,
  fontSize: '12px',
  height: '24px',
}));

const TaskCard = styled(Card)(({ theme }) => ({
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderColor: '#2196f3',
  },
}));

const TaskCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  '&:last-child': {
    paddingBottom: '16px',
  },
}));

const TaskTitle = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '8px',
  lineHeight: 1.4,
}));

const TaskDescription = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  color: '#666',
  marginBottom: '12px',
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}));

const TaskMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '12px',
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => {
  const colors = {
    low: { bg: '#e8f5e8', color: '#2e7d32' },
    medium: { bg: '#fff3e0', color: '#f57c00' },
    high: { bg: '#ffebee', color: '#d32f2f' },
    urgent: { bg: '#fce4ec', color: '#c2185b' }
  };
  
  const colorScheme = colors[priority] || colors.medium;
  
  return {
    backgroundColor: colorScheme.bg,
    color: colorScheme.color,
    fontWeight: 600,
    fontSize: '11px',
    height: '20px',
    '&:hover': {
      backgroundColor: colorScheme.bg,
    },
  };
});

const TaskFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const AssigneeSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const DueDateChip = styled(Chip)(({ theme, overdue }) => ({
  backgroundColor: overdue ? '#ffebee' : '#f5f5f5',
  color: overdue ? '#d32f2f' : '#666',
  fontSize: '11px',
  height: '20px',
  '& .MuiChip-icon': {
    fontSize: '14px',
  },
}));

const AddTaskButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '12px',
  border: '2px dashed #e0e0e0',
  borderRadius: '8px',
  color: '#666',
  backgroundColor: 'transparent',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#2196f3',
    color: '#2196f3',
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  backgroundColor: '#2196f3',
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
  '&:hover': {
    backgroundColor: '#1976d2',
    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.5)',
  },
}));

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data
  const mockTasks = [
    {
      id: 1,
      title: 'Design System Update',
      description: 'Update the design system components to match new brand guidelines',
      status: 'todo',
      priority: 'high',
      assignee: { id: 1, name: 'John Doe', avatar: null },
      project: { id: 1, name: 'Web Redesign', color: '#2196f3' },
      dueDate: new Date('2024-01-20'),
      progress: 0,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'API Integration',
      description: 'Integrate payment gateway API with the checkout process',
      status: 'in-progress',
      priority: 'urgent',
      assignee: { id: 2, name: 'Jane Smith', avatar: null },
      project: { id: 2, name: 'Mobile App', color: '#4caf50' },
      dueDate: new Date('2024-01-18'),
      progress: 65,
      createdAt: '2024-01-14T14:30:00Z'
    },
    {
      id: 3,
      title: 'User Testing',
      description: 'Conduct user testing sessions for the new dashboard interface',
      status: 'review',
      priority: 'medium',
      assignee: { id: 3, name: 'Mike Johnson', avatar: null },
      project: { id: 1, name: 'Web Redesign', color: '#2196f3' },
      dueDate: new Date('2024-01-25'),
      progress: 90,
      createdAt: '2024-01-12T09:15:00Z'
    },
    {
      id: 4,
      title: 'Documentation',
      description: 'Complete API documentation for the new endpoints',
      status: 'done',
      priority: 'low',
      assignee: { id: 4, name: 'Sarah Wilson', avatar: null },
      project: { id: 3, name: 'Marketing Campaign', color: '#ff9800' },
      dueDate: new Date('2024-01-16'),
      progress: 100,
      createdAt: '2024-01-10T16:45:00Z'
    }
  ];

  const columns = [
    { id: 'todo', title: 'To Do', color: '#666' },
    { id: 'in-progress', title: 'In Progress', color: '#2196f3' },
    { id: 'review', title: 'In Review', color: '#ff9800' },
    { id: 'done', title: 'Done', color: '#4caf50' }
  ];

  useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const handleTaskSave = (taskData) => {
    if (selectedTask) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? { ...taskData, id: selectedTask.id } : task
        )
      );
      setSnackbar({
        open: true,
        message: 'Task updated successfully!',
        severity: 'success'
      });
    } else {
      // Create new task
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setSnackbar({
        open: true,
        message: 'Task created successfully!',
        severity: 'success'
      });
    }
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setSnackbar({
      open: true,
      message: 'Task deleted successfully!',
      severity: 'info'
    });
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setEditDialogOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const renderTask = (task) => (
    <TaskCard key={task.id} onClick={() => handleTaskEdit(task)}>
      <TaskCardContent>
        <TaskTitle>{task.title}</TaskTitle>
        <TaskDescription>{task.description}</TaskDescription>
        
        <TaskMeta>
          <PriorityChip
            priority={task.priority}
            label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            size="small"
          />
          {task.project && (
            <Chip
              label={task.project.name}
              size="small"
              sx={{
                backgroundColor: task.project.color + '20',
                color: task.project.color,
                fontSize: '11px',
                height: '20px',
                fontWeight: 500
              }}
            />
          )}
        </TaskMeta>

        {task.status === 'in-progress' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Progress
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {task.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2196f3',
                },
              }}
            />
          </Box>
        )}

        <TaskFooter>
          <AssigneeSection>
            {task.assignee && (
              <>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '12px',
                    backgroundColor: '#2196f3'
                  }}
                >
                  {task.assignee.name.charAt(0)}
                </Avatar>
                <Typography variant="caption" color="textSecondary">
                  {task.assignee.name}
                </Typography>
              </>
            )}
          </AssigneeSection>
          
          {task.dueDate && (
            <DueDateChip
              icon={<CalendarIcon />}
              label={format(new Date(task.dueDate), 'MMM dd')}
              size="small"
              overdue={isOverdue(task.dueDate)}
            />
          )}
        </TaskFooter>
      </TaskCardContent>
    </TaskCard>
  );

  return (
    <BoardContainer>
      <BoardHeader>
        <BoardTitle>Task Board</BoardTitle>
        <Typography variant="body2" color="textSecondary">
          {tasks.length} tasks • {getTasksByStatus('done').length} completed
        </Typography>
      </BoardHeader>

      <ColumnContainer container spacing={3}>
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Grid item xs={12} sm={6} lg={3} key={column.id}>
              <Column>
                <ColumnHeader>
                  <ColumnTitle>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: column.color
                      }}
                    />
                    {column.title}
                  </ColumnTitle>
                  <TaskCount label={columnTasks.length} />
                </ColumnHeader>

                <Box>
                  {columnTasks.map(renderTask)}
                  
                  <AddTaskButton
                    startIcon={<AddIcon />}
                    onClick={handleNewTask}
                  >
                    Add Task
                  </AddTaskButton>
                </Box>
              </Column>
            </Grid>
          );
        })}
      </ColumnContainer>

      <StyledFab onClick={handleNewTask}>
        <AddIcon />
      </StyledFab>

      <EditTaskDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        task={selectedTask}
        onSave={handleTaskSave}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BoardContainer>
  );
};

export default TaskBoard;
