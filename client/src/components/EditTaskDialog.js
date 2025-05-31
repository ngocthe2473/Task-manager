import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Box
} from '@mui/material';

const EditTaskDialog = ({ open, onClose, onSave, task, users }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignee: ''
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || '',
        assignee: task.assignee || ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth margin="dense" />
        <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth margin="dense" multiline rows={3} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status} label="Status" onChange={handleChange}>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={form.priority} label="Priority" onChange={handleChange}>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField label="Due Date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Assignee</InputLabel>
            <Select name="assignee" value={form.assignee} label="Assignee" onChange={handleChange}>
              {(Array.isArray(users) ? users : []).map(user => (
                <MenuItem key={user._id || user.id} value={user._id || user.id}>{user.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog;
