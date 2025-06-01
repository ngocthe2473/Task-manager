import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Menu, MenuItem, Button, Badge, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext } from '../context/AuthContext';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

// Modern Minimalist Styled Components
const ModernNavBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  color: theme.palette.text.primary,
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.grey[100], 0.8),
  border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[100], 1),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&:focus-within': {
    backgroundColor: alpha(theme.palette.grey[50], 1),
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
    minWidth: '280px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.95rem',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 20px',
  fontSize: '0.95rem',
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
  },
}));

const ModernAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 36,
  height: 36,
  fontSize: '1rem',
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const ModernBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 600,
    minWidth: '18px',
    height: '18px',
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };
  return (
    <CyberNavBar position="static" elevation={0}>
      <Toolbar sx={{ py: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 0,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem',
            textShadow: '0 0 10px rgba(255,255,255,0.3)',
          }}
        >
          Task Manager
        </Typography>
        
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', maxWidth: '400px', mx: 'auto' }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase 
              placeholder="Search tasks, projects..." 
              inputProps={{ 'aria-label': 'search' }} 
            />
          </Search>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CyberButton 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
          >
            New Task
          </CyberButton>
          
          <IconButton sx={{ color: 'white' }}>
            <CyberBadge badgeContent={4} color="error">
              <NotificationsIcon />
            </CyberBadge>
          </IconButton>

          <IconButton
            onClick={handleMenu}
            size="small"
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <CyberAvatar 
              alt={userInfo?.name} 
              src={userInfo?.avatar}
              sx={{ width: 40, height: 40 }}
            >
              {userInfo?.name ? userInfo.name.charAt(0) : 'T'}
            </CyberAvatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, rgba(25,25,25,0.95), rgba(50,50,50,0.95))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                mt: 1,
                '& .MuiMenuItem-root': {
                  color: 'white',
                  borderRadius: '10px',
                  margin: '5px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(33,150,243,0.2), rgba(156,39,176,0.2))',
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleSettings}>Tài khoản của tôi</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </CyberNavBar>
  );
};

export default Navbar;


