import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Box, Typography, Avatar, Chip, Divider
} from '@mui/material';
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <TextField
          name="title"
          value={editedTask.title}
          onChange={handleChange}
          fullWidth
          variant="standard"
          placeholder="Task Title"
          InputProps={{ style: { fontSize: '1.5rem', fontWeight: 'bold' } }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <TextField
            name="description"
            label="Description"
            value={editedTask.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            placeholder="Add a more detailed description..."
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon color="action" />
            <TextField
              name="due"
              label="Due Date"
              type="date"
              value={editedTask.due}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PriorityHighIcon color="action" />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={editedTask.priority}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="action" />
            <TextField
              name="assignee"
              label="Assignee"
              value={editedTask.assignee}
              onChange={handleChange}
              placeholder="Assign to..."
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon /> Comments
        </Typography>
        
        <Box sx={{ mt: 2, mb: 3 }}>
          {editedTask.comments.map(comment => (
            <Box key={comment.id} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                  {comment.author.charAt(0)}
                </Avatar>
                <Typography variant="subtitle2">{comment.author}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(comment.date).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2">{comment.text}</Typography>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              fullWidth
              multiline
              rows={2}
            />
            <Button onClick={handleAddComment} variant="contained">Post</Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onClose}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetail;
