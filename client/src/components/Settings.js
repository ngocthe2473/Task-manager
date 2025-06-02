import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  AccountCircle as AccountIcon,
  Phone as PhoneIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  Backup as BackupIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Modern minimalist styled components
const SettingsContainer = styled(Container)(({ theme }) => ({
  padding: '32px 24px',
  maxWidth: '1000px',
}));

const SettingsHeader = styled(Box)(({ theme }) => ({
  marginBottom: '32px',
}));

const SettingsTitle = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontWeight: 700,
  color: '#333',
  marginBottom: '8px',
  letterSpacing: '-0.5px',
}));

const SettingsSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#666',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e0e0e0',
  marginBottom: '32px',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 600,
    minHeight: '48px',
    color: '#666',
    '&.Mui-selected': {
      color: '#2196f3',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#2196f3',
    height: '3px',
    borderRadius: '2px',
  },
}));

const SettingsSection = styled(Paper)(({ theme }) => ({
  padding: '24px',
  marginBottom: '24px',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

const SettingItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0',
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const SettingLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}));

const SettingTitle = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333',
}));

const SettingDescription = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  color: '#666',
  lineHeight: 1.4,
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  marginBottom: '24px',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '24px',
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  fontSize: '32px',
  fontWeight: 600,
  backgroundColor: '#2196f3',
}));

const AvatarUpload = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
}));

const AvatarButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: -4,
  right: -4,
  backgroundColor: '#2196f3',
  color: '#ffffff',
  width: 32,
  height: 32,
  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
  '&:hover': {
    backgroundColor: '#1976d2',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2196f3',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2196f3',
    },
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#2196f3',
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    backgroundColor: '#1976d2',
    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)',
  },
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#2196f3',
    '& + .MuiSwitch-track': {
      backgroundColor: '#2196f3',
    },
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#e8f5e8',
  color: '#2e7d32',
  fontWeight: 600,
  fontSize: '12px',
}));

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { userInfo, updateUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: ''
  });

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        department: userInfo.department || '',
        role: userInfo.role || ''
      });
    }
  }, [userInfo]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await updateUser(formData);
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update settings',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderProfileTab = () => (
    <Box>
      <ProfileCard>
        <CardContent>
          <ProfileHeader>
            <AvatarUpload>
              <LargeAvatar>{userInfo?.name?.charAt(0) || 'U'}</LargeAvatar>
              <AvatarButton>
                <PhotoCameraIcon fontSize="small" />
              </AvatarButton>
            </AvatarUpload>
            <Box>
              <Typography variant="h6">{userInfo?.name}</Typography>
              <StatusChip
                label="Active"
                icon={<span className="dot" />}
                size="small"
              />
            </Box>
          </ProfileHeader>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton
              variant="contained"
              onClick={handleSave}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </SaveButton>
          </Box>
        </CardContent>
      </ProfileCard>
    </Box>
  );

  const TabPanel = ({ children, value, index }) => (
    <Box hidden={value !== index}>
      {value === index && children}
    </Box>
  );

  const tabs = [
    { label: 'Profile', icon: <PersonIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
    { label: 'Appearance', icon: <PaletteIcon /> },
    { label: 'Privacy', icon: <SecurityIcon /> }
  ];

  return (
    <SettingsContainer>
      <SettingsHeader>
        <SettingsTitle>Settings</SettingsTitle>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </SettingsHeader>

      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: '64px',
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            {renderProfileTab()}
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <Typography>Notification settings coming soon...</Typography>
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <Typography>Appearance settings coming soon...</Typography>
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <Typography>Privacy settings coming soon...</Typography>
          </TabPanel>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SettingsContainer>
  );
};

export default Settings;
