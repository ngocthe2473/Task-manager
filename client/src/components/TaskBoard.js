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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
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
import { getAllTasks, addTask, updateTask, deleteTask, getMyTasks, getMyTeams, getProjects, getTasksByProject } from '../services/apiService';
import { getSubTasksByTaskId } from '../services/subtaskService';
import { useNavigate } from 'react-router-dom';

// Modern minimalist styled components
const BoardContainer = styled(Box)(({ theme }) => ({
  padding: '24px 32px', // Tăng padding
  backgroundColor: '#fafafa',
  minHeight: '100vh',
  maxWidth: '100%',
  overflow: 'hidden',
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

const ColumnContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr', // 4 cột đều nhau
  gap: '16px',
  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
  padding: '0 12px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr', // 1 cột trên mobile
  },
}));

const Column = styled(Paper)(({ theme }) => ({
  padding: '28px', // Tăng padding hơn nữa
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  height: 'fit-content',
  minHeight: '600px', // Tăng chiều cao tối thiểu
  width: '100%',
  minWidth: 0, // Cho phép column co lại khi cần
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

const TaskCard = styled(Card, {
  shouldForwardProp: (prop) => !['onEdit', 'onDelete', 'canEdit', 'canDelete', 'canComment', 'task'].includes(prop),
})(({ theme }) => ({
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
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

const DueDateChip = styled(Chip)(({ theme, overdue: isOverdue }) => ({
  backgroundColor: isOverdue ? '#ffebee' : '#f5f5f5',
  color: isOverdue ? '#d32f2f' : '#666',
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

const TaskBoard = ({ onTaskClick }) => {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  // Define columns array
  const columns = [
    { id: 'todo', title: 'To Do', color: '#2196f3' },
    { id: 'in-progress', title: 'In Progress', color: '#ff9800' },
    { id: 'review', title: 'Review', color: '#9c27b0' },
    { id: 'done', title: 'Done', color: '#4caf50' }
  ];

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        return userData.user || { _id: null };
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
    return { _id: null };
  };

  const currentUser = getUserInfo();

  // Load teams user is member of
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getMyTeams();
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeam(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch teams');
      }
    };
    fetchTeams();
  }, []);

  // Load projects when team changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedTeam) return;
      try {
        const allProjects = await getProjects();
        const filtered = allProjects.filter(p => (p.team?._id || p.team) === (selectedTeam._id || selectedTeam.id));
        setProjects(filtered);
        if (filtered.length > 0) {
          setSelectedProject(filtered[0]);
        } else {
          setSelectedProject(null);
        }
      } catch (err) {
        setError('Failed to fetch projects');
      }
    };
    fetchProjects();
  }, [selectedTeam]);  // Load tasks when project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) {
        setTasks([]);
        return;
      }
      setLoading(true);      try {
        const projectId = selectedProject._id || selectedProject.id;
        console.log('Fetching tasks for project:', projectId); // Debug log
        
        // Fetch tasks based on filter preference
        const filters = showMyTasksOnly ? { assignedToMe: true } : {};
        const taskData = await getTasksByProject(projectId, filters);
        console.log('Fetched task data:', taskData); // Debug log
        
        setTasks(taskData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks');
        setLoading(false);
      }
    };    fetchTasks();
  }, [selectedProject, showMyTasksOnly]);  // Dropdown UI for team và project
  const renderTeamProjectSelectors = () => (
    <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="team-select-label">Team</InputLabel>
        <Select
          labelId="team-select-label"
          value={selectedTeam?._id || selectedTeam?.id || ''}
          label="Team"
          onChange={e => {
            const team = teams.find(t => (t._id || t.id) === e.target.value);
            setSelectedTeam(team);
          }}
        >
          {teams.map(team => (
            <MenuItem key={team._id || team.id} value={team._id || team.id}>
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#1976d2', fontSize: 14 }}>
                {team.name?.charAt(0) || 'T'}
              </Avatar>
              {team.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="project-select-label">Project</InputLabel>
        <Select
          labelId="project-select-label"
          value={selectedProject?._id || selectedProject?.id || ''}
          label="Project"
          onChange={e => {
            const project = projects.find(p => (p._id || p.id) === e.target.value);
            setSelectedProject(project);
          }}
        >
          {projects.map(project => (
            <MenuItem key={project._id || project.id} value={project._id || project.id}>
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#43a047', fontSize: 14 }}>
                {project.name?.charAt(0) || 'P'}
              </Avatar>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={showMyTasksOnly}
            onChange={(e) => setShowMyTasksOnly(e.target.checked)}
            color="primary"
          />
        }
        label="Chỉ hiển thị task của tôi"
        sx={{ ml: 2 }}
      />
    </Box>
  );

  const handleTaskSave = async (taskData) => {
    try {
      if (selectedTask) {
        // Update existing task
        const updatedTask = await updateTask(selectedTask._id, taskData);
        
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === selectedTask._id ? updatedTask : task
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Task updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new task
        const newTask = await addTask(taskData);
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        setSnackbar({
          open: true,
          message: 'Task created successfully!',
          severity: 'success'
        });
      }
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || 'Failed to save task'}`,
        severity: 'error'
      });
    }
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
    // Also call the parent onTaskClick if provided
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const handleTaskDelete = async (task) => {
    try {
      await deleteTask(task._id);
      setTasks(tasks.filter(t => t._id !== task._id));
      setSnackbar({
        open: true,
        message: 'Task deleted successfully!',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || 'Failed to delete task'}`,
        severity: 'error'
      });
    }
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

  const renderTask = (task) => {
    const canEdit = currentUser._id === task.creator?._id || currentUser._id === task.creator;
    const canDelete = currentUser._id === task.creator?._id || currentUser._id === task.creator;
    const canComment = true; // Anyone can comment on tasks

    return (
      <TaskCard
        key={task._id}
        task={task}
        onClick={() => onTaskClick(task)}
        onEdit={canEdit ? () => handleTaskEdit(task) : undefined}
        onDelete={canDelete ? () => handleTaskDelete(task) : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
        canComment={canComment}
      >
        <TaskCardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>            <TaskTitle 
              component="div"
              onClick={(e) => {
                e.stopPropagation();
                handleTaskEdit(task);
              }} 
              sx={{ cursor: 'pointer', flex: 1 }}
            >
              {task.title}
            </TaskTitle>
            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
              <Tooltip title="Edit Task">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskEdit(task);
                  }}
                  disabled={!canEdit}
                  sx={{ 
                    width: 28, 
                    height: 28,
                    color: canEdit ? '#2196f3' : '#ccc'
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Task">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      handleTaskDelete(task);
                    }
                  }}
                  disabled={!canDelete}
                  sx={{ 
                    width: 28, 
                    height: 28,
                    color: canDelete ? '#f44336' : '#ccc'
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <TaskDescription onClick={(e) => {
            e.stopPropagation();
            handleTaskEdit(task);
          }} sx={{ cursor: 'pointer' }}>
            {task.description || 'No description'}
          </TaskDescription>
          
          <TaskMeta>
            <PriorityChip
              priority={task.priority?.toLowerCase()}
              label={task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : 'Medium'}
              size="small"
            />
            {task.project && (
              <Chip
                label={typeof task.project === 'object' ? task.project.name : 'Project'}
                size="small"
                sx={{
                  backgroundColor: (typeof task.project === 'object' && task.project.color) 
                    ? task.project.color + '20' 
                    : '#2196f320',
                  color: (typeof task.project === 'object' && task.project.color) 
                    ? task.project.color 
                    : '#2196f3',
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
                  {task.progress || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={task.progress || 0}
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
                    {typeof task.assignee === 'object' && task.assignee.name 
                      ? task.assignee.name.charAt(0) 
                      : 'U'}
                  </Avatar>
                  <Typography variant="caption" color="textSecondary" component="span">
                    {typeof task.assignee === 'object' && task.assignee.name 
                      ? task.assignee.name 
                      : 'Unassigned'}
                  </Typography>
                </>
              )}
            </AssigneeSection>
            {task.dueDate && (
              <DueDateChip
                icon={<CalendarIcon />}
                label={format(new Date(task.dueDate), 'MMM dd')}
                size="small"
                overdue={isOverdue(task.dueDate) ? 1 : 0}
              />
            )}
          </TaskFooter>
        </TaskCardContent>
      </TaskCard>
    );
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <BoardContainer>
      <BoardHeader>
        <BoardTitle>Task Board</BoardTitle>
        <Typography variant="body2" color="textSecondary" component="div">
          {tasks.length} tasks • {getTasksByStatus('done').length} completed
        </Typography>
      </BoardHeader>
      {renderTeamProjectSelectors()}      <ColumnContainer>
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Column key={column.id}>
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
              </ColumnHeader>              <Box>
                {columnTasks.map(task => renderTask(task))}
                
                <AddTaskButton
                  startIcon={<AddIcon />}
                  onClick={handleNewTask}
                >
                  Add Task
                </AddTaskButton>
              </Box>
            </Column>
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
