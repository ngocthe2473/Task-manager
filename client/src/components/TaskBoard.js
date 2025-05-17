import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import TaskCard from './TaskCard';
import { getAllTasks } from '../services/fakeDatabaseService';

const TaskBoard = ({ onTaskClick }) => {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await getAllTasks();
        
        // Group tasks by status
        const todo = tasks.filter(task => task.status === 'todo');
        const inProgress = tasks.filter(task => task.status === 'inprogress');
        const review = tasks.filter(task => task.status === 'review');
        const done = tasks.filter(task => task.status === 'done');
        
        setColumns([
          {
            id: 'todo',
            title: 'To Do',
            color: '#e2ebf6',
            tasks: todo
          },
          {
            id: 'inprogress',
            title: 'In Progress',
            color: '#fff8dd',
            tasks: inProgress
          },
          {
            id: 'review',
            title: 'Review',
            color: '#defbe6',
            tasks: review
          },
          {
            id: 'done',
            title: 'Done',
            color: '#edf5ff',
            tasks: done
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2, overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 2, minWidth: 'fit-content' }}>
        {columns.map(column => (
          <Paper
            key={column.id}
            sx={{
              width: 300,
              minHeight: 'calc(100vh - 180px)',
              backgroundColor: column.color,
              padding: 2
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              {column.title} ({column.tasks.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {column.tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default TaskBoard;
