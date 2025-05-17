import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    mentions: true,
    newComments: true,
    dueDateReminders: true
  });
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'admin',
    theme: 'light',
    language: 'en'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNotificationChange = (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [event.target.name]: event.target.checked
    });
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'vi', label: 'Tiếng Việt' },
  ];

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Settings
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab icon={<AccountCircleIcon />} label="Profile" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<PaletteIcon />} label="Appearance" />
        </Tabs>
      </Paper>

      {/* Profile Settings */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Change Photo
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={user.name}
                onChange={handleUserChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={user.email}
                onChange={handleUserChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="language"
                  name="language"
                  value={user.language}
                  onChange={handleUserChange}
                  label="Language"
                >
                  {languages.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={user.role}
                  onChange={handleUserChange}
                  label="Role"
                  disabled
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" color="primary">
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Notification Settings */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Email Notifications" 
                secondary="Receive updates via email" 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Task Reminders" 
                secondary="Get reminders about your tasks" 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  name="taskReminders"
                  checked={notificationSettings.taskReminders}
                  onChange={handleNotificationChange}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Mentions" 
                secondary="Notify when someone mentions you" 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  name="mentions"
                  checked={notificationSettings.mentions}
                  onChange={handleNotificationChange}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="New Comments" 
                secondary="Get notified about new comments on your tasks" 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  name="newComments"
                  checked={notificationSettings.newComments}
                  onChange={handleNotificationChange}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Due Date Reminders" 
                secondary="Get reminders for approaching due dates" 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  name="dueDateReminders"
                  checked={notificationSettings.dueDateReminders}
                  onChange={handleNotificationChange}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="primary">
              Save Preferences
            </Button>
          </Box>
        </Paper>
      )}

      {/* Security Settings */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ height: '100%' }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <FormControlLabel 
                control={<Switch color="primary" />} 
                label="Enable Two-Factor Authentication" 
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" color="primary">
                  Update Security Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Appearance Settings */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appearance Settings
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Theme
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Paper
                  elevation={user.theme === 'light' ? 8 : 1}
                  onClick={() => setUser({...user, theme: 'light'})}
                  sx={{ 
                    width: 100, 
                    height: 80, 
                    bgcolor: '#ffffff', 
                    cursor: 'pointer',
                    border: user.theme === 'light' ? '2px solid #1976d2' : 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography>Light</Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper
                  elevation={user.theme === 'dark' ? 8 : 1}
                  onClick={() => setUser({...user, theme: 'dark'})}
                  sx={{ 
                    width: 100, 
                    height: 80, 
                    bgcolor: '#333333', 
                    color: '#ffffff', 
                    cursor: 'pointer',
                    border: user.theme === 'dark' ? '2px solid #1976d2' : 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography>Dark</Typography>
                </Paper>
              </Grid>
            </Grid>
          </FormControl>
          
          <Divider sx={{ my: 2 }} />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Color Accent
            </Typography>
            <Grid container spacing={1}>
              {['#1976d2', '#e91e63', '#4caf50', '#ff9800', '#9c27b0'].map((color) => (
                <Grid item key={color}>
                  <Box
                    onClick={() => console.log('Color selected:', color)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: '2px solid white',
                      boxShadow: '0 0 0 1px #ddd',
                      '&:hover': {
                        boxShadow: '0 0 0 2px #aaa',
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="primary">
              Save Appearance
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;
