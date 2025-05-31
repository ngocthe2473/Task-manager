import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Assessment,
  Group,
  Task,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectStats, setProjectStats] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    team: '',
    status: 'planning',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        // Fetch stats for each project
        data.forEach(project => fetchProjectStats(project._id));
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchProjectStats = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjectStats(prev => ({ ...prev, [projectId]: data }));
      }
    } catch (err) {
      console.error('Error fetching project stats:', err);
    }
  };

  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        name: project.name,
        description: project.description || '',
        team: project.team?._id || '',
        status: project.status,
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        name: '',
        description: '',
        team: '',
        status: 'planning',
        startDate: null,
        endDate: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
  };

  const handleFormChange = (field, value) => {
    setProjectForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
        },
        body: JSON.stringify(projectForm),
      });

      if (response.ok) {
        setAlert({
          open: true,
          message: `Project đã được ${editingProject ? 'cập nhật' : 'tạo'} thành công!`,
          severity: 'success'
        });
        fetchProjects();
        handleCloseDialog();
      } else {
        throw new Error('Có lỗi xảy ra');
      }
    } catch (err) {
      setAlert({
        open: true,
        message: 'Có lỗi xảy ra khi lưu project',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa project này?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo')) || {}).token}`
          }
        });

        if (response.ok) {
          setAlert({
            open: true,
            message: 'Project đã được xóa thành công!',
            severity: 'success'
          });
          fetchProjects();
        }
      } catch (err) {
        setAlert({
          open: true,
          message: 'Có lỗi xảy ra khi xóa project',
          severity: 'error'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Đang lập kế hoạch';
      case 'in_progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {alert.open && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý Project
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Tạo Project Mới
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => {
          const stats = projectStats[project._id] || {};
          
          return (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {project.name}
                    </Typography>
                    <Chip
                      label={getStatusText(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description || 'Không có mô tả'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {project.team?.name || 'Chưa gán team'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Task sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {stats.totalTasks || 0} tasks
                    </Typography>
                  </Box>

                  {stats.progress !== undefined && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Tiến độ</Typography>
                        <Typography variant="body2">{stats.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={stats.progress} />
                    </Box>
                  )}

                  {stats.totalTasks > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={`Todo: ${stats.todoTasks}`} size="small" color="error" />
                      <Chip label={`Doing: ${stats.inProgressTasks}`} size="small" color="warning" />
                      <Chip label={`Done: ${stats.doneTasks}`} size="small" color="success" />
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <IconButton onClick={() => handleOpenDialog(project)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(project._id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog tạo/sửa project */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Sửa Project' : 'Tạo Project Mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên Project"
            value={projectForm.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Mô tả"
            value={projectForm.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Team</InputLabel>
            <Select
              value={projectForm.team}
              label="Team"
              onChange={(e) => handleFormChange('team', e.target.value)}
            >
              {teams.map((team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={projectForm.status}
              label="Trạng thái"
              onChange={(e) => handleFormChange('status', e.target.value)}
            >
              <MenuItem value="planning">Đang lập kế hoạch</MenuItem>
              <MenuItem value="in_progress">Đang thực hiện</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
            </Select>
          </FormControl>

          <DatePicker
            label="Ngày bắt đầu"
            value={projectForm.startDate}
            onChange={(date) => handleFormChange('startDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />

          <DatePicker
            label="Ngày kết thúc"
            value={projectForm.endDate}
            onChange={(date) => handleFormChange('endDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProject ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;
