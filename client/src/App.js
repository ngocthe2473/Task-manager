import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import TaskDetail from './components/TaskDetail';
import Teams from './components/Teams';
import Settings from './components/Settings';
import Calendar from './components/Calendar';
import ActivityLog from './components/ActivityLog';

const App = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        <Navbar />
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <Sidebar />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 0, 
              overflowY: 'auto',
              backgroundColor: '#f7f8fa'
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route 
                path="/tasks" 
                element={<TaskBoard onTaskClick={handleTaskClick} />}
              />
              <Route path="/teams" element={<Teams />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/activity" element={<ActivityLog />} />
            </Routes>
          </Box>
        </Box>
        {selectedTask && (
          <TaskDetail
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            task={selectedTask}
          />
        )}
      </Box>
    </Router>
  );
};

export default App;
