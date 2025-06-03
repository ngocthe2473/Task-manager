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
import ProjectManagement from './components/ProjectManagement';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import Reports from './components/Reports';
import ActivityLog from './components/ActivityLog';
import TeamManagement from './components/TeamManagement';
import AddTaskDialog from './components/AddTaskDialog';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleNewTask = () => {
    setAddTaskOpen(true);
  };

  const handleTaskSave = (newTask) => {
    // Refresh data or handle the new task
    console.log('New task created:', newTask);
    // You might want to emit an event or callback to refresh data
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

              {/* Private Routes */}              <Route path="/" element={
                <PrivateRoute>
                  <>
                    <Navbar onNewTask={handleNewTask} />
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
              } />              <Route path="/tasks" element={
                <PrivateRoute>
                  <>
                    <Navbar onNewTask={handleNewTask} />
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
              } />              <Route path="/settings" element={
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
              } />              <Route path="/projects" element={
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
                        <ProjectManagement />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/admin" element={
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
                        <AdminDashboard />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/profile" element={
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
                        <Profile />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/reports" element={
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
                        <Reports />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/activity" element={
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
                        <ActivityLog />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />

              <Route path="/team-management" element={
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
                        <TeamManagement />
                      </Box>
                    </Box>
                  </>
                </PrivateRoute>
              } />
            </Routes>            {selectedTask && (
              <TaskDetail
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                task={selectedTask}
              />
            )}

            <AddTaskDialog
              open={addTaskOpen}
              onClose={() => setAddTaskOpen(false)}
              onSave={handleTaskSave}
            />
          </Box>
        </Router>
      </LocalizationProvider>
    </AuthProvider>
  );
};

export default App;
