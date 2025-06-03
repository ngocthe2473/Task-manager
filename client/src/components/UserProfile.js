import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Styled Components
const ProfileCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const UserProfile = () => {  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [userStats, setUserStats] = useState({
    tasksCompleted: 0,
    projectsJoined: 0,
    achievements: 0,
    skillLevel: 0,
    teamRating: 0,
    streakDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Fetch real user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // TODO: Replace with actual API calls to get user statistics
        // For now, initialize with empty stats
        setUserStats({
          tasksCompleted: 0,
          projectsJoined: 0,
          achievements: 0,
          skillLevel: 0,
          teamRating: 0,
          streakDays: 0,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 4,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
      minHeight: '100vh',
    }}>
      {/* Profile Header with Epic Design */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ProfileCard sx={{ p: 3, position: 'relative' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                position: 'absolute', 
                top: -50, 
                left: 'calc(50% - 50px)',
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
              src="/static/images/avatar/1.jpg"
              alt="User Avatar"
            />
            
            <Box sx={{ pt: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                John Doe
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Full Stack Developer
              </Typography>
              
              <Chip label="Pro Member" color="primary" sx={{ mb: 2 }} />
              
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleEditToggle}
                sx={{ 
                  borderRadius: '20px',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
            
            {/* User Stats */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats.tasksCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tasks Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats.projectsJoined}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects Joined
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats.achievements}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Achievements
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Progress Bars */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Skill Level
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={userStats.skillLevel} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.grey[300], 0.5),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                Team Rating
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={userStats.teamRating * 20} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.grey[300], 0.5),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                  },
                }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                Streak Days
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={userStats.streakDays * 4.34} // Max 30 days streak
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.grey[300], 0.5),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
                  },
                }}
              />
            </Box>
          </ProfileCard>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: '16px', position: 'relative' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Profile Details
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 120,
                  fontWeight: 500,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Account" />
              <Tab label="Settings" />
            </Tabs>
            
            {/* Tab Content */}
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Fade in timeout={300}>
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Welcome to your profile overview, John! Here you can manage your personal information, view your activity stats, and customize your account settings.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                            Personal Information
                          </Typography>
                          
                          <Divider sx={{ mb: 1 }} />
                          
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <PhotoCameraIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Profile Photo" secondary="Uploaded on Jan 20, 2023" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <EmailIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Email Address" secondary="john.doe@example.com" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <PhoneIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Phone Number" secondary="+1 (555) 123-4567" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <LocationIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Location" secondary="San Francisco, CA" />
                            </ListItem>
                          </List>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                            Account Settings
                          </Typography>
                          
                          <Divider sx={{ mb: 1 }} />
                          
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <WorkIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Occupation" secondary="Software Engineer" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <SchoolIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Education" secondary="B.Sc. in Computer Science" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <StarIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Skill Level" secondary="Expert" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <TrendingUpIcon color="action" />
                              </ListItemIcon>
                              <ListItemText primary="Career Progress" secondary="75% to next level" />
                            </ListItem>
                          </List>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}
              
              {tabValue === 1 && (
                <Fade in timeout={300}>
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Manage your account settings and preferences. Ensure your information is up-to-date for better service.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          variant="outlined"
                          value="John Doe"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Email Address"
                          variant="outlined"
                          value="john.doe@example.com"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Phone Number"
                          variant="outlined"
                          value="+1 (555) 123-4567"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Location"
                          variant="outlined"
                          value="San Francisco, CA"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          variant="outlined"
                          type="password"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="New Password"
                          variant="outlined"
                          type="password"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          variant="outlined"
                          type="password"
                          InputProps={{
                            readOnly: !isEditing,
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Button 
                      variant="contained" 
                      onClick={handleEditToggle}
                      sx={{ 
                        borderRadius: '20px',
                        px: 3,
                        py: 1.5,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        },
                      }}
                    >
                      {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </Box>
                </Fade>
              )}
              
              {tabValue === 2 && (
                <Fade in timeout={300}>
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Customize your profile settings and preferences. You can change your password, manage notifications, and more.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Receive Email Notifications"
                        />
                        <FormControlLabel
                          control={<Switch checked={false} color="primary" />}
                          label="Show Profile to Public"
                        />
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Enable Two-Factor Authentication"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Button 
                          variant="outlined" 
                          color="error"
                          size="small"
                          sx={{ borderRadius: '20px' }}
                        >
                          Delete Account
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;