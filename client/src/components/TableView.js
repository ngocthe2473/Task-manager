import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Checkbox, 
  IconButton, 
  Button,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Collapse,
  CircularProgress,
  TextField,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllTasks, addTask } from '../services/fakeDatabaseService';

const STATUS_COLORS = {
  'todo': { bg: '#f0f1f5', text: '#42526e', name: 'Việc cần làm' },
  'inprogress': { bg: '#0073ea', text: 'white', name: 'Đang làm' },
  'review': { bg: '#00a9ff', text: 'white', name: 'Đang Review' },
  'done': { bg: '#00c875', text: 'white', name: 'Đã làm xong' },
  'blocked': { bg: '#e44258', text: 'white', name: 'Mắc kẹt' }
};

const PRIORITY_COLORS = {
  'High': { bg: '#e44258', text: 'white', name: 'Cao' },
  'Medium': { bg: '#a25ddc', text: 'white', name: 'Bình thường' },
  'Low': { bg: '#00c875', text: 'white', name: 'Thấp' }
};

// Group component để hiển thị nhóm các task
const TaskGroup = ({ group, onTaskClick }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      {/* Group Header */}
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          backgroundColor: '#f6f7fb',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell padding="checkbox">
          <IconButton size="small">
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" colSpan={7}>
          <Typography variant="subtitle1" fontWeight="bold">
            {group.title}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Collapsible task rows */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {group.tasks.length > 0 ? (
              <Box>
                {group.tasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    hover 
                    onClick={() => onTaskClick(task)}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <KeyboardArrowDownIcon />
                          </IconButton>
                        )}
                        <Typography>{task.title}</Typography>
                        {task.comments && task.comments.length > 0 && (
                          <IconButton size="small" sx={{ ml: 1, color: 'text.secondary' }}>
                            <ChatBubbleOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {task.assigneeName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            sx={{ width: 28, height: 28, fontSize: '0.8rem' }} 
                            alt={task.assigneeName}
                          >
                            {task.assigneeName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{task.assigneeName}</Typography>
                        </Box>
                      ) : (
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#f0f1f5' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={STATUS_COLORS[task.status].name}
                        sx={{ 
                          backgroundColor: STATUS_COLORS[task.status].bg,
                          color: STATUS_COLORS[task.status].text,
                          fontWeight: 'medium',
                          minWidth: 120,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {task.dueDate || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={PRIORITY_COLORS[task.priority].name}
                        sx={{ 
                          backgroundColor: PRIORITY_COLORS[task.priority].bg,
                          color: PRIORITY_COLORS[task.priority].text,
                          fontWeight: 'medium',
                          minWidth: 100,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {task.description || '—'}
                    </TableCell>
                    <TableCell>
                      {task.files && task.files.length > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <InsertDriveFileOutlinedIcon color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {task.files.length} files
                          </Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Add task row */}
                <TableRow
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell colSpan={8} sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AddIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        + Add task
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </Box>
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No tasks in this group
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TableView = ({ onTaskClick }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [openNewGroup, setOpenNewGroup] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskData = await getAllTasks();
        setTasks(taskData);
        
        // Group tasks by status for initial view
        const todoTasks = taskData.filter(task => task.status === 'todo');
        const inProgressTasks = taskData.filter(task => task.status === 'inprogress');
        const reviewTasks = taskData.filter(task => task.status === 'review');
        const doneTasks = taskData.filter(task => task.status === 'done');
        
        setTaskGroups([
          { 
            id: 'group1', 
            title: 'Phân công công việc - Đéo làm t đấm cho', 
            color: '#579bfc',
            tasks: [...todoTasks, ...inProgressTasks]
          },
          { 
            id: 'group2', 
            title: 'Đã làm xong rồi hê hê hê 5 5 5', 
            color: '#00c875',
            tasks: [...doneTasks]
          },
          { 
            id: 'group3', 
            title: 'Bài tập trên lớp', 
            color: '#a25ddc',
            tasks: [...reviewTasks]
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAddGroup = () => {
    if (newGroupName.trim() !== '') {
      const newGroup = {
        id: `group${taskGroups.length + 1}`,
        title: newGroupName,
        color: '#579bfc',
        tasks: []
      };
      
      setTaskGroups([...taskGroups, newGroup]);
      setNewGroupName('');
      setOpenNewGroup(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            New task
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" sx={{ px: 2 }}>
              Person
            </Button>
            <Button variant="outlined" sx={{ px: 2 }}>
              Filter
            </Button>
            <Button variant="outlined" sx={{ px: 2 }}>
              Sort
            </Button>
            <Button variant="outlined" sx={{ px: 2 }}>
              Hide
            </Button>
            <Button variant="outlined" sx={{ px: 2 }}>
              Group by
            </Button>
          </Box>
        </Box>
        <IconButton>
          <MoreHorizIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tasks table">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f7fb' }}>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Người làm</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Hạn nộp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Độ ưu tiên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Files</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskGroups.map((group) => (
              <TaskGroup 
                key={group.id} 
                group={group} 
                onTaskClick={onTaskClick}
              />
            ))}

            {/* Add new group button */}
            <TableRow>
              <TableCell colSpan={8}>
                {openNewGroup ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                    <TextField
                      autoFocus
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      size="small"
                      fullWidth
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddGroup();
                        }
                      }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleAddGroup}
                      disabled={newGroupName.trim() === ''}
                    >
                      Add
                    </Button>
                    <Button variant="text" onClick={() => setOpenNewGroup(false)}>
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNewGroup(true)}
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    Add group
                  </Button>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableView;
