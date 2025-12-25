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
      setState((prev) => ({ ...prev, loading: true, error: null }));

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
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));

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
    async (
      name: string,
      email: string,
      phoneNumber: string,
      password: string
    ) => {
      console.log('🔧 useAuth signup received parameters:', {
        name,
        email,
        phoneNumber,
        password: password ? password.substring(0, 3) + '***' : 'undefined',
      });
      const { authService } = await import('@/utils/api');
      const response = await authService.signup(
        name,
        email,
        phoneNumber,
        password
      );
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
      const response =
        context === 'signup'
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
      const response = await authService.resetPassword(
        phoneNumber,
        newPassword
      );
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

  const getOrderByOrderId = useApi(
    async (orderId: string) => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.getOrderByOrderId(orderId);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const updateOrder = useApi(
    async (orderId: string, updateData: any) => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.updateOrder(orderId, updateData);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Order updated successfully!',
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

  const deleteOrder = useApi(
    async (orderId: string) => {
      const { orderService } = await import('@/utils/api');
      const response = await orderService.deleteOrder(orderId);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Order deleted successfully!',
    }
  );

  return {
    createOrder,
    getUserOrders,
    getOrder,
    getOrderByOrderId,
    updateOrder,
    cancelOrder,
    deleteOrder,
  };
}

export function usePayments() {
  const createPayment = useApi(
    async (
      orderId: string,
      amount: number,
      paymentMethod: 'paystack' | 'cash' | 'mobile_money',
      currency?: string,
      userId?: string
    ) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.createPayment(
        orderId,
        amount,
        paymentMethod,
        currency,
        userId
      );
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Payment created successfully!',
    }
  );

  const updatePaymentStatus = useApi(
    async (paymentId: string, status: string, metadata?: any) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.updatePaymentStatus(
        paymentId,
        status as any,
        metadata
      );
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Payment status updated successfully!',
    }
  );

  const getPaymentHistory = useApi(
    async () => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.getPaymentHistory();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const getPaymentByOrderId = useApi(
    async (orderId: string) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.getPaymentByOrderId(orderId);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const updatePayment = useApi(
    async (paymentId: string, updateData: any) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.updatePayment(
        paymentId,
        updateData
      );
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Payment updated successfully!',
    }
  );

  const deletePayment = useApi(
    async (paymentId: string) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.deletePayment(paymentId);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Payment deleted successfully!',
    }
  );

  const initializePaystackPayment = useApi(
    async (orderId: string, email: string, amount: number) => {
      const { paymentService } = await import('@/utils/api');
      const response = await paymentService.initializePaystackPayment(
        orderId,
        email,
        amount
      );
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  return {
    createPayment,
    initializePaystackPayment,
    updatePaymentStatus,
    updatePayment,
    deletePayment,
    getPaymentHistory,
    getPaymentByOrderId,
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

  const deleteNotification = useApi(
    async (notificationId: string) => {
      const { notificationService } = await import('@/utils/api');
      const response = await notificationService.deleteNotification(
        notificationId
      );
      return response;
    },
    {
      showErrorAlert: false,
    }
  );

  return {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

export function useProfile() {
  const getProfile = useApi(
    async () => {
      const { authService } = await import('@/utils/api');
      const response = await authService.getProfile();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const updateProfile = useApi(
    async (profileData: any) => {
      const { authService } = await import('@/utils/api');
      const response = await authService.updateProfile(profileData);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Profile updated successfully!',
    }
  );

  return {
    getProfile,
    updateProfile,
  };
}

export function useCylinders() {
  const getCylinders = useApi(
    async () => {
      const { cylinderService } = await import('@/utils/api');
      const response = await cylinderService.getCylinders();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const getCylinderBySize = useApi(
    async (size: string) => {
      const { cylinderService } = await import('@/utils/api');
      const response = await cylinderService.getCylinderBySize(size as any);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  return {
    getCylinders,
    getCylinderBySize,
  };
}

export function useDeliveries() {
  const getDeliveries = useApi(
    async () => {
      const { deliveryService } = await import('@/utils/api');
      const response = await deliveryService.getDeliveries();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const getDeliveryByOrderId = useApi(
    async (orderId: string) => {
      const { deliveryService } = await import('@/utils/api');
      const response = await deliveryService.getDeliveryByOrderId(orderId);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const getPendingDeliveries = useApi(
    async () => {
      const { deliveryService } = await import('@/utils/api');
      const response = await deliveryService.getPendingDeliveries();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  return {
    getDeliveries,
    getDeliveryByOrderId,
    getPendingDeliveries,
  };
}

export function useSupportTickets() {
  const createTicket = useApi(
    async (ticketData: any) => {
      const { supportTicketService } = await import('@/utils/api');
      const response = await supportTicketService.createTicket(ticketData);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Support ticket created successfully!',
    }
  );

  const getTickets = useApi(
    async () => {
      const { supportTicketService } = await import('@/utils/api');
      const response = await supportTicketService.getTickets();
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const getTicket = useApi(
    async (id: string) => {
      const { supportTicketService } = await import('@/utils/api');
      const response = await supportTicketService.getTicket(id);
      return response;
    },
    {
      showErrorAlert: true,
    }
  );

  const updateTicket = useApi(
    async (id: string, ticketData: any) => {
      const { supportTicketService } = await import('@/utils/api');
      const response = await supportTicketService.updateTicket(id, ticketData);
      return response;
    },
    {
      showErrorAlert: true,
      successMessage: 'Support ticket updated successfully!',
    }
  );

  return {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
  };
}
