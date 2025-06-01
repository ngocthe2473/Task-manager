import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
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
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      role: 'Senior Developer'
    },
    notifications: {
      email: true,
      push: true,
      desktop: false,
      taskUpdates: true,
      mentions: true,
      projectNews: false
    },
    appearance: {
      darkMode: false,
      compactView: false,
      showAvatars: true
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      onlineStatus: true
    }
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleProfileChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
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
        <SettingsSubtitle>
          Manage your account settings and preferences
        </SettingsSubtitle>
      </SettingsHeader>

      <StyledTabs value={currentTab} onChange={handleTabChange}>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            icon={tab.icon}
            label={tab.label}
            iconPosition="start"
          />
        ))}
      </StyledTabs>

      {/* Profile Tab */}
      <TabPanel value={currentTab} index={0}>
        <ProfileCard>
          <CardContent>
            <ProfileHeader>
              <AvatarUpload>
                <LargeAvatar>
                  {settings.profile.name.charAt(0)}
                </LargeAvatar>
                <AvatarButton size="small">
                  <PhotoCameraIcon sx={{ fontSize: 16 }} />
                </AvatarButton>
              </AvatarUpload>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                  {settings.profile.name}
                </Typography>
                <StatusChip label="Active" size="small" />
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Member since January 2024
                </Typography>
              </Box>
            </ProfileHeader>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  value={settings.profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  InputProps={{
                    startAdornment: <AccountIcon sx={{ mr: 1, color: '#666' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Email"
                  value={settings.profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  type="email"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Phone"
                  value={settings.profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: '#666' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Department"
                  value={settings.profile.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </ProfileCard>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={currentTab} index={1}>
        <SettingsSection>
          <SectionTitle>
            <NotificationsIcon />
            Email Notifications
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Task Updates</SettingTitle>
              <SettingDescription>
                Get notified when tasks are updated or commented on
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.notifications.taskUpdates}
              onChange={(e) => handleSettingChange('notifications', 'taskUpdates', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Mentions</SettingTitle>
              <SettingDescription>
                Get notified when someone mentions you in a comment
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.notifications.mentions}
              onChange={(e) => handleSettingChange('notifications', 'mentions', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Project News</SettingTitle>
              <SettingDescription>
                Get updates about project milestones and announcements
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.notifications.projectNews}
              onChange={(e) => handleSettingChange('notifications', 'projectNews', e.target.checked)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>
            Push Notifications
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Browser Notifications</SettingTitle>
              <SettingDescription>
                Show notifications in your browser
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.notifications.push}
              onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Desktop Notifications</SettingTitle>
              <SettingDescription>
                Show system notifications on your desktop
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.notifications.desktop}
              onChange={(e) => handleSettingChange('notifications', 'desktop', e.target.checked)}
            />
          </SettingItem>
        </SettingsSection>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={currentTab} index={2}>
        <SettingsSection>
          <SectionTitle>
            <PaletteIcon />
            Display
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Dark Mode</SettingTitle>
              <SettingDescription>
                Use dark theme for better viewing in low light
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.appearance.darkMode}
              onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Compact View</SettingTitle>
              <SettingDescription>
                Show more content in less space
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.appearance.compactView}
              onChange={(e) => handleSettingChange('appearance', 'compactView', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Show Avatars</SettingTitle>
              <SettingDescription>
                Display user avatars in task lists and comments
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.appearance.showAvatars}
              onChange={(e) => handleSettingChange('appearance', 'showAvatars', e.target.checked)}
            />
          </SettingItem>
        </SettingsSection>
      </TabPanel>

      {/* Privacy Tab */}
      <TabPanel value={currentTab} index={3}>
        <SettingsSection>
          <SectionTitle>
            <ShieldIcon />
            Privacy & Security
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Profile Visibility</SettingTitle>
              <SettingDescription>
                Allow other team members to view your profile
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.privacy.profileVisible}
              onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Activity Status</SettingTitle>
              <SettingDescription>
                Show your activity status to other team members
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.privacy.activityVisible}
              onChange={(e) => handleSettingChange('privacy', 'activityVisible', e.target.checked)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Online Status</SettingTitle>
              <SettingDescription>
                Show when you're online and available
              </SettingDescription>
            </SettingLabel>
            <StyledSwitch
              checked={settings.privacy.onlineStatus}
              onChange={(e) => handleSettingChange('privacy', 'onlineStatus', e.target.checked)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>
            <KeyIcon />
            Data & Security
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Data Export</SettingTitle>
              <SettingDescription>
                Download a copy of your data
              </SettingDescription>
            </SettingLabel>
            <Button variant="outlined" size="small">
              Export Data
            </Button>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Account Backup</SettingTitle>
              <SettingDescription>
                Create a backup of your account settings
              </SettingDescription>
            </SettingLabel>
            <Button variant="outlined" size="small">
              Create Backup
            </Button>
          </SettingItem>
        </SettingsSection>
      </TabPanel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <SaveButton onClick={handleSave}>
          Save Changes
        </SaveButton>
      </Box>
    </SettingsContainer>
  );
};

export default Settings;
