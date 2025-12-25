import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Package,
  CreditCard,
  Trash2,
  X,
} from 'lucide-react-native';
import { useOrders, useDeliveries, usePayments } from '@/hooks/useApi';
import { Order, Delivery, Payment } from '@/utils/api';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  const { getOrder, cancelOrder, deleteOrder } = useOrders();
  const { getDeliveryByOrderId } = useDeliveries();
  const { getPaymentByOrderId } = usePayments();

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderResult = await getOrder.execute(id);
      if (orderResult?.success && orderResult.data) {
        const orderData = orderResult.data as any;
        setOrder(orderData);

        // Load delivery if orderId exists
        if (orderData.orderId) {
          try {
            const deliveryResult = await getDeliveryByOrderId.execute(
              orderData.orderId
            );
            if (deliveryResult?.success && deliveryResult.data) {
              setDelivery(deliveryResult.data as Delivery);
            }
          } catch (error) {
            console.error('Failed to load delivery:', error);
          }

          // Load payment
          try {
            const paymentResult = await getPaymentByOrderId.execute(
              orderData.orderId
            );
            if (paymentResult?.success && paymentResult.data) {
              const paymentData = Array.isArray(paymentResult.data)
                ? paymentResult.data[0]
                : paymentResult.data;
              setPayment(paymentData as Payment);
            }
          } catch (error) {
            console.error('Failed to load payment:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await cancelOrder.execute(id);
            if (result?.success) {
              Alert.alert('Success', 'Order cancelled successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }
          } catch (error) {
            console.error('Failed to cancel order:', error);
          }
        },
      },
    ]);
  };

  const handleDeleteOrder = () => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteOrder.execute(id);
              if (result?.success) {
                Alert.alert('Success', 'Order deleted successfully', [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              }
            } catch (error) {
              console.error('Failed to delete order:', error);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'confirmed':
        return '#2196F3';
      case 'in_progress':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'pending':
        return '#9E9E9E';
      default:
        return COLORS.primary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status || 'pending') },
              ]}
            >
              <Text style={styles.statusText}>
                {(order.status || 'pending').toUpperCase()}
              </Text>
            </View>
          </View>
          {order.orderId && (
            <Text style={styles.orderIdText}>Order ID: {order.orderId}</Text>
          )}
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Package size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cylinder Size</Text>
                <Text style={styles.infoValue}>{order.cylinderSize}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>{order.quantity}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Refill Amount</Text>
              <Text style={styles.infoValue}>GHS {order.refillAmount}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Fee</Text>
              <Text style={styles.infoValue}>GHS {order.deliveryFee}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount</Text>
              <Text style={[styles.infoValue, styles.totalAmount]}>
                GHS {order.totalAmount}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Pickup Address</Text>
                <Text style={styles.infoValue}>
                  {order.pickupAddress || 'LPG Station'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Drop Off Address</Text>
                <Text style={styles.infoValue}>
                  {order.dropOffAddress || order.deliveryAddress}
                </Text>
              </View>
            </View>
            {order.scheduledDate && (
              <View style={styles.infoRow}>
                <Calendar size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Scheduled Date</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(order.scheduledDate)}
                  </Text>
                </View>
              </View>
            )}
            {order.scheduledTime && (
              <View style={styles.infoRow}>
                <Clock size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Scheduled Time</Text>
                  <Text style={styles.infoValue}>
                    {formatTime(order.scheduledTime)}
                  </Text>
                </View>
              </View>
            )}
            {delivery && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Delivery Status</Text>
                  <View
                    style={[
                      styles.deliveryStatusBadge,
                      {
                        backgroundColor: getStatusColor(delivery.status),
                      },
                    ]}
                  >
                    <Text style={styles.deliveryStatusText}>
                      {delivery.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {delivery.estimatedDeliveryTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estimated Delivery</Text>
                    <Text style={styles.infoValue}>
                      {new Date(
                        delivery.estimatedDeliveryTime
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Receiver Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receiver Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Receiver Name</Text>
              <Text style={styles.infoValue}>
                {order.receiverName || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Receiver Phone</Text>
                <Text style={styles.infoValue}>
                  {order.receiverPhone || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        {payment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <CreditCard size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Payment Method</Text>
                  <Text style={styles.infoValue}>
                    {payment.paymentMethod || order.paymentMethod || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Status</Text>
                <View
                  style={[
                    styles.paymentStatusBadge,
                    { backgroundColor: getStatusColor(payment.status) },
                  ]}
                >
                  <Text style={styles.paymentStatusText}>
                    {payment.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Amount Paid</Text>
                <Text style={styles.infoValue}>
                  {payment.currency} {payment.amount}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <X size={20} color="white" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Option */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteOrder}
          >
            <Trash2 size={20} color="white" />
            <Text style={styles.deleteButtonText}>Delete Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkBackground,
    padding: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.lightGray,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: 'white',
  },
  orderIdText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.primary,
  },
  deliveryStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryStatusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: 'white',
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: 'white',
  },
  notesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});
