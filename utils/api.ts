import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '@/constants/config';
import { Alert } from 'react-native';

console.log('API_BASE_URL:', CONFIG.API_BASE_URL);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  _id: string;
  phoneNumber: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export type CylinderSize = 'smallest'|'small' | 'medium'| 'big' | 'large' | 'commercial' ;

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  cylinderSize: CylinderSize;
  quantity: number;
  refillAmount: number;
  deliveryFee: number;
  totalAmount: number;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  notes?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'paystack' | 'cash';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'paystack' | 'cash';
  status: 'pending' | 'success' | 'failed';
  transactionReference?: string;
  paystackReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_update' | 'payment' | 'general';
  read: boolean;
  data?: any;
  createdAt: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers
      });
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Show error popup for network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      Alert.alert(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }

    // Show error popup for server errors (5xx)
    if (error.response?.status && error.response.status >= 500) {
      Alert.alert(
        'Server Error',
        'Something went wrong on our end. Please try again later.',
        [{ text: 'OK' }]
      );
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please sign in again.',
        [{ text: 'OK' }]
      );
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors with logging and popups
const handleApiError = (error: any, operation: string): never => {
  const errorMessage = apiUtils.handleError(error);
  console.error(`❌ ${operation} failed:`, {
    error: error,
    message: errorMessage,
    response: error.response?.data
  });
  
  Alert.alert(
    'Error',
    errorMessage,
    [{ text: 'OK' }]
  );
  
  throw error;
};

// API Service Functions

// Authentication Services
export const authService = {
  // Send OTP for signup
  sendSignupOTP: async (phoneNumber: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('📱 Sending signup OTP for:', phoneNumber);
      const response = await api.post('/auth/send-signup-otp', { phoneNumber });
      console.log('✅ Signup OTP sent successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Send signup OTP');
    }
  },

  // Send OTP for password reset
  sendResetOTP: async (phoneNumber: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('📱 Sending reset OTP for:', phoneNumber);
      const response = await api.post('/auth/send-reset-otp', { phoneNumber });
      console.log('✅ Reset OTP sent successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Send reset OTP');
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber: string, otp: string, context: 'signup' | 'reset'): Promise<ApiResponse<{ token?: string }> | undefined> => {
    try {
      console.log('🔐 Verifying OTP for:', phoneNumber, 'context:', context);
      const response = await api.post('/auth/verify-otp', { phoneNumber, otp, context });
      console.log('✅ OTP verified successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Verify OTP');
    }
  },

  // Sign up user
  signup: async (phoneNumber: string, password: string): Promise<ApiResponse<{ user: User; token: string }> | undefined> => {
    try {
      console.log('👤 Creating new user account for:', phoneNumber);
      const response = await api.post('/auth/signup', { phoneNumber, password });
      console.log('✅ User account created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'User signup');
    }
  },

  // Sign in user
  signin: async (phoneNumber: string, password: string): Promise<ApiResponse<{ user: User; token: string }> | undefined> => {
    try {
      console.log('🔑 User signin attempt for:', phoneNumber);
      const response = await api.post('/auth/signin', { phoneNumber, password });
      console.log('✅ User signed in successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'User signin');
    }
  },

  // Reset password
  resetPassword: async (phoneNumber: string, newPassword: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('🔒 Resetting password for:', phoneNumber);
      const response = await api.post('/auth/reset-password', { phoneNumber, newPassword });
      console.log('✅ Password reset successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Password reset');
    }
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User> | undefined> => {
    try {
      console.log('👤 Fetching user profile');
      const response = await api.get('/auth/profile');
      console.log('✅ User profile fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get user profile');
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User> | undefined> => {
    try {
      console.log('👤 Updating user profile:', data);
      const response = await api.put('/auth/profile', data);
      console.log('✅ User profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update user profile');
    }
  },
};

// Order Services
export const orderService = {
  // Create new order
  createOrder: async (orderData: Omit<Order, '_id' | 'orderId' | 'userId' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Creating new order:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('✅ Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Create order');
    }
  },

  // Get user's orders
  getUserOrders: async (): Promise<ApiResponse<Order[]> | undefined> => {
    try {
      console.log('📋 Fetching user orders');
      const response = await api.get('/orders');
      console.log('✅ User orders fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get user orders');
    }
  },

  // Get specific order
  getOrder: async (orderId: string): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Fetching order:', orderId);
      const response = await api.get(`/orders/${orderId}`);
      console.log('✅ Order fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get order');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Updating order status:', orderId, 'to:', status);
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      console.log('✅ Order status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update order status');
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('❌ Cancelling order:', orderId);
      const response = await api.patch(`/orders/${orderId}/cancel`);
      console.log('✅ Order cancelled successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Cancel order');
    }
  },
};

// Payment Services
export const paymentService = {
  // Initialize Paystack payment
  initializePayment: async (orderId: string, amount: number, email: string): Promise<ApiResponse<{ authorizationUrl: string; reference: string }> | undefined> => {
    try {
      console.log('💳 Initializing payment for order:', orderId, 'amount:', amount);
      const response = await api.post('/payments/initialize', { orderId, amount, email });
      console.log('✅ Payment initialized successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Initialize payment');
    }
  },

  // Verify Paystack payment
  verifyPayment: async (reference: string): Promise<ApiResponse<Payment> | undefined> => {
    try {
      console.log('🔍 Verifying payment with reference:', reference);
      const response = await api.post('/payments/verify', { reference });
      console.log('✅ Payment verified successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Verify payment');
    }
  },

  // Record cash payment
  recordCashPayment: async (orderId: string, amount: number): Promise<ApiResponse<Payment> | undefined> => {
    try {
      console.log('💵 Recording cash payment for order:', orderId, 'amount:', amount);
      const response = await api.post('/payments/cash', { orderId, amount });
      console.log('✅ Cash payment recorded successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Record cash payment');
    }
  },

  // Get payment history
  getPaymentHistory: async (): Promise<ApiResponse<Payment[]> | undefined> => {
    try {
      console.log('📊 Fetching payment history');
      const response = await api.get('/payments');
      console.log('✅ Payment history fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get payment history');
    }
  },
};

// Notification Services
export const notificationService = {
  // Get user notifications
  getNotifications: async (): Promise<ApiResponse<Notification[]> | undefined> => {
    try {
      console.log('🔔 Fetching notifications');
      const response = await api.get('/notifications');
      console.log('✅ Notifications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse<Notification> | undefined> => {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      const response = await api.patch(`/notifications/${notificationId}/read`);
      console.log('✅ Notification marked as read successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse | undefined> => {
    try {
      console.log('✅ Marking all notifications as read');
      const response = await api.patch('/notifications/mark-all-read');
      console.log('✅ All notifications marked as read successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await api.delete(`/notifications/${notificationId}`);
      console.log('✅ Notification deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Delete notification');
    }
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('hasSeenOnboarding');
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  },
};

export default api; 