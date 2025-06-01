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
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  MoreVert as MoreIcon,Icon,
  ViewKanban as ViewKanbanIcon,n,
  ViewList as ViewListIcontIcon
} from '@mui/icons-material';om '@mui/icons-material';
import { styled } from '@mui/material/styles';import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import EditTaskDialog from './EditTaskDialog';log from './EditTaskDialog';

// Modern minimalist styled componentsents
const BoardContainer = styled(Box)(({ theme }) => ({styled(Box)(({ theme }) => ({
  padding: '24px',
  backgroundColor: '#fafafa',ckgroundColor: '#fafafa',
  minHeight: '100vh',  minHeight: '100vh',
}));

const BoardHeader = styled(Box)(({ theme }) => ({= styled(Box)(({ theme }) => ({
  display: 'flex',',
  alignItems: 'center',
  justifyContent: 'space-between',stifyContent: 'space-between',
  marginBottom: '32px',  marginBottom: '32px',
  padding: '0 8px',
}));

const BoardTitle = styled(Typography)(({ theme }) => ({t BoardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '28px',  fontSize: '28px',
  fontWeight: 700,
  color: '#333',
  letterSpacing: '-0.5px',
}));

const ColumnContainer = styled(Grid)(({ theme }) => ({styled(Grid)(({ theme }) => ({
  height: 'calc(100vh - 200px)', - 200px)',
  overflowY: 'auto',erflowY: 'auto',
}));}));

const Column = styled(Paper)(({ theme }) => ({led(Paper)(({ theme }) => ({
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',e0e0',
  height: 'fit-content',
  minHeight: '400px',nHeight: '400px',
}));}));

const ColumnHeader = styled(Box)(({ theme }) => ({= styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',enter',
  justifyContent: 'space-between','space-between',
  marginBottom: '20px',
  paddingBottom: '12px',om: '12px',
  borderBottom: '2px solid #f0f0f0',rderBottom: '2px solid #f0f0f0',
}));}));

const ColumnTitle = styled(Typography)(({ theme }) => ({pography)(({ theme }) => ({
  fontSize: '16px',x',
  fontWeight: 600,
  color: '#333',
  display: 'flex',,
  alignItems: 'center',ignItems: 'center',
  gap: '8px',  gap: '8px',
}));

const TaskCount = styled(Chip)(({ theme }) => ({d(Chip)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: '#666',
  fontWeight: 600,
  fontSize: '12px',
  height: '24px',x',
}));

const TaskCard = styled(Card)(({ theme }) => ({d)(({ theme }) => ({
  marginBottom: '16px',rginBottom: '16px',
  borderRadius: '12px',rderRadius: '12px',
  border: '1px solid #e0e0e0',  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  cursor: 'pointer',',
  transition: 'all 0.2s ease',0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderColor: '#2196f3',    borderColor: '#2196f3',
  },
}));

const TaskCardContent = styled(CardContent)(({ theme }) => ({ntent = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  '&:last-child': {{
    paddingBottom: '16px',paddingBottom: '16px',
  },  },
}));

const TaskTitle = styled(Typography)(({ theme }) => ({= styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '8px',
  lineHeight: 1.4,
}));

const TaskDescription = styled(Typography)(({ theme }) => ({t TaskDescription = styled(Typography)(({ theme }) => ({
  fontSize: '13px',  fontSize: '13px',
  color: '#666',
  marginBottom: '12px',2px',
  lineHeight: 1.4,
  overflow: 'hidden',hidden',
  textOverflow: 'ellipsis',is',
  display: '-webkit-box',',
  WebkitLineClamp: 2,bkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',  WebkitBoxOrient: 'vertical',
}));

const TaskMeta = styled(Box)(({ theme }) => ({{
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  alignItems: 'center',ignItems: 'center',
  marginBottom: '12px',marginBottom: '12px',
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => {rityChip = styled(Chip)(({ theme, priority }) => {
  const colors = {
    low: { bg: '#e8f5e8', color: '#2e7d32' },or: '#2e7d32' },
    medium: { bg: '#fff3e0', color: '#f57c00' },fff3e0', color: '#f57c00' },
    high: { bg: '#ffebee', color: '#d32f2f' },bee', color: '#d32f2f' },
    urgent: { bg: '#fce4ec', color: '#c2185b' }#fce4ec', color: '#c2185b' }
  };
  
  const colorScheme = colors[priority] || colors.medium;t colorScheme = colors[priority] || colors.medium;
  
  return {eturn {
    backgroundColor: colorScheme.bg,    backgroundColor: colorScheme.bg,
    color: colorScheme.color,
    fontWeight: 600,0,
    fontSize: '11px',
    height: '20px',
    '&:hover': {'&:hover': {
      backgroundColor: colorScheme.bg,      backgroundColor: colorScheme.bg,
    },
  };
});

const TaskFooter = styled(Box)(({ theme }) => ({t TaskFooter = styled(Box)(({ theme }) => ({
  display: 'flex',  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const AssigneeSection = styled(Box)(({ theme }) => ({tion = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',',
  gap: '8px',p: '8px',
}));

const DueDateChip = styled(Chip)(({ theme, overdue }) => ({=> ({
  backgroundColor: overdue ? '#ffebee' : '#f5f5f5',r: overdue ? '#ffebee' : '#f5f5f5',
  color: overdue ? '#d32f2f' : '#666', '#d32f2f' : '#666',
  fontSize: '11px',
  height: '20px',
  '& .MuiChip-icon': {on': {
    fontSize: '14px',
  },
}));

const AddTaskButton = styled(Button)(({ theme }) => ({tton)(({ theme }) => ({
  width: '100%',
  padding: '12px',
  border: '2px dashed #e0e0e0',rder: '2px dashed #e0e0e0',
  borderRadius: '8px',rderRadius: '8px',
  color: '#666',  color: '#666',
  backgroundColor: 'transparent',
  textTransform: 'none',ne',
  fontWeight: 500,,
  '&:hover': {
    backgroundColor: '#f5f5f5',',
    borderColor: '#2196f3',2196f3',
    color: '#2196f3',
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({t StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',sition: 'fixed',
  bottom: '24px',  bottom: '24px',
  right: '24px',
  backgroundColor: '#2196f3',
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
  '&:hover': {
    backgroundColor: '#1976d2',    backgroundColor: '#1976d2',
    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.5)', '0 6px 16px rgba(33, 150, 243, 0.5)',
  },
}));

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);en, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list' or 'list'

  // Mock data
  const mockTasks = [
    {
      id: 1, id: 1,
      title: 'Design System Update', 'Design System Update',
      description: 'Update the design system components to match new brand guidelines',design system components to match new brand guidelines',
      status: 'todo',
      priority: 'high',
      assignee: { id: 1, name: 'John Doe', avatar: null },name: 'John Doe', avatar: null },
      project: { id: 1, name: 'Web Redesign', color: '#2196f3' },3' },
      dueDate: new Date('2024-01-20'),
      progress: 0,
      createdAt: '2024-01-15T10:00:00Z'024-01-15T10:00:00Z'
    },
    {
      id: 2, id: 2,
      title: 'API Integration', 'API Integration',
      description: 'Integrate payment gateway API with the checkout process',e payment gateway API with the checkout process',
      status: 'in-progress',
      priority: 'urgent',',
      assignee: { id: 2, name: 'Jane Smith', avatar: null },name: 'Jane Smith', avatar: null },
      project: { id: 2, name: 'Mobile App', color: '#4caf50' },,
      dueDate: new Date('2024-01-18'),
      progress: 65,
      createdAt: '2024-01-14T14:30:00Z'024-01-14T14:30:00Z'
    },
    {
      id: 3, id: 3,
      title: 'User Testing', 'User Testing',
      description: 'Conduct user testing sessions for the new dashboard interface',ser testing sessions for the new dashboard interface',
      status: 'review',
      priority: 'medium',um',
      assignee: { id: 3, name: 'Mike Johnson', avatar: null },3, name: 'Mike Johnson', avatar: null },
      project: { id: 1, name: 'Web Redesign', color: '#2196f3' }, },
      dueDate: new Date('2024-01-25'),
      progress: 90,
      createdAt: '2024-01-12T09:15:00Z'24-01-12T09:15:00Z'
    },
    {
      id: 4,  id: 4,
      title: 'Documentation',      title: 'Documentation',
      description: 'Complete API documentation for the new endpoints','Complete API documentation for the new endpoints',
      status: 'done',
      priority: 'low',
      assignee: { id: 4, name: 'Sarah Wilson', avatar: null }, },
      project: { id: 3, name: 'Marketing Campaign', color: '#ff9800' }, color: '#ff9800' },
      dueDate: new Date('2024-01-16'),  dueDate: new Date('2024-01-16'),
      progress: 100,      progress: 100,
      createdAt: '2024-01-10T16:45:00Z'024-01-10T16:45:00Z'
    }
  ];

  const columns = [
    { id: 'todo', title: 'To Do', color: '#666' },: 'To Do', color: '#666' },
    { id: 'in-progress', title: 'In Progress', color: '#2196f3' },e: 'In Progress', color: '#2196f3' },
    { id: 'review', title: 'In Review', color: '#ff9800' },'In Review', color: '#ff9800' },
    { id: 'done', title: 'Done', color: '#4caf50' }e', color: '#4caf50' }
  ];

  useEffect(() => {ect(() => {
    setTasks(mockTasks);sks);
  }, []);

  const handleTaskSave = (taskData) => {askData) => {
    if (selectedTask) {electedTask) {
      // Update existing taskate existing task
      setTasks(prevTasks => =>
        prevTasks.map(task =>ask =>
          task.id === selectedTask.id ? { ...taskData, id: selectedTask.id } : task= selectedTask.id ? { ...taskData, id: selectedTask.id } : task
        )
      );
      setSnackbar({tSnackbar({
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
            priority={task.priority || 'medium'}
            label={(task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium')}
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
                  {task.assignee && task.assignee.name ? task.assignee.name.charAt(0) : '?'}
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

  const renderTaskList = () => (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="left">Title</TableCell>
            <TableCell align="left">Assignee</TableCell>
            <TableCell align="left">Due Date</TableCell>
            <TableCell align="left">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell align="left">
                <Typography variant="body2" fontWeight={600} color="#333">
                  {task.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {task.description}
                </Typography>
              </TableCell>
              <TableCell align="left">
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
              </TableCell>
              <TableCell align="left">
                {task.dueDate ? (
                  <DueDateChip
                    label={format(new Date(task.dueDate), 'MMM dd')}
                    size="small"
                    overdue={isOverdue(task.dueDate)}
                    icon={isOverdue(task.dueDate) ? <FlagIcon fontSize="small" color="error" /> : <CalendarIcon fontSize="small" />}
                  />
                ) : (
                  <Chip label="No due date" size="small" color="default" />
                )}
              </TableCell>
              <TableCell align="left">
                <Chip
                  label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  size="small"
                  sx={{
                    backgroundColor: task.status === 'done' ? '#e8f5e9' : task.status === 'in-progress' ? '#e3f2fd' : '#fff3e0',
                    color: task.status === 'done' ? '#2e7d32' : task.status === 'in-progress' ? '#0d47a1' : '#e65100',
                    fontWeight: 500,
                    fontSize: '12px',
                    height: '24px',
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => handleTaskEdit(task)}>
                  <EditIcon fontSize="small" color="action" />
                </IconButton>
                <IconButton size="small" onClick={() => handleTaskDelete(task.id)}>
                  <DeleteIcon fontSize="small" color="action" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <BoardContainer>
      <BoardHeader>
        <BoardTitle>Task Board</BoardTitle>
        <Typography variant="body2" color="textSecondary">
          {tasks.length} tasks • {getTasksByStatus('done').length} completed
        </Typography>
      </BoardHeader>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(event, newView) => {
          if (newView !== null) {
            setViewMode(newView);
          }
        }}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="kanban" sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <ViewKanbanIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="list" sx={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <ViewListIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      {viewMode === 'kanban' ? (
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
      ) : (
        renderTaskList()
      )}

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
