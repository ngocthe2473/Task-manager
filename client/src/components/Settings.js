import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Paper, Tabs, Tab, Typography, TextField, Button, Avatar, FormControl,
  Select, MenuItem, Switch, List, ListItem, ListItemIcon, ListItemText,
  ListItemSecondaryAction, Grid, InputAdornment, IconButton, Divider,
  FormControlLabel
} from '@mui/material';
import {
  Person, Notifications, Security, Palette, Lock as LockIcon,
  Visibility, VisibilityOff, Notifications as NotificationsIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { userInfo, updateUser } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState({
    name: '', email: '', language: 'English', role: '', avatar: '', theme: 'light'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    dueDateReminders: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo) {
      setUserData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        language: userInfo.language || 'English',
        role: userInfo.role || 'Admin',
        avatar: userInfo.avatar || '',
        theme: userInfo.theme || 'light'
      });
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUserData(data);
        updateUser(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    };

    fetchUserData();
  }, [userInfo, updateUser]);

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleChangePhoto = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserData({ ...userData, avatar: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      updateUser(data);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Palette />} label="Appearance" />
        </Tabs>

        {/* Tab 1 - Profile */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', mb: 4 }}>
              <Avatar src={userData.avatar} sx={{ width: 80, height: 80, mr: 2 }} />
              <Box>
                <Typography variant="h6">{userData.name}</Typography>
                <Typography variant="body2">{userData.email} • {userData.role}</Typography>
                <Button variant="outlined" size="small" onClick={handleChangePhoto}>Change Photo</Button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Full Name" fullWidth name="name" value={userData.name} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Email Address" fullWidth name="email" value={userData.email} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Select name="language" value={userData.language} onChange={handleInputChange}>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Tiếng Việt">Tiếng Việt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Role" fullWidth name="role" value={userData.role} disabled />
              </Grid>
            </Grid>

            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mt: 2 }}>Profile updated successfully!</Typography>}

            <Button variant="contained" sx={{ mt: 3 }} onClick={handleSaveChanges} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}

        {/* Tab 2 - Notifications */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <List>
              <ListItem>
                <ListItemIcon><NotificationsIcon /></ListItemIcon>
                <ListItemText primary="Due Date Reminders" secondary="Get reminders for approaching due dates" />
                <ListItemSecondaryAction>
                  <Switch edge="end" name="dueDateReminders" checked={notificationSettings.dueDateReminders} onChange={handleNotificationChange} />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained">Save Preferences</Button>
            </Box>
          </Box>
        )}

        {/* Tab 3 - Security */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Current Password" type={showPassword ? "text" : "password"}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="New Password" type={showPassword ? "text" : "password"}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Confirm New Password" type={showPassword ? "text" : "password"}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel control={<Switch />} label="Enable Two-Factor Authentication" />
                <Typography variant="body2" color="textSecondary">
                  Add an extra layer of security to your account.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained">Update Security Settings</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 4 - Appearance */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Appearance Settings</Typography>
            <Grid container spacing={2}>
              {['light', 'dark'].map((theme) => (
                <Grid item key={theme}>
                  <Paper
                    elevation={userData.theme === theme ? 8 : 1}
                    onClick={() => setUserData({ ...userData, theme })}
                    sx={{
                      width: 100, height: 80, bgcolor: theme === 'light' ? '#fff' : '#333',
                      color: theme === 'light' ? '#000' : '#fff',
                      border: userData.theme === theme ? '2px solid #1976d2' : 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Typography>{theme.charAt(0).toUpperCase() + theme.slice(1)}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1">Color Accent</Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {['#1976d2', '#e91e63', '#4caf50', '#ff9800', '#9c27b0'].map((color) => (
                <Grid item key={color}>
                  <Box
                    onClick={() => console.log('Color selected:', color)}
                    sx={{
                      width: 40, height: 40, bgcolor: color, borderRadius: '50%',
                      border: '2px solid white', boxShadow: '0 0 0 1px #ddd',
                      '&:hover': { boxShadow: '0 0 0 2px #aaa' }, cursor: 'pointer'
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained">Save Appearance</Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;
