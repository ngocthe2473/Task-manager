import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  InputBase,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Modern minimalist styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: '#333333',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  borderBottom: '1px solid #e0e0e0',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
  minHeight: '64px',
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}));

const CenterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  flex: 1,
  maxWidth: '400px',
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  color: '#666',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  color: '#2196f3',
  letterSpacing: '-0.5px',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: '24px',
  padding: '8px 16px',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  '&:focus-within': {
    backgroundColor: '#ffffff',
    border: '1px solid #2196f3',
    boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)',
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: '8px',
  flex: 1,
  color: '#333',
  '& .MuiInputBase-input': {
    padding: '4px 0',
    fontSize: '14px',
    '&::placeholder': {
      color: '#999',
      opacity: 1,
    },
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  marginLeft: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const NewTaskButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#2196f3',
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '24px',
  padding: '8px 20px',
  fontWeight: 600,
  fontSize: '14px',
  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    backgroundColor: '#1976d2',
    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)',
  },
}));

const ModernIconButton = styled(IconButton)(({ theme }) => ({
  color: '#666',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: '#333',
  },
}));

const Navbar = ({ onMenuToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Project Manager',
    avatar: null
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    // Add logout logic here
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LeftSection>
          <MenuButton
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
          >
            <MenuIcon />
          </MenuButton>
          <Logo variant="h6">
            TaskFlow Pro
          </Logo>
        </LeftSection>

        <CenterSection>
          <SearchContainer>
            <SearchIcon sx={{ color: '#999' }} />
            <SearchInput
              placeholder="Search tasks, projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </CenterSection>

        <RightSection>
          <NewTaskButton
            startIcon={<AddIcon />}
            variant="contained"
          >
            New Task
          </NewTaskButton>

          <ModernIconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </ModernIconButton>
          
          <ModernIconButton>
            <MessageIcon />
          </ModernIconButton>

          <UserSection onClick={handleUserMenuOpen}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <UserInfo>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                {user?.role || 'Member'}
              </Typography>
            </UserInfo>
          </UserSection>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                minWidth: '200px',
              },
            }}
          >
            <MenuItem onClick={handleUserMenuClose}>
              <SettingsIcon sx={{ mr: 2, color: '#666' }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2, color: '#666' }} />
              Logout
            </MenuItem>
          </Menu>
        </RightSection>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;
