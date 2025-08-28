// Example usage of API utilities in your screens

// 1. Using the API service directly in a screen
/*
import { authService, orderService, paymentService } from '@/utils/api';

// In your signin screen:
const handleSignIn = async () => {
  try {
    const response = await authService.signin(phoneNumber, password);
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      router.replace('/(tabs)');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to sign in');
  }
};

// In your request/schedule screen:
const handleCreateOrder = async () => {
  try {
    const orderData = {
      cylinderSize: selectedSize,
      quantity: quantity,
      refillAmount: refillAmount,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      receiverName: receiverName,
      receiverPhone: receiverPhone,
      deliveryAddress: deliveryAddress,
      notes: notes,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
    };
    
    const response = await orderService.createOrder(orderData);
    if (response.success && response.data) {
      // Navigate to summary with order details
      router.push({
        pathname: '/summary',
        params: { orderId: response.data.orderId }
      });
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to create order');
  }
};
*/

// 2. Using the custom hooks (recommended approach)
/*
import { useAuth, useOrders, usePayments } from '@/hooks/useApi';

// In your signin screen:
export default function SigninScreen() {
  const { signin } = useAuth();
  
  const handleSignIn = async () => {
    const result = await signin.execute(phoneNumber, password);
    if (result?.success && result.data?.token) {
      await AsyncStorage.setItem('userToken', result.data.token);
      router.replace('/(tabs)');
    }
  };
  
  return (
    // Your UI with loading state
    <TouchableOpacity 
      style={[styles.button, signin.loading && styles.disabledButton]}
      onPress={handleSignIn}
      disabled={signin.loading}
    >
      <Text style={styles.buttonText}>
        {signin.loading ? 'Signing in...' : 'Continue'}
      </Text>
    </TouchableOpacity>
  );
}

// In your request/schedule screen:
export default function RequestScreen() {
  const { createOrder } = useOrders();
  
  const handleCreateOrder = async () => {
    const orderData = {
      cylinderSize: selectedSize,
      quantity: quantity,
      refillAmount: refillAmount,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      receiverName: receiverName,
      receiverPhone: receiverPhone,
      deliveryAddress: deliveryAddress,
      notes: notes,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
    };
    
    const result = await createOrder.execute(orderData);
    if (result?.success && result.data) {
      router.push({
        pathname: '/summary',
        params: { orderId: result.data.orderId }
      });
    }
  };
  
  return (
    // Your UI with loading state
    <TouchableOpacity 
      style={[styles.button, createOrder.loading && styles.disabledButton]}
      onPress={handleCreateOrder}
      disabled={createOrder.loading}
    >
      <Text style={styles.buttonText}>
        {createOrder.loading ? 'Creating Order...' : 'Make Request'}
      </Text>
    </TouchableOpacity>
  );
}
*/

// 3. Integration with OTP verification
/*
import { useAuth } from '@/hooks/useApi';

export default function OTPVerificationScreen() {
  const { verifyOTP, sendOTP } = useAuth();
  const { context } = useLocalSearchParams();
  
  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 4) {
      const result = await verifyOTP.execute(phoneNumber, otpValue, context);
      if (result?.success) {
        if (context === 'reset') {
          router.push('/auth/reset-password');
        } else if (context === 'signup') {
          await AsyncStorage.setItem('userToken', result.data?.token || 'verified-token');
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
          router.replace('/(tabs)');
        }
      }
    }
  };
  
  const handleResendOTP = async () => {
    await sendOTP.execute(phoneNumber, context);
    setTimer(30);
  };
}
*/

// 4. Payment integration
/*
import { usePayments } from '@/hooks/useApi';

export default function SummaryScreen() {
  const { initializePayment, verifyPayment, recordCashPayment } = usePayments();
  
  const handlePaystackPayment = async () => {
    const result = await initializePayment.execute(orderId, totalAmount, userEmail);
    if (result?.success && result.data?.authorizationUrl) {
      // Open Paystack webview or redirect
      // After payment, verify with the reference
      const verifyResult = await verifyPayment.execute(result.data.reference);
      if (verifyResult?.success) {
        // Payment successful
        setShowPaymentSuccessModal(true);
      }
    }
  };
  
  const handleCashPayment = async () => {
    const result = await recordCashPayment.execute(orderId, totalAmount);
    if (result?.success) {
      setShowPaymentSuccessModal(true);
    }
  };
}
*/

// 5. Error handling with custom messages
/*
import { useApi } from '@/hooks/useApi';
import { authService } from '@/utils/api';

export default function CustomScreen() {
  const customSignin = useApi(
    async (phoneNumber: string, password: string) => {
      const response = await authService.signin(phoneNumber, password);
      return response;
    },
    {
      onSuccess: (data) => {
        console.log('Sign in successful:', data);
        // Custom success handling
      },
      onError: (error) => {
        console.log('Sign in failed:', error);
        // Custom error handling
      },
      showErrorAlert: false, // Don't show default alert
      showSuccessAlert: false, // Don't show default success alert
    }
  );
  
  const handleCustomSignIn = async () => {
    const result = await customSignin.execute(phoneNumber, password);
    if (result?.success) {
      // Handle success
    } else {
      // Handle error with custom UI
    }
  };
}
*/ 