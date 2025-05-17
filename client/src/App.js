import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Tabs, Tab } from '@mui/material';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import TableView from './components/TableView';
import Calendar from './components/Calendar';
import Teams from './components/Teams';
import Settings from './components/Settings';
import TaskDetail from './components/TaskDetail';

const App = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'table', or 'calendar'

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleViewChange = (event, newValue) => {
    setViewMode(newValue);
  };

  // Function to render the appropriate task view
  const renderTaskView = () => {
    switch (viewMode) {
      case 'table':
        return <TableView onTaskClick={handleTaskClick} />;
      case 'calendar':
        return <Calendar />;
      case 'kanban':
      default:
        return <TaskBoard onTaskClick={handleTaskClick} />;
    }
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
                element={
                  <Box>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                      <Tabs value={viewMode} onChange={handleViewChange} aria-label="task view options">
                        <Tab label="Main table" value="table" />
                        <Tab label="Kanban" value="kanban" />
                        <Tab label="Calendar" value="calendar" />
                      </Tabs>
                    </Box>
                    {renderTaskView()}
                  </Box>
                }
              />
              <Route path="/teams" element={<Teams />} />
              <Route path="/settings" element={<Settings />} />
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
