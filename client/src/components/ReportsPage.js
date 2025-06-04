import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent,
  Chip
} from '@mui/material';
import { getReportStats } from '../services/apiService';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getReportStats();
        setStats(data);
      } catch (err) {
        setError('Failed to fetch report stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#2c3e50' }}>
        📊 Reports & Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Task Statistics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: 250, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#34495e' }}>
                📋 Task Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Total Tasks:</Typography>
                  <Chip label={stats?.totalTasks || 0} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Completed:</Typography>
                  <Chip label={stats?.completedTasks || 0} color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">In Progress:</Typography>
                  <Chip label={stats?.inprogressTasks || 0} color="warning" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">To Do:</Typography>
                  <Chip label={stats?.todoTasks || 0} color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project & Team Statistics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: 250, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#34495e' }}>
                🏢 Organization Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Total Projects:</Typography>
                  <Chip label={stats?.totalProjects || 0} color="secondary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Total Teams:</Typography>
                  <Chip label={stats?.totalTeams || 0} color="secondary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Total Users:</Typography>
                  <Chip label={stats?.totalUsers || 0} color="secondary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#34495e' }}>
                📈 Task Completion Rate
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {stats?.totalTasks > 0 && (
                  <>
                    <Typography variant="body1">
                      Completion Rate: {((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body1">
                      In Progress: {((stats.inprogressTasks / stats.totalTasks) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body1">
                      Pending: {((stats.todoTasks / stats.totalTasks) * 100).toFixed(1)}%
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
