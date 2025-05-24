import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Box, Typography, Avatar, Chip, Divider, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';

const TaskDetail = ({ open, onClose, task = {} }) => {
  const [editedTask, setEditedTask] = useState({
    title: task.title || '',
    description: task.description || '',
    assignee: task.assignee || '',
    priority: task.priority || 'Medium',
    due: task.due || '',
    comments: task.comments || []
  });

  const [comment, setComment] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    setEditedTask(prev => ({
      ...prev,
      comments: [
        ...prev.comments,
        { id: Date.now(), text: comment, author: 'Current User', date: new Date().toISOString() }
      ]
    }));
    setComment('');
  };

  if (!task) {
    return null;
  }

  // Xử lý an toàn khi assigneeName có thể là undefined
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0) || '?';
  };
  
  // Xử lý an toàn khi task.assigneeName có thể là undefined
  const assigneeName = task.assigneeName || 'Unassigned';
  
  // Các biến khác để tránh lỗi với dữ liệu undefined
  const taskTitle = task.title || 'Untitled Task';
  const taskDescription = task.description || 'No description';
  const taskPriority = task.priority || 'Medium';
  const taskDueDate = task.dueDate || task.due || 'No due date';
  const taskStatus = task.status || 'todo';

  // Màu cho priority
  const priorityColors = {
    'High': '#dc3545',
    'Medium': '#fd7e14',
    'Low': '#28a745'
  };

  // Màu và text cho status
  const statusConfig = {
    'todo': { color: '#e2ebf6', text: 'To Do' },
    'inprogress': { color: '#fff8dd', text: 'In Progress' },
    'review': { color: '#defbe6', text: 'Review' },
    'done': { color: '#edf5ff', text: 'Done' }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{ 
        sx: { 
          borderRadius: 2, 
          minHeight: '50vh' 
        } 
      }}
    >
      <DialogTitle sx={{ pr: 6, fontWeight: 'bold' }}>
        {taskTitle}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'center' }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2">{taskDueDate}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'center' }}>
            <PersonIcon fontSize="small" color="action" />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.875rem',
                  bgcolor: '#1976d2',
                  mr: 1
                }}
              >
                {getInitials(assigneeName)}
              </Avatar>
              <Typography variant="body2">{assigneeName}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PriorityHighIcon fontSize="small" color="action" />
            <Chip 
              label={taskPriority} 
              size="small" 
              sx={{ 
                bgcolor: priorityColors[taskPriority] || '#777', 
                color: 'white'
              }} 
            />
            <Chip 
              label={statusConfig[taskStatus]?.text || 'Unknown'} 
              size="small" 
              sx={{ 
                bgcolor: statusConfig[taskStatus]?.color || '#eee',
                ml: 1 
              }} 
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Description
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
          {taskDescription}
        </Typography>
        
        {task.comments && task.comments.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', mt: 3 }}>
              Comments ({task.comments.length})
            </Typography>
            {task.comments.map((comment, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Avatar 
                    sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}
                  >
                    {comment.userName ? comment.userName.charAt(0) : '?'}
                  </Avatar>
                  <Typography variant="body2" fontWeight="bold">
                    {comment.userName || 'Unknown User'}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ pl: 4 }}
                >
                  {comment.text}
                </Typography>
              </Box>
            ))}
          </>
        )}
        
        <TextField
          label="Add a comment"
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          margin="normal"
          placeholder="Type your comment here..."
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetail;
