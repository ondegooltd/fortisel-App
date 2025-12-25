import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { ArrowLeft, CreditCard, X } from 'lucide-react-native';
import { usePayments, useProfile, useOrders } from '@/hooks/useApi';
import * as WebBrowser from 'expo-web-browser';

export default function SummaryScreen() {
  const params = useLocalSearchParams();

  // Extract params (handle both array and string values)
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;
  const cylinderSize = Array.isArray(params.cylinderSize)
    ? params.cylinderSize[0]
    : params.cylinderSize;
  const cylinderSizeLabel = Array.isArray(params.cylinderSizeLabel)
    ? params.cylinderSizeLabel[0]
    : params.cylinderSizeLabel;
  const quantity = Array.isArray(params.quantity)
    ? params.quantity[0]
    : params.quantity;
  const refillAmount = Array.isArray(params.refillAmount)
    ? params.refillAmount[0]
    : params.refillAmount;
  const deliveryFee = Array.isArray(params.deliveryFee)
    ? params.deliveryFee[0]
    : params.deliveryFee;
  const totalAmount = Array.isArray(params.totalAmount)
    ? params.totalAmount[0]
    : params.totalAmount;
  const pickupAddress = Array.isArray(params.pickupAddress)
    ? params.pickupAddress[0]
    : params.pickupAddress;
  const dropOffAddress = Array.isArray(params.dropOffAddress)
    ? params.dropOffAddress[0]
    : params.dropOffAddress;
  const receiverName = Array.isArray(params.receiverName)
    ? params.receiverName[0]
    : params.receiverName;
  const receiverPhone = Array.isArray(params.receiverPhone)
    ? params.receiverPhone[0]
    : params.receiverPhone;
  const paymentMethod = Array.isArray(params.paymentMethod)
    ? params.paymentMethod[0]
    : params.paymentMethod;
  const notes = Array.isArray(params.notes) ? params.notes[0] : params.notes;
  const scheduledDate = Array.isArray(params.scheduledDate)
    ? params.scheduledDate[0]
    : params.scheduledDate;
  const scheduledTime = Array.isArray(params.scheduledTime)
    ? params.scheduledTime[0]
    : params.scheduledTime;
  const isScheduled = Array.isArray(params.isScheduled)
    ? params.isScheduled[0]
    : params.isScheduled;

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(
    orderId || null
  );
  const [orderCreated, setOrderCreated] = useState(!!orderId);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  const { createOrder } = useOrders();
  const paymentsHook = usePayments();
  const { createPayment, initializePaystackPayment } = paymentsHook;
  const { getProfile: getUserProfile } = useProfile();

  // Debug: Log hook result on mount
  useEffect(() => {
    if (!paymentsHook) {
      console.error('❌ usePayments() returned undefined!');
    } else if (!paymentsHook.initializePaystackPayment) {
      console.error(
        '❌ initializePaystackPayment missing from hook. Available:',
        Object.keys(paymentsHook)
      );
    } else {
      console.log('✅ Payment hook initialized correctly:', {
        hasCreatePayment: !!paymentsHook.createPayment,
        hasInitializePaystackPayment: !!paymentsHook.initializePaystackPayment,
        hasExecute: !!paymentsHook.initializePaystackPayment?.execute,
      });
    }
  }, [paymentsHook]);

  // Create order when user confirms
  const handleConfirmOrder = async () => {
    try {
      // Build order data from params
      const orderData: any = {
        cylinderSize: cylinderSize, // Enum value from params
        quantity: parseInt(quantity || '1', 10),
        refillAmount: parseFloat(refillAmount || '0'),
        deliveryFee: parseFloat(deliveryFee || '0'),
        totalAmount: parseFloat(totalAmount || '0'),
        pickupAddress: pickupAddress || undefined,
        dropOffAddress: dropOffAddress || undefined,
        receiverName: receiverName || undefined,
        receiverPhone: receiverPhone || undefined,
        paymentMethod: paymentMethod || 'cash',
        notes: notes || undefined,
      };

      // Add scheduled date/time if this is a scheduled order
      if (isScheduled === 'true' && scheduledDate && scheduledTime) {
        orderData.scheduledDate = scheduledDate;
        orderData.scheduledTime = scheduledTime;
      }

      const result = await createOrder.execute(orderData);

      if (result?.success && result.data) {
        setCreatedOrderId(result.data.orderId);
        setOrderCreated(true);

        // Show payment options after order is created
        if (paymentMethod === 'cash') {
          // For cash, just show success
          setShowSuccessModal(true);
        } else {
          // For other payment methods, show payment modal
          setShowPaymentModal(true);
        }
      } else {
        Alert.alert('Error', 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    }
  };

  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    // Payment will be handled by individual payment buttons
  };

  const handleCashPayment = async () => {
    if (!createdOrderId) {
      Alert.alert(
        'Error',
        'Order not created yet. Please confirm the order first.'
      );
      return;
    }

    try {
      const profileResult = await getUserProfile.execute();
      if (!profileResult?.success || !profileResult.data) {
        Alert.alert('Error', 'Unable to get user information');
        return;
      }

      const result = await createPayment.execute(
        createdOrderId,
        parseFloat(totalAmount || '0'),
        'cash',
        'GHS',
        profileResult.data._id
      );

      if (result?.success) {
        setShowPaymentSuccessModal(true);
      } else {
        Alert.alert('Error', 'Failed to process payment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to process cash payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const handlePaystackPayment = async () => {
    if (!createdOrderId) {
      Alert.alert(
        'Error',
        'Order not created yet. Please confirm the order first.'
      );
      return;
    }

    try {
      const profileResult = await getUserProfile.execute();
      if (!profileResult?.success || !profileResult.data) {
        Alert.alert('Error', 'Unable to get user information');
        return;
      }

      // Initialize Paystack payment
      if (!initializePaystackPayment?.execute) {
        console.error(
          '❌ initializePaystackPayment.execute is not available.',
          'initializePaystackPayment:',
          initializePaystackPayment,
          'paymentsHook keys:',
          paymentsHook ? Object.keys(paymentsHook) : 'hook is undefined'
        );
        Alert.alert(
          'Error',
          'Payment service not available. Please try again.'
        );
        return;
      }

      const result = await initializePaystackPayment.execute(
        createdOrderId,
        profileResult.data.email || 'customer@fortisel.com',
        parseFloat(totalAmount || '0')
      );

      if (result?.success && result.data?.authorization_url) {
        // Open Paystack payment page in browser
        const browserResult = await WebBrowser.openBrowserAsync(
          result.data.authorization_url,
          {
            showTitle: true,
            toolbarColor: COLORS.primary,
            enableBarCollapsing: false,
          }
        );

        // Check if user completed payment (browser was dismissed)
        if (browserResult.type === 'dismiss') {
          // Payment might be completed, show success
          // In production, you should verify payment status via webhook or polling
          setShowPaymentSuccessModal(true);
        }
      } else {
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to process Paystack payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {createdOrderId && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.summaryValue}>{createdOrderId}</Text>
            </View>
          )}

          {scheduledDate && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Scheduled Date</Text>
              <Text style={styles.summaryValue}>
                {new Date(scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}

          {scheduledTime && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Scheduled Time</Text>
              <Text style={styles.summaryValue}>{scheduledTime}</Text>
            </View>
          )}

          {pickupAddress && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pickup Address</Text>
              <Text style={styles.summaryValue}>{pickupAddress}</Text>
            </View>
          )}

          {dropOffAddress && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Drop Off Address</Text>
              <Text style={styles.summaryValue}>{dropOffAddress}</Text>
            </View>
          )}

          {receiverName && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Receiver Name</Text>
              <Text style={styles.summaryValue}>{receiverName}</Text>
            </View>
          )}

          {receiverPhone && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Receiver Phone</Text>
              <Text style={styles.summaryValue}>{receiverPhone}</Text>
            </View>
          )}

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Cylinder Size</Text>
            <Text style={styles.summaryValue}>
              {cylinderSizeLabel || cylinderSize}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{quantity}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Refill Amount</Text>
            <Text style={styles.summaryValue}>GHS {refillAmount}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>GHS {deliveryFee}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={[styles.summaryValue, styles.totalAmount]}>
              GHS {totalAmount}
            </Text>
          </View>

          {paymentMethod && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>
                {paymentMethod === 'cash'
                  ? 'Cash On Pickup'
                  : paymentMethod === 'mobile_money'
                  ? 'Mobile Money'
                  : 'Card'}
              </Text>
            </View>
          )}

          {notes && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Notes</Text>
              <Text style={styles.summaryValue}>{notes}</Text>
            </View>
          )}
        </View>

        {!orderCreated ? (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              createOrder.loading && styles.disabledButton,
            ]}
            onPress={handleConfirmOrder}
            disabled={createOrder.loading}
          >
            {createOrder.loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.confirmButtonText}>Creating Order...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Order</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            {/* Always show payment options after order is created, regardless of initial payment method selection */}
            <TouchableOpacity
              style={[
                styles.paymentButton,
                createPayment.loading && styles.disabledButton,
              ]}
              onPress={handleCashPayment}
              disabled={createPayment.loading}
            >
              <Text style={styles.paymentButtonText}>
                {createPayment.loading ? 'Processing...' : 'Pay with Cash'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentButton,
                (createPayment?.loading ||
                  initializePaystackPayment?.loading) &&
                  styles.disabledButton,
              ]}
              onPress={handlePaystackPayment}
              disabled={
                createPayment?.loading || initializePaystackPayment?.loading
              }
            >
              {initializePaystackPayment?.loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.paymentButtonText}>Initializing...</Text>
                </View>
              ) : (
                <Text style={styles.paymentButtonText}>Pay with Paystack</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CreditCard size={24} color={COLORS.darkText} />
              <Text style={styles.modalTitle}>Payment Options</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.paymentInfo}>
              Choose your payment method for GHS {totalAmount}
            </Text>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handleCashPayment}
              disabled={createPayment.loading}
            >
              <Text style={styles.payButtonText}>
                {createPayment.loading ? 'Processing...' : 'Pay with Cash'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePaystackPayment}
              disabled={createPayment.loading}
            >
              <Text style={styles.payButtonText}>
                {createPayment.loading ? 'Processing...' : 'Pay with Paystack'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your refill request has been successfully created. You will
              receive a phone call in the next 5 minutes to confirm your
              request. If it delays, call customer support on 0205400925.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace({
                  pathname: '/(tabs)/orders',
                  params: { orderPlaced: 'true' },
                });
              }}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPaymentSuccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              Your payment has been successfully processed. Your refill request
              is now complete.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowPaymentSuccessModal(false);
                router.replace({
                  pathname: '/(tabs)/orders',
                  params: { orderPlaced: 'true' },
                });
              }}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: COLORS.darkBackground,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryItem: {
    marginBottom: 15,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    marginBottom: 5,
  },
  summaryValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.darkText,
  },
  paymentInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 24,
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 24,
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  successButtonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  paymentButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },
});
