// Notification Service for Task Manager
import apiService from './apiService';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
    this.init();
  }

  async init() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Load notifications from backend
    await this.loadNotifications();

    // Check for due date reminders every 5 minutes
    setInterval(() => {
      this.loadNotifications();
    }, 300000); // 5 minutes
  }
  // Load notifications from backend
  async loadNotifications() {
    try {
      const response = await apiService.getNotifications();
      this.notifications = response.notifications || [];
      this.unreadCount = response.unreadCount || 0;
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback({
      notifications: this.notifications,
      unreadCount: this.unreadCount
    }));
  }

  // Add a new notification (for local notifications)
  addLocalNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.unreadCount++;
    this.notifyListeners();

    // Show browser notification if permitted
    this.showBrowserNotification(newNotification);

    return newNotification;
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type,
        requireInteraction: notification.type === 'deadline_warning'
      };

      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        if (notification.action) {
          notification.action();
        }
        browserNotification.close();
      };

      // Auto close after 5 seconds for non-critical notifications
      if (notification.type !== 'deadline_warning') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }
  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await apiService.markNotificationAsRead(notificationId);
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to local update
      this.notifications = this.notifications.map(notification =>
        notification.id === notificationId || notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await apiService.markAllNotificationsAsRead();
      this.notifications.forEach(notification => {
        notification.isRead = true;
      });
      this.unreadCount = 0;
      this.notifyListeners();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback to local update
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      this.notifyListeners();
    }
  }
  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await apiService.deleteNotification(notificationId);
      const index = this.notifications.findIndex(n => n._id === notificationId);
      if (index !== -1) {
        const notification = this.notifications[index];
        if (!notification.isRead) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.notifications.splice(index, 1);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback to local removal
      this.notifications = this.notifications.filter(
        notification => notification.id !== notificationId && notification._id !== notificationId
      );
      this.notifyListeners();
    }
  }

  // Clear all notifications
  async clearAll() {
    try {
      await apiService.clearAllNotifications();
      this.notifications = [];
      this.unreadCount = 0;
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      // Fallback to local clear
      this.notifications = [];
      this.unreadCount = 0;
      this.notifyListeners();
    }
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(notification => !notification.isRead).length;
  }

  // Save to localStorage
  saveToStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Task-specific notification methods
  notifyTaskCreated(task, creator) {
    return this.addNotification({
      type: 'task_created',
      title: 'New Task Created',
      message: `${creator} created task "${task.title}"`,
      priority: 'medium',
      relatedTaskId: task._id || task.id,
      action: () => {
        // Navigate to task details
        window.location.hash = `#/task/${task._id || task.id}`;
      }
    });
  }

  notifyTaskAssigned(task, assignee, assigner) {
    return this.addNotification({
      type: 'task_assigned',
      title: 'Task Assigned',
      message: `You have been assigned to "${task.title}" by ${assigner}`,
      priority: 'high',
      relatedTaskId: task._id || task.id,
      action: () => {
        window.location.hash = `#/task/${task._id || task.id}`;
      }
    });
  }

  notifyTaskCompleted(task, completedBy) {
    return this.addNotification({
      type: 'task_completed',
      title: 'Task Completed',
      message: `"${task.title}" has been completed by ${completedBy}`,
      priority: 'medium',
      relatedTaskId: task._id || task.id
    });
  }

  notifyCommentAdded(task, comment, commenter) {
    return this.addNotification({
      type: 'comment_added',
      title: 'New Comment',
      message: `${commenter} commented on "${task.title}": "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
      priority: 'medium',
      relatedTaskId: task._id || task.id,
      action: () => {
        window.location.hash = `#/task/${task._id || task.id}`;
      }
    });
  }

  notifyDueDateReminder(task, hoursUntilDue) {
    const urgency = hoursUntilDue <= 24 ? 'high' : 'medium';
    const timeText = hoursUntilDue <= 24 
      ? `${Math.floor(hoursUntilDue)} hours`
      : `${Math.floor(hoursUntilDue / 24)} days`;

    return this.addNotification({
      type: 'deadline_warning',
      title: 'Upcoming Deadline',
      message: `"${task.title}" is due in ${timeText}`,
      priority: urgency,
      relatedTaskId: task._id || task.id,
      action: () => {
        window.location.hash = `#/task/${task._id || task.id}`;
      }
    });
  }

  notifyTaskOverdue(task, daysOverdue) {
    return this.addNotification({
      type: 'task_overdue',
      title: 'Task Overdue!',
      message: `"${task.title}" is ${daysOverdue} day(s) overdue`,
      priority: 'high',
      relatedTaskId: task._id || task.id,
      action: () => {
        window.location.hash = `#/task/${task._id || task.id}`;
      }
    });
  }

  // Check for due date reminders
  async checkDueDateReminders() {
    try {
      // Get tasks from API or localStorage
      const tasks = await this.getTasks();
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.dueDate && task.status !== 'done') {
          const dueDate = new Date(task.dueDate);
          const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
          
          // Check if we should send reminders
          const shouldRemind = (
            (hoursUntilDue <= 24 && hoursUntilDue > 23) || // 1 day reminder
            (hoursUntilDue <= 4 && hoursUntilDue > 3) ||   // 4 hour reminder
            (hoursUntilDue <= 1 && hoursUntilDue > 0)      // 1 hour reminder
          );

          if (shouldRemind) {
            // Check if we've already sent this reminder
            const reminderKey = `reminder_${task._id || task.id}_${Math.floor(hoursUntilDue)}h`;
            const alreadySent = localStorage.getItem(reminderKey);
            
            if (!alreadySent) {
              this.notifyDueDateReminder(task, hoursUntilDue);
              localStorage.setItem(reminderKey, 'sent');
            }
          }

          // Check for overdue tasks
          if (hoursUntilDue < 0) {
            const daysOverdue = Math.floor(Math.abs(hoursUntilDue) / 24);
            const overdueKey = `overdue_${task._id || task.id}_${daysOverdue}d`;
            const alreadySentOverdue = localStorage.getItem(overdueKey);
            
            if (!alreadySentOverdue) {
              this.notifyTaskOverdue(task, daysOverdue);
              localStorage.setItem(overdueKey, 'sent');
            }
          }
        }
      });
    } catch (error) {
      console.error('Error checking due date reminders:', error);
    }
  }

  // Get tasks helper method
  async getTasks() {
    try {
      const token = localStorage.getItem('token') || 
        (JSON.parse(localStorage.getItem('userInfo')) || {}).token;
      
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        // Fallback to fake data
        const { getAllTasks } = await import('./fakeDatabaseService');
        return await getAllTasks();
      }
    } catch (error) {
      console.error('Error fetching tasks for notifications:', error);
      return [];
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
