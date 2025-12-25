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

export interface PaymentMethod {
  _id: string;
  userId: string;
  type: 'card' | 'mobile_money';
  name: string;
  number: string;
  expiryDate?: string;
  cvv?: string;
  isDefault: boolean;
  isActive: boolean;
  provider?: string;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddress {
  _id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  landmark?: string;
  instructions?: string;
  isDefault: boolean;
  isActive: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorAuth {
  _id: string;
  userId: string;
  secret: string;
  backupCodes: string[];
  isEnabled: boolean;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export type CylinderSize =
  | 'smallest'
  | 'small'
  | 'medium'
  | 'big'
  | 'large'
  | 'commercial';

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  cylinderSize: CylinderSize;
  quantity: number;
  refillAmount: number;
  deliveryFee: number;
  totalAmount: number;
  pickupAddress?: string;
  dropOffAddress?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress?: string;
  notes?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'paystack' | 'cash' | 'mobile_money';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  paymentId?: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: 'paystack' | 'cash';
  paymentMethod: 'card' | 'bank_transfer' | 'mobile_money' | 'cash';
  status:
    | 'pending'
    | 'processing'
    | 'successful'
    | 'failed'
    | 'cancelled'
    | 'reversed';
  providerReference?: string;
  providerTransactionId?: string;
  transactionReference?: string;
  paystackReference?: string;
  description?: string;
  metadata?: any;
  failureReason?: string;
  processedAt?: string;
  webhookData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  notificationId?: string;
  userId?: string;
  title: string;
  message: string;
  type: 'order_update' | 'payment' | 'general' | string;
  orderId?: string;
  isRead: boolean;
  read?: boolean; // For backward compatibility
  data?: any;
  meta?: any;
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  sent?: boolean;
}

export interface Cylinder {
  _id: string;
  cylinderId: string;
  size: CylinderSize;
  deliveryFee: number;
  description: string;
  createdAt: string;
}

export interface Delivery {
  _id: string;
  deliveryId?: string;
  orderId: string;
  driverId?: string;
  pickupAddress: string;
  dropOffAddress: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  driverNotes?: string;
  customerNotes?: string;
  deliveryFee?: number;
  distance?: number;
  coordinates?: {
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
  };
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicket {
  _id: string;
  ticketId?: string;
  userId: string;
  orderId?: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  createdAt: string;
  updatedAt?: string;
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
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          data: config.data,
          params: config.params,
          headers: config.headers,
        }
      );
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
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  async (error: AxiosError) => {
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }`,
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      }
    );

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
  const errorDetails = error.response?.data;

  // Extract validation errors if present
  let validationMessage = errorMessage;
  if (
    errorDetails?.validationErrors &&
    Array.isArray(errorDetails.validationErrors)
  ) {
    const validationErrors = errorDetails.validationErrors
      .map((err: any) => {
        if (err.constraints && Array.isArray(err.constraints)) {
          return `${err.field}: ${err.constraints.join(', ')}`;
        }
        if (err.field && err.message) {
          return `${err.field}: ${err.message}`;
        }
        return err.message || JSON.stringify(err);
      })
      .join('\n');

    if (validationErrors) {
      validationMessage = `Validation Error:\n${validationErrors}`;
    }
  }

  console.error(`❌ ${operation} failed:`, {
    error: error,
    message: errorMessage,
    validationErrors: errorDetails?.validationErrors,
    response: errorDetails,
  });

  Alert.alert('Error', validationMessage, [{ text: 'OK' }]);

  throw error;
};

// API Service Functions

// Authentication Services
export const authService = {
  // Send OTP for signup
  sendSignupOTP: async (
    phoneNumber: string
  ): Promise<{ success: boolean; message: string } | undefined> => {
    try {
      console.log('📱 Sending signup OTP for:', phoneNumber);
      const response = await api.post('/users/request-otp', {
        phone: phoneNumber,
        otpDeliveryMethod: 'SMS',
      });
      console.log('✅ Signup OTP sent successfully:', response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      handleApiError(error, 'Send signup OTP');
    }
  },

  // Send OTP for password reset
  sendResetOTP: async (
    phoneNumber: string
  ): Promise<{ success: boolean; message: string } | undefined> => {
    try {
      console.log('📱 Sending reset OTP for:', phoneNumber);
      const response = await api.post('/users/request-password-reset', {
        phone: phoneNumber,
        otpDeliveryMethod: 'SMS',
      });
      console.log('✅ Reset OTP sent successfully:', response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      handleApiError(error, 'Send reset OTP');
    }
  },

  // Verify OTP
  verifyOTP: async (
    phoneNumber: string,
    otp: string,
    context: 'signup' | 'reset'
  ): Promise<ApiResponse<{ token?: string }> | undefined> => {
    try {
      console.log('🔐 Verifying OTP for:', phoneNumber, 'context:', context);
      const endpoint =
        context === 'signup'
          ? '/users/verify-otp'
          : '/users/verify-password-reset-otp';
      const response = await api.post(endpoint, { phone: phoneNumber, otp });
      console.log('✅ OTP verified successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Verify OTP');
    }
  },

  // Sign up user
  signup: async (
    name: string,
    email: string,
    phoneNumber: string,
    password: string
  ): Promise<{ success: boolean; user: User; message: string } | undefined> => {
    try {
      // Validate required parameters
      if (!name || !email || !phoneNumber || !password) {
        throw new Error(
          'Missing required fields: name, email, phoneNumber, or password'
        );
      }

      console.log('👤 Creating new user account for:', email);
      console.log('📝 API service received parameters:', {
        name,
        email,
        phoneNumber,
        password: password ? password.substring(0, 3) + '***' : 'undefined', // Hide password for security
      });
      const response = await api.post('/users', {
        name,
        email,
        phone: phoneNumber,
        password,
      });
      console.log('✅ User account created successfully:', response.data);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      handleApiError(error, 'User signup');
    }
  },

  // Sign in user
  signin: async (
    phoneNumber: string,
    password: string
  ): Promise<
    | { success: boolean; user: User; accessToken: string; message: string }
    | undefined
  > => {
    try {
      console.log('🔑 User signin attempt for:', phoneNumber);
      const response = await api.post('/users/login', {
        phone: phoneNumber,
        password,
      });
      console.log('✅ User signed in successfully:', response.data);

      // Handle transformed response structure from ResponseTransformInterceptor
      const responseData = response.data.data || response.data;

      return {
        success: true,
        user: responseData.user,
        accessToken: responseData.accessToken,
        message: responseData.message,
      };
    } catch (error) {
      handleApiError(error, 'User signin');
    }
  },

  // Reset password
  resetPassword: async (
    phoneNumber: string,
    newPassword: string
  ): Promise<ApiResponse | undefined> => {
    try {
      console.log('🔒 Resetting password for:', phoneNumber);
      const response = await api.post('/users/reset-password', {
        phone: phoneNumber,
        newPassword,
      });
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
      const response = await api.get('/users/me');
      console.log('✅ User profile fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get user profile');
    }
  },

  // Update user profile
  updateProfile: async (
    data: Partial<User>
  ): Promise<ApiResponse<User> | undefined> => {
    try {
      console.log('👤 Updating user profile:', data);
      const response = await api.patch('/users/me', data);
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
  createOrder: async (
    orderData: Omit<
      Order,
      | '_id'
      | 'orderId'
      | 'userId'
      | 'status'
      | 'paymentStatus'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Creating new order:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('✅ Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Create order');
    }
  },

  // Get user's orders (backend filters by authenticated user automatically via JWT token)
  getUserOrders: async (): Promise<ApiResponse<Order[]> | undefined> => {
    try {
      console.log('📋 Fetching user orders');
      const response = await api.get('/orders');
      console.log('✅ User orders fetched successfully:', response.data);

      // Backend automatically filters by authenticated user's userId from JWT token
      const orders = response.data?.data || response.data || [];
      if (!Array.isArray(orders)) {
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      handleApiError(error, 'Get user orders');
    }
  },

  // Get specific order
  getOrder: async (
    orderId: string
  ): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Fetching order:', orderId);
      const response = await api.get(`/orders/${orderId}`);
      console.log('✅ Order fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get order');
    }
  },

  // Get order by order ID (using orderId field)
  getOrderByOrderId: async (
    orderId: string
  ): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Fetching order by order ID:', orderId);
      const response = await api.get(`/orders/by-order-id/${orderId}`);
      console.log('✅ Order fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get order by order ID');
    }
  },

  // Update order (general update - can update any field)
  updateOrder: async (
    orderId: string,
    updateData: Partial<Order>
  ): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Updating order:', orderId, 'with data:', updateData);
      const response = await api.patch(`/orders/${orderId}`, updateData);
      console.log('✅ Order updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update order');
    }
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('📦 Updating order status:', orderId, 'to:', status);
      const response = await api.patch(`/orders/${orderId}`, { status });
      console.log('✅ Order status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update order status');
    }
  },

  // Cancel order
  cancelOrder: async (
    orderId: string
  ): Promise<ApiResponse<Order> | undefined> => {
    try {
      console.log('❌ Cancelling order:', orderId);
      const response = await api.patch(`/orders/${orderId}`, {
        status: 'cancelled',
      });
      console.log('✅ Order cancelled successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Cancel order');
    }
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('🗑️ Deleting order:', orderId);
      const response = await api.delete(`/orders/${orderId}`);
      console.log('✅ Order deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Delete order');
    }
  },
};

// Payment Services
export const paymentService = {
  // Initialize Paystack payment
  initializePaystackPayment: async (
    orderId: string,
    email: string,
    amount: number
  ): Promise<
    | ApiResponse<{
        authorization_url: string;
        reference: string;
        paymentId: string;
      }>
    | undefined
  > => {
    try {
      console.log(
        '💳 Initializing Paystack payment for order:',
        orderId,
        'amount:',
        amount
      );
      const response = await api.post('/payments/initialize/paystack', {
        orderId,
        email,
        amount,
      });
      console.log(
        '✅ Paystack payment initialized successfully:',
        response.data
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Initialize Paystack payment');
    }
  },

  // Create payment (for cash payments)
  createPayment: async (
    orderId: string,
    amount: number,
    paymentMethod: 'paystack' | 'cash' | 'mobile_money',
    currency: string = 'GHS',
    userId?: string
  ): Promise<ApiResponse<Payment> | undefined> => {
    try {
      console.log('💳 Creating payment for order:', orderId, 'amount:', amount);

      // Map payment method to provider and paymentMethod enum values
      const provider = paymentMethod === 'paystack' ? 'paystack' : 'cash';
      const methodEnum =
        paymentMethod === 'paystack'
          ? 'card'
          : paymentMethod === 'mobile_money'
          ? 'mobile_money'
          : 'cash';

      const response = await api.post('/payments', {
        orderId,
        userId: userId || '', // Required by backend
        amount,
        currency,
        provider, // Required: 'paystack' or 'cash'
        paymentMethod: methodEnum, // Required: 'card', 'bank_transfer', 'mobile_money', or 'cash'
      });
      console.log('✅ Payment created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Create payment');
    }
  },

  // Update payment status
  updatePaymentStatus: async (
    paymentId: string,
    status: Payment['status'],
    metadata?: any
  ): Promise<ApiResponse<Payment> | undefined> => {
    try {
      console.log('💳 Updating payment status:', paymentId, 'to:', status);
      const response = await api.patch(`/payments/${paymentId}/status`, {
        status,
        metadata,
      });
      console.log('✅ Payment status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update payment status');
    }
  },

  // Update payment (general update)
  updatePayment: async (
    paymentId: string,
    paymentData: Partial<Payment>
  ): Promise<ApiResponse<Payment> | undefined> => {
    try {
      console.log('💳 Updating payment:', paymentId, paymentData);
      const response = await api.patch(`/payments/${paymentId}`, paymentData);
      console.log('✅ Payment updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update payment');
    }
  },

  // Delete payment
  deletePayment: async (
    paymentId: string
  ): Promise<ApiResponse | undefined> => {
    try {
      console.log('🗑️ Deleting payment:', paymentId);
      const response = await api.delete(`/payments/${paymentId}`);
      console.log('✅ Payment deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Delete payment');
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

  // Get payment by order ID
  getPaymentByOrderId: async (
    orderId: string
  ): Promise<ApiResponse<Payment> | undefined> => {
    try {
      console.log('📊 Fetching payment for order:', orderId);
      const response = await api.get(`/payments/by-order/${orderId}`);
      console.log('✅ Payment fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get payment by order ID');
    }
  },

  // Get payment by user ID
  getPaymentByUserId: async (
    userId: string
  ): Promise<ApiResponse<Payment[]> | undefined> => {
    try {
      console.log('📊 Fetching payments for user:', userId);
      const response = await api.get(`/payments/by-user/${userId}`);
      console.log('✅ Payments fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get payment by user ID');
    }
  },

  // Get payment by status
  getPaymentByStatus: async (
    status: Payment['status']
  ): Promise<ApiResponse<Payment[]> | undefined> => {
    try {
      console.log('📊 Fetching payments by status:', status);
      const response = await api.get(`/payments/by-status?status=${status}`);
      console.log('✅ Payments fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get payment by status');
    }
  },
};

// Notification Services
export const notificationService = {
  // Get user notifications (backend filters by authenticated user automatically via JWT token)
  getNotifications: async (): Promise<
    ApiResponse<Notification[]> | undefined
  > => {
    try {
      console.log('🔔 Fetching notifications');
      const response = await api.get('/notifications');
      console.log('✅ Notifications fetched successfully:', response.data);

      // Backend automatically filters by authenticated user's userId from JWT token
      // Returns user-specific notifications and broadcast notifications (where userId is null/undefined)
      let notifications = response.data?.data || response.data || [];
      if (!Array.isArray(notifications)) {
        notifications = [];
      }

      // Transform notifications to ensure read field is consistent
      notifications = notifications.map((n: Notification) => ({
        ...n,
        read: n.isRead ?? n.read ?? false,
      }));

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      handleApiError(error, 'Get notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (
    notificationId: string
  ): Promise<ApiResponse<Notification> | undefined> => {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      const response = await api.patch(`/notifications/${notificationId}`, {
        isRead: true,
      });
      console.log(
        '✅ Notification marked as read successfully:',
        response.data
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Mark notification as read');
    }
  },

  // Mark all notifications as read (uses bulk endpoint)
  markAllAsRead: async (): Promise<ApiResponse | undefined> => {
    try {
      console.log('✅ Marking all notifications as read');
      const response = await api.patch('/notifications/mark-all-read');
      console.log(
        '✅ All notifications marked as read successfully:',
        response.data
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (
    notificationId: string
  ): Promise<ApiResponse | undefined> => {
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

// Payment Methods API
export const paymentMethodsApi = {
  // Get all payment methods
  getPaymentMethods: async (): Promise<
    ApiResponse<PaymentMethod[]> | undefined
  > => {
    try {
      console.log('💳 Fetching payment methods...');
      const response = await api.get('/payment-methods');
      console.log('✅ Payment methods fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get payment methods');
    }
  },

  // Create payment method
  createPaymentMethod: async (
    paymentMethod: Partial<PaymentMethod>
  ): Promise<ApiResponse<PaymentMethod> | undefined> => {
    try {
      console.log('💳 Creating payment method:', paymentMethod);
      const response = await api.post('/payment-methods', paymentMethod);
      console.log('✅ Payment method created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Create payment method');
    }
  },

  // Update payment method
  updatePaymentMethod: async (
    id: string,
    paymentMethod: Partial<PaymentMethod>
  ): Promise<ApiResponse<PaymentMethod> | undefined> => {
    try {
      console.log('💳 Updating payment method:', id, paymentMethod);
      const response = await api.patch(`/payment-methods/${id}`, paymentMethod);
      console.log('✅ Payment method updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update payment method');
    }
  },

  // Delete payment method
  deletePaymentMethod: async (id: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('💳 Deleting payment method:', id);
      const response = await api.delete(`/payment-methods/${id}`);
      console.log('✅ Payment method deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Delete payment method');
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (
    id: string
  ): Promise<ApiResponse<PaymentMethod> | undefined> => {
    try {
      console.log('💳 Setting default payment method:', id);
      const response = await api.patch(`/payment-methods/${id}/set-default`);
      console.log(
        '✅ Payment method set as default successfully:',
        response.data
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Set default payment method');
    }
  },
};

// Delivery Addresses API
export const deliveryAddressesApi = {
  // Get all delivery addresses
  getDeliveryAddresses: async (): Promise<
    ApiResponse<DeliveryAddress[]> | undefined
  > => {
    try {
      console.log('📍 Fetching delivery addresses...');
      const response = await api.get('/delivery-addresses');
      console.log('✅ Delivery addresses fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get delivery addresses');
    }
  },

  // Create delivery address
  createDeliveryAddress: async (
    address: Partial<DeliveryAddress>
  ): Promise<ApiResponse<DeliveryAddress> | undefined> => {
    try {
      console.log('📍 Creating delivery address:', address);
      const response = await api.post('/delivery-addresses', address);
      console.log('✅ Delivery address created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Create delivery address');
    }
  },

  // Update delivery address
  updateDeliveryAddress: async (
    id: string,
    address: Partial<DeliveryAddress>
  ): Promise<ApiResponse<DeliveryAddress> | undefined> => {
    try {
      console.log('📍 Updating delivery address:', id, address);
      const response = await api.patch(`/delivery-addresses/${id}`, address);
      console.log('✅ Delivery address updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update delivery address');
    }
  },

  // Delete delivery address
  deleteDeliveryAddress: async (
    id: string
  ): Promise<ApiResponse | undefined> => {
    try {
      console.log('📍 Deleting delivery address:', id);
      const response = await api.delete(`/delivery-addresses/${id}`);
      console.log('✅ Delivery address deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Delete delivery address');
    }
  },

  // Set default delivery address
  setDefaultDeliveryAddress: async (
    id: string
  ): Promise<ApiResponse<DeliveryAddress> | undefined> => {
    try {
      console.log('📍 Setting default delivery address:', id);
      const response = await api.patch(`/delivery-addresses/${id}/set-default`);
      console.log(
        '✅ Delivery address set as default successfully:',
        response.data
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Set default delivery address');
    }
  },
};

// Two-Factor Authentication API
export const twoFactorAuthApi = {
  // Get 2FA status
  getStatus: async (): Promise<
    ApiResponse<{ isEnabled: boolean; hasBackupCodes: boolean }> | undefined
  > => {
    try {
      console.log('🔐 Fetching 2FA status...');
      const response = await api.get('/two-factor-auth/status');
      console.log('✅ 2FA status fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get 2FA status');
    }
  },

  // Generate 2FA secret
  generateSecret: async (): Promise<
    | ApiResponse<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>
    | undefined
  > => {
    try {
      console.log('🔐 Generating 2FA secret...');
      const response = await api.post('/two-factor-auth/generate-secret');
      console.log('✅ 2FA secret generated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Generate 2FA secret');
    }
  },

  // Enable 2FA
  enable: async (
    verificationCode: string
  ): Promise<ApiResponse<{ isEnabled: boolean }> | undefined> => {
    try {
      console.log('🔐 Enabling 2FA...');
      const response = await api.post('/two-factor-auth/enable', {
        verificationCode,
      });
      console.log('✅ 2FA enabled successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Enable 2FA');
    }
  },

  // Disable 2FA
  disable: async (): Promise<
    ApiResponse<{ isEnabled: boolean }> | undefined
  > => {
    try {
      console.log('🔐 Disabling 2FA...');
      const response = await api.delete('/two-factor-auth/disable');
      console.log('✅ 2FA disabled successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Disable 2FA');
    }
  },

  // Verify 2FA code
  verify: async (
    code: string
  ): Promise<ApiResponse<{ verified: boolean }> | undefined> => {
    try {
      console.log('🔐 Verifying 2FA code...');
      const response = await api.post('/two-factor-auth/verify', { code });
      console.log('✅ 2FA code verified successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Verify 2FA code');
    }
  },

  // Regenerate backup codes
  regenerateBackupCodes: async (): Promise<
    ApiResponse<{ backupCodes: string[] }> | undefined
  > => {
    try {
      console.log('🔐 Regenerating backup codes...');
      const response = await api.post(
        '/two-factor-auth/regenerate-backup-codes'
      );
      console.log('✅ Backup codes regenerated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Regenerate backup codes');
    }
  },
};

// Cylinder Services
export const cylinderService = {
  // Get all cylinders
  getCylinders: async (): Promise<ApiResponse<Cylinder[]> | undefined> => {
    try {
      console.log('🔵 Fetching cylinders...');
      const response = await api.get('/cylinders');
      console.log('✅ Cylinders fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get cylinders');
    }
  },

  // Get cylinder by ID
  getCylinder: async (
    id: string
  ): Promise<ApiResponse<Cylinder> | undefined> => {
    try {
      console.log('🔵 Fetching cylinder:', id);
      const response = await api.get(`/cylinders/${id}`);
      console.log('✅ Cylinder fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get cylinder');
    }
  },

  // Get cylinder by size
  getCylinderBySize: async (
    size: CylinderSize
  ): Promise<ApiResponse<Cylinder> | undefined> => {
    try {
      console.log('🔵 Fetching cylinder by size:', size);
      const response = await api.get(`/cylinders/by-size/${size}`);
      console.log('✅ Cylinder fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get cylinder by size');
    }
  },
};

// Delivery Services
export const deliveryService = {
  // Get all deliveries
  getDeliveries: async (): Promise<ApiResponse<Delivery[]> | undefined> => {
    try {
      console.log('🚚 Fetching deliveries...');
      const response = await api.get('/deliveries');
      console.log('✅ Deliveries fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get deliveries');
    }
  },

  // Get delivery by ID
  getDelivery: async (
    id: string
  ): Promise<ApiResponse<Delivery> | undefined> => {
    try {
      console.log('🚚 Fetching delivery:', id);
      const response = await api.get(`/deliveries/${id}`);
      console.log('✅ Delivery fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get delivery');
    }
  },

  // Get delivery by order ID
  getDeliveryByOrderId: async (
    orderId: string
  ): Promise<ApiResponse<Delivery> | undefined> => {
    try {
      console.log('🚚 Fetching delivery by order ID:', orderId);
      const response = await api.get(`/deliveries/by-order/${orderId}`);
      console.log('✅ Delivery fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get delivery by order ID');
    }
  },

  // Get pending deliveries
  getPendingDeliveries: async (): Promise<
    ApiResponse<Delivery[]> | undefined
  > => {
    try {
      console.log('🚚 Fetching pending deliveries...');
      const response = await api.get('/deliveries/pending');
      console.log('✅ Pending deliveries fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get pending deliveries');
    }
  },

  // Get deliveries by status
  getDeliveriesByStatus: async (
    status: Delivery['status']
  ): Promise<ApiResponse<Delivery[]> | undefined> => {
    try {
      console.log('🚚 Fetching deliveries by status:', status);
      const response = await api.get(`/deliveries/by-status?status=${status}`);
      console.log('✅ Deliveries fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get deliveries by status');
    }
  },
};

// Support Ticket Services
export const supportTicketService = {
  // Create support ticket
  createTicket: async (
    ticketData: Omit<
      SupportTicket,
      '_id' | 'ticketId' | 'createdAt' | 'updatedAt'
    >
  ): Promise<ApiResponse<SupportTicket> | undefined> => {
    try {
      console.log('🎫 Creating support ticket:', ticketData);
      const response = await api.post('/support-tickets', ticketData);
      console.log('✅ Support ticket created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Create support ticket');
    }
  },

  // Get all support tickets
  getTickets: async (): Promise<ApiResponse<SupportTicket[]> | undefined> => {
    try {
      console.log('🎫 Fetching support tickets...');
      const response = await api.get('/support-tickets');
      console.log('✅ Support tickets fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get support tickets');
    }
  },

  // Get support ticket by ID
  getTicket: async (
    id: string
  ): Promise<ApiResponse<SupportTicket> | undefined> => {
    try {
      console.log('🎫 Fetching support ticket:', id);
      const response = await api.get(`/support-tickets/${id}`);
      console.log('✅ Support ticket fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get support ticket');
    }
  },

  // Update support ticket
  updateTicket: async (
    id: string,
    ticketData: Partial<SupportTicket>
  ): Promise<ApiResponse<SupportTicket> | undefined> => {
    try {
      console.log('🎫 Updating support ticket:', id, ticketData);
      const response = await api.patch(`/support-tickets/${id}`, ticketData);
      console.log('✅ Support ticket updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update support ticket');
    }
  },

  // Delete support ticket
  deleteTicket: async (id: string): Promise<ApiResponse | undefined> => {
    try {
      console.log('🎫 Deleting support ticket:', id);
      const response = await api.delete(`/support-tickets/${id}`);
      console.log('✅ Support ticket deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Delete support ticket');
    }
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error: any): string => {
    // Check for validation errors first
    if (
      error.response?.data?.validationErrors &&
      Array.isArray(error.response.data.validationErrors)
    ) {
      const validationErrors = error.response.data.validationErrors
        .map((err: any) => {
          if (err.constraints && Array.isArray(err.constraints)) {
            return `${err.field}: ${err.constraints.join(', ')}`;
          }
          if (err.field && err.message) {
            return `${err.field}: ${err.message}`;
          }
          return err.message || JSON.stringify(err);
        })
        .join('; ');

      if (validationErrors) {
        return `Validation failed: ${validationErrors}`;
      }
    }

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
