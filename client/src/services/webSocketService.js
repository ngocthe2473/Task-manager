import io from 'socket.io-client';
import notificationService from './notificationService';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return;
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user room for targeted notifications
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect(userId);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect(userId);
    });

    // Listen for real-time notifications
    this.socket.on('notification', (notification) => {
      console.log('Received real-time notification:', notification);
      
      // Add to notification service
      notificationService.addNotification(notification);
      
      // Show browser notification if permission granted
      notificationService.showBrowserNotification(
        notification.content,
        {
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: notification.type,
          requireInteraction: notification.type === 'task_overdue'
        }
      );
    });

    // Listen for task updates
    this.socket.on('task_updated', (task) => {
      console.log('Task updated:', task);
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('task_updated', { detail: task }));
    });

    // Listen for new tasks
    this.socket.on('task_created', (task) => {
      console.log('New task created:', task);
      window.dispatchEvent(new CustomEvent('task_created', { detail: task }));
    });

    // Listen for task comments
    this.socket.on('task_comment', (data) => {
      console.log('New task comment:', data);
      window.dispatchEvent(new CustomEvent('task_comment', { detail: data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Send a message to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }

  // Listen for custom events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check connection status
  isConnectedToServer() {
    return this.isConnected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
