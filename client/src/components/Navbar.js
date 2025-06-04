import React, { useState, useContext, useEffect } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { searchTasks, searchProjectsByName } from '../services/apiService';

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

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo).user);
    }
  }, []);

  // Search handler
  useEffect(() => {
    if (!searchValue) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    // Gọi song song cả task và project
    Promise.all([
      searchTasks(searchValue, 5),
      searchProjectsByName(searchValue, 5)
    ]).then(([tasks, projects]) => {
      const results = [];
      if (tasks && tasks.length > 0) {
        results.push(...tasks.map(t => ({ type: 'task', id: t._id, title: t.title })));
      }
      if (projects && projects.length > 0) {
        results.push(...projects.map(p => ({ type: 'project', id: p._id, title: p.name })));
      }
      setSearchResults(results);
      setSearchOpen(true);
    }).finally(() => setSearchLoading(false));
  }, [searchValue]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleResultClick = (item) => {
    setSearchOpen(false);
    setSearchValue('');
    if (item.type === 'task') {
      navigate(`/tasks/${item.id}`);
    } else if (item.type === 'project') {
      navigate(`/projects/${item.id}`);
    }
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LeftSection>
          <Logo variant="h6">
            TaskFlow Pro
          </Logo>
        </LeftSection>

        <CenterSection>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <SearchContainer>
              <SearchIcon sx={{ color: '#999' }} />
              <SearchInput
                placeholder="Search tasks, projects..."
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                sx={{ minWidth: 200 }}
              />
            </SearchContainer>
            {searchOpen && (searchResults.length > 0 || searchLoading) && (
              <Box sx={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: '100%',
                bgcolor: '#fff',
                boxShadow: 3,
                borderRadius: 2,
                zIndex: 10,
                maxHeight: 300,
                overflowY: 'auto',
                p: 1
              }}>
                {searchLoading && (
                  <Typography sx={{ p: 1, color: '#888' }}>Loading...</Typography>
                )}
                {!searchLoading && searchResults.length === 0 && (
                  <Typography sx={{ p: 1, color: '#888' }}>No results found</Typography>
                )}
                {searchResults.map((item, idx) => (
                  <Box
                    key={item.type + item.id}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: '#f5f5f5' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                    onClick={() => handleResultClick(item)}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.type === 'task' ? '📝' : '📁'}
                    </Typography>
                    <Typography variant="body2">{item.title}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </CenterSection>

        <RightSection>
          <ModernIconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </ModernIconButton>
          
          <ModernIconButton>
            <MessageIcon />
          </ModernIconButton>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                {user.name}
              </Typography>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => {
                  handleMenuClose();
                  navigate('/profile');
                }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </RightSection>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;
