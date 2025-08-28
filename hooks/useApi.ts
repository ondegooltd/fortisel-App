import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { apiUtils } from '@/utils/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showErrorAlert?: boolean;
    showSuccessAlert?: boolean;
    successMessage?: string;
  }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        if (options?.showSuccessAlert && options?.successMessage) {
          Alert.alert('Success', options.successMessage);
        }

        return result;
      } catch (error) {
        const errorMessage = apiUtils.handleError(error);
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));

        if (options?.onError) {
          options.onError(errorMessage);
        }

        if (options?.showErrorAlert !== false) {
          Alert.alert('Error', errorMessage);
        }

        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for common operations
export function useAuth() {
  const signin = useApi(
    async (phoneNumber: string, password: string) => {
      const { authService } = await import('@/utils/api');
      const response = await authService.signin(phoneNumber, password);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Successfully signed in!',
    }
  );

  const signup = useApi(
    async (phoneNumber: string, password: string) => {
      const { authService } = await import('@/utils/api');
      const response = await authService.signup(phoneNumber, password);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Account created successfully!',
    }
  );

  const sendOTP = useApi(
    async (phoneNumber: string, context: 'signup' | 'reset') => {
      const { authService } = await import('@/utils/api');
      const response = context === 'signup' 
        ? await authService.sendSignupOTP(phoneNumber)
        : await authService.sendResetOTP(phoneNumber);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'OTP sent successfully!',
    }
  );

  const verifyOTP = useApi(
    async (phoneNumber: string, otp: string, context: 'signup' | 'reset') => {
      const { authService } = await import('@/utils/api');
      const response = await authService.verifyOTP(phoneNumber, otp, context);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'OTP verified successfully!',
    }
  );

  const resetPassword = useApi(
    async (phoneNumber: string, newPassword: string) => {
      const { authService } = await import('@/utils/api');
      const response = await authService.resetPassword(phoneNumber, newPassword);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Password reset successfully!',
    }
  );

  return {
    signin,
    signup,
    sendOTP,
    verifyOTP,
    resetPassword,
  };
}

export function useOrders() {
  const createOrder = useApi(
    async (orderData: any) => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.createOrder(orderData);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Order created successfully!',
    }
  );

  const getUserOrders = useApi(
    async () => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.getUserOrders();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const getOrder = useApi(
    async (orderId: string) => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.getOrder(orderId);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const cancelOrder = useApi(
    async (orderId: string) => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.cancelOrder(orderId);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Order cancelled successfully!',
    }
  );

  return {
    createOrder,
    getUserOrders,
    getOrder,
    cancelOrder,
  };
}

export function usePayments() {
  const initializePayment = useApi(
    async (orderId: string, amount: number, email: string) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.initializePayment(orderId, amount, email);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const verifyPayment = useApi(
    async (reference: string) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.verifyPayment(reference);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Payment verified successfully!',
    }
  );

  const recordCashPayment = useApi(
    async (orderId: string, amount: number) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.recordCashPayment(orderId, amount);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Cash payment recorded successfully!',
    }
  );

  return {
    initializePayment,
    verifyPayment,
    recordCashPayment,
  };
}

export function useNotifications() {
  const getNotifications = useApi(
    async () => {
      const { notificationService } = await import('@/utils/api');
      const response = await notificationService.getNotifications();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const markAsRead = useApi(
    async (notificationId: string) => {
      const { notificationService } = await import('@/utils/api');
      const response = await notificationService.markAsRead(notificationId);
      return response;
    },
    {
      showErrorAlert: false,
    }
  );

  const markAllAsRead = useApi(
    async () => {
      const { notificationService } = await import('@/utils/api');
      const response = await notificationService.markAllAsRead();
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'All notifications marked as read!',
    }
  );

  return {
    getNotifications,
    markAsRead,
    markAllAsRead,
  };
} 