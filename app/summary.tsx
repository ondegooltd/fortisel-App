import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { ArrowLeft, CreditCard, X } from 'lucide-react-native';
import { usePayments } from '@/hooks/useApi';

export default function SummaryScreen() {
  const {
    orderId,
    cylinderSize,
    quantity,
    refillAmount,
    deliveryFee,
    totalAmount,
    pickupAddress,
    dropOffAddress,
    receiverName,
    receiverPhone,
    paymentMethod,
    notes,
    date,
    time
  } = useLocalSearchParams();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  const { recordCashPayment } = usePayments();

  const handleConfirm = () => {
    if (paymentMethod?.toString().includes('Momo')) {
      setShowPaymentModal(true);
    } else {
      setShowSuccessModal(true);
    }
  };

  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  const handleCashPayment = async () => {
    const result = await recordCashPayment.execute(orderId, totalAmount);
    if (result?.success) {
      setShowPaymentSuccessModal(true);
    }
  };

  const handlePaystackPayment = async () => {
    // This would integrate with Paystack
    // For now, we'll simulate a successful payment
    const result = await recordCashPayment.execute(orderId, totalAmount);
    if (result?.success) {
      setShowPaymentSuccessModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {orderId && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.summaryValue}>{orderId}</Text>
            </View>
          )}
          {date && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Scheduled Date</Text>
              <Text style={styles.summaryValue}>{
                new Date(Array.isArray(date) ? date[0] : date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              }</Text>
            </View>
          )}
          {time && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Scheduled Time</Text>
              <Text style={styles.summaryValue}>{time}</Text>
            </View>
          )}
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pickup Address</Text>
            <Text style={styles.summaryValue}>{pickupAddress}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Drop Off Address</Text>
            <Text style={styles.summaryValue}>{dropOffAddress}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Receiver Name</Text>
            <Text style={styles.summaryValue}>{receiverName}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Receiver Phone</Text>
            <Text style={styles.summaryValue}>{receiverPhone}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Cylinder Size</Text>
            <Text style={styles.summaryValue}>{cylinderSize}</Text>
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
            <Text style={[styles.summaryValue, styles.totalAmount]}>GHS {totalAmount}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Payment Option</Text>
            <Text style={styles.summaryValue}>{paymentMethod}</Text>
          </View>

          {notes && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Notes</Text>
              <Text style={styles.summaryValue}>{notes}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentButton, recordCashPayment.loading && styles.disabledButton]}
          onPress={handleCashPayment}
          disabled={recordCashPayment.loading}
        >
          <Text style={styles.paymentButtonText}>
            {recordCashPayment.loading ? 'Processing...' : 'Pay with Cash'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentButton, recordCashPayment.loading && styles.disabledButton]}
          onPress={handlePaystackPayment}
          disabled={recordCashPayment.loading}
        >
          <Text style={styles.paymentButtonText}>
            {recordCashPayment.loading ? 'Processing...' : 'Pay with Paystack'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CreditCard size={24} color={COLORS.darkText} />
              <Text style={styles.modalTitle}>Payment Confirmation</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.paymentInfo}>
              You will be prompted to complete payment via {paymentMethod} for GHS {totalAmount}
            </Text>

            <TouchableOpacity 
              style={styles.payButton}
              onPress={handlePaymentConfirm}
            >
              <Text style={styles.payButtonText}>Proceed to Payment</Text>
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
            <Text style={styles.successTitle}>Request Successful!</Text>
            <Text style={styles.successMessage}>
              Your refill request has been successfully made, you will receive a phone call in the next 5 minutes to confirm your request. If it delays, call customer support on 0205400925.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace({
                  pathname: '/(tabs)/orders',
                  params: { orderPlaced: 'true' }
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
              Your payment has been successfully processed. Your refill request is now complete.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowPaymentSuccessModal(false);
                router.replace({
                  pathname: '/(tabs)/orders',
                  params: { orderPlaced: 'true' }
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
    marginBottom: 40,
  },
  confirmButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
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
    marginBottom: 20,
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