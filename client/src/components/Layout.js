import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import WebSocketConnection from './WebSocketConnection';

const Layout = ({ children }) => {
  return (
    <>
      <WebSocketConnection />
      <Navbar />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            overflowY: 'auto',
            backgroundColor: '#f7f8fa'
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
