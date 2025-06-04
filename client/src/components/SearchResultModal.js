import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  Group as TeamIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600, md: 700 },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  overflow: 'auto',
};

const SearchResultModal = ({ open, onClose, item, type }) => {
  if (!item) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return '#4caf50';
      case 'inprogress': return '#2196f3';
      case 'review': return '#ff9800';
      case 'todo': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusProgress = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return 100;
      case 'review': return 80;
      case 'inprogress': return 50;
      case 'todo': return 20;
      default: return 0;
    }
  };

  const renderTaskDetails = () => (
    <Box>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TaskIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              {item.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Status and Priority */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip
            label={item.status || 'Unknown'}
            sx={{
              backgroundColor: getStatusColor(item.status),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          <Chip
            icon={<FlagIcon />}
            label={`${item.priority || 'Medium'} Priority`}
            sx={{
              backgroundColor: getPriorityColor(item.priority),
              color: 'white',
            }}
          />
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Progress: {getStatusProgress(item.status)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={getStatusProgress(item.status)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(item.status),
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Description */}
          {item.description && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>                  <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Task Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Task Details
                </Typography>
                <Stack spacing={2}>
                  {/* Due Date */}
                  {item.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Due Date:</strong> {format(new Date(item.dueDate), 'dd MMM yyyy', { locale: vi })}
                      </Typography>
                    </Box>
                  )}

                  {/* Created Date */}
                  {item.createdAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Created:</strong> {format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: vi })}
                      </Typography>
                    </Box>
                  )}

                  {/* Updated Date */}
                  {item.updatedAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Updated:</strong> {format(new Date(item.updatedAt), 'dd MMM yyyy HH:mm', { locale: vi })}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* People */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  People
                </Typography>
                <Stack spacing={2}>
                  {/* Assignee */}
                  {item.assignee && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {item.assignee.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.assignee.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Assignee
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Creator */}
                  {item.creator && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {item.creator.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.creator.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Creator
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Info */}
          {item.project && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ProjectIcon />
                    Project
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.project.name}
                  </Typography>
                  {item.project.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {item.project.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Actions */}
      <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" onClick={() => {
          // Navigate to task detail page
          window.open(`/tasks/${item._id}`, '_blank');
        }}>
          View Full Details
        </Button>
      </Box>
    </Box>
  );

  const renderProjectDetails = () => (
    <Box>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProjectIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              {item.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Status */}
        <Chip
          label={item.status || 'Active'}
          color={item.status === 'completed' ? 'success' : 'primary'}
          sx={{ mb: 2 }}
        />
      </Box>

      <Divider />

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Description */}
          {item.description && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Project Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Project Details
                </Typography>
                <Stack spacing={2}>
                  {/* Start Date */}
                  {item.startDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Start Date:</strong> {format(new Date(item.startDate), 'dd MMM yyyy', { locale: vi })}
                      </Typography>
                    </Box>
                  )}

                  {/* End Date */}
                  {item.endDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>End Date:</strong> {format(new Date(item.endDate), 'dd MMM yyyy', { locale: vi })}
                      </Typography>
                    </Box>
                  )}

                  {/* Created Date */}
                  {item.createdAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Created:</strong> {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: vi })}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Info */}
          {item.team && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TeamIcon />
                    Team
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.team.name}
                  </Typography>
                  {item.team.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {item.team.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Actions */}
      <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" onClick={() => {
          // Navigate to project detail page
          window.open(`/projects/${item._id}`, '_blank');
        }}>
          View Project
        </Button>
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="search-result-modal"
      aria-describedby="search-result-description"
    >
      <Box sx={modalStyle}>
        {type === 'task' && renderTaskDetails()}
        {type === 'project' && renderProjectDetails()}
      </Box>
    </Modal>
  );
};

export default SearchResultModal;
