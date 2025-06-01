import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { webSocketService } from '../services/webSocketService';

const WebSocketConnection = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect to WebSocket when user is authenticated
      webSocketService.connect(user._id || user.id);
      
      // Cleanup on unmount or user change
      return () => {
        webSocketService.disconnect();
      };
    } else {
      // Disconnect when user logs out
      webSocketService.disconnect();
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default WebSocketConnection;
