import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import Teams from './components/Teams';
import Settings from './components/Settings';
import TaskDetail from './components/TaskDetail';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <CssBaseline />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <>
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
                        <Dashboard />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/tasks" element={
                <PrivateRoute>
                  <>
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
                        <TaskBoard onTaskClick={handleTaskClick} />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/calendar" element={
                <PrivateRoute>
                  <>
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
                        <Calendar />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/teams" element={
                <PrivateRoute>
                  <>
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
                        <Teams />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <>
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
                        <Settings />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />
            </Routes>

            {selectedTask && (
              <TaskDetail
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                task={selectedTask}
              />
            )}
          </Box>
        </Router>
      </LocalizationProvider>
    </AuthProvider>
  );
};

export default App;
