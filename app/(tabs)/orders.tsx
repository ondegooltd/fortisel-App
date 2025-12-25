import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import OrderMap from '@/components/OrderMap';
import { useOrders, useDeliveries } from '@/hooks/useApi';

type OrderTab = 'recent' | 'scheduled' | 'older';

interface Order {
  id: string;
  orderId?: string;
  date: string;
  time: string;
  pickupAddress: string;
  dropOffAddress: string;
  cylinderSize: string;
  amount: number;
  paymentMethod: string;
  status?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderTab>('recent');
  const { getUserOrders } = useOrders();
  const { getDeliveryByOrderId } = useDeliveries();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryStatuses, setDeliveryStatuses] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by authenticated user via JWT token
      const result = await getUserOrders.execute();
      if (result?.success && result.data) {
        // Transform backend orders to match UI format
        const transformedOrders = result.data.map((order: any) => ({
          id: order._id || order.id,
          orderId: order.orderId,
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
          }),
          time:
            order.scheduledTime ||
            new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
          pickupAddress: order.pickupAddress || 'LPG Station',
          dropOffAddress: order.dropOffAddress || order.deliveryAddress,
          cylinderSize: order.cylinderSize,
          amount: order.totalAmount,
          paymentMethod: order.paymentMethod || 'Cash On Pick',
          status: order.status,
          scheduledDate: order.scheduledDate,
          scheduledTime: order.scheduledTime,
        }));
        setOrders(transformedOrders);

        // Load delivery statuses for each order
        const statusPromises = transformedOrders.map(async (order: any) => {
          if (order.orderId) {
            try {
              const deliveryResult = await getDeliveryByOrderId.execute(
                order.orderId
              );
              if (deliveryResult?.success && deliveryResult.data) {
                return {
                  orderId: order.orderId,
                  status: deliveryResult.data.status,
                };
              }
            } catch (error) {
              console.error(
                `Failed to load delivery for order ${order.orderId}:`,
                error
              );
            }
          }
          return null;
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<string, string> = {};
        statuses.forEach((status) => {
          if (status) {
            statusMap[status.orderId] = status.status;
          }
        });
        setDeliveryStatuses(statusMap);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => setActiveTab('recent')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'recent' && styles.activeTabText,
          ]}
        >
          Recent
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
        onPress={() => setActiveTab('scheduled')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'scheduled' && styles.activeTabText,
          ]}
        >
          Scheduled
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'older' && styles.activeTab]}
        onPress={() => setActiveTab('older')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'older' && styles.activeTabText,
          ]}
        >
          Older
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <OrderMap
        style={styles.map}
        initialRegion={{
          latitude: 5.1215,
          longitude: -1.2795,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        markers={[
          {
            coordinate: { latitude: 5.1215, longitude: -1.2795 },
            title: 'Your Location',
          },
        ]}
      />
    </View>
  );

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/orders/[id]',
      params: { id: order.id },
    } as any);
  };

  const renderOrderCard = (order: Order) => {
    const deliveryStatus = order.orderId
      ? deliveryStatuses[order.orderId]
      : null;
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'delivered':
          return '#4CAF50';
        case 'in_transit':
          return '#2196F3';
        case 'assigned':
          return '#FF9800';
        case 'pending':
          return '#9E9E9E';
        default:
          return COLORS.primary;
      }
    };

    const getOrderStatusColor = (status: string) => {
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

    return (
      <TouchableOpacity
        style={styles.orderCard}
        key={order.id}
        onPress={() => handleOrderPress(order)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderTime}>{order.time}</Text>
            {order.scheduledDate && (
              <Text style={styles.scheduledText}>
                Scheduled:{' '}
                {new Date(order.scheduledDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                {order.scheduledTime || ''}
              </Text>
            )}
          </View>
          <View style={styles.statusBadges}>
            {order.status && (
              <View
                style={[
                  styles.orderStatusBadge,
                  { backgroundColor: getOrderStatusColor(order.status) },
                ]}
              >
                <Text style={styles.orderStatusText}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            )}
            {deliveryStatus && (
              <View
                style={[
                  styles.deliveryStatusBadge,
                  { backgroundColor: getStatusColor(deliveryStatus) },
                ]}
              >
                <Text style={styles.deliveryStatusText}>
                  {deliveryStatus.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Pickup Address</Text>
            <Text style={styles.orderValue}>{order.pickupAddress}</Text>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Drop off Location</Text>
            <Text style={styles.orderValue}>{order.dropOffAddress}</Text>
          </View>

          <View style={styles.orderRow}>
            <View style={styles.orderSubRow}>
              <Text style={styles.orderLabel}>Payment Option</Text>
              <Text style={styles.orderValue}>{order.paymentMethod}</Text>
            </View>

            <View style={styles.orderSubRow}>
              <Text style={styles.orderLabel}>Cylinder Size</Text>
              <Text style={styles.orderValue}>{order.cylinderSize}</Text>
            </View>

            <View style={styles.orderSubRow}>
              <Text style={styles.orderLabel}>Amount</Text>
              <Text style={styles.orderValue}>{order.amount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Orders</Text>
      </View>

      {renderTabs()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'recent' && (
              <>
                {renderMap()}
                {orders.length > 0 ? (
                  orders.map((order) => renderOrderCard(order))
                ) : (
                  <View style={styles.emptyState}>
                    <Image
                      source={{
                        uri: 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?auto=compress&cs=tinysrgb&w=400',
                      }}
                      style={styles.emptyStateImage}
                    />
                    <Text style={styles.emptyStateText}>No recent orders</Text>
                    <TouchableOpacity
                      style={styles.scheduleButton}
                      onPress={() => router.push('/(tabs)/request')}
                    >
                      <Text style={styles.scheduleButtonText}>
                        Make a Request
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === 'scheduled' && (
              <>
                {orders.filter(
                  (order: any) => order.scheduledDate || order.scheduledTime
                ).length > 0 ? (
                  orders
                    .filter(
                      (order: any) => order.scheduledDate || order.scheduledTime
                    )
                    .map((order) => renderOrderCard(order))
                ) : (
                  <View style={styles.emptyState}>
                    <Image
                      source={{
                        uri: 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?auto=compress&cs=tinysrgb&w=400',
                      }}
                      style={styles.emptyStateImage}
                    />
                    <Text style={styles.emptyStateText}>
                      No scheduled orders
                    </Text>
                    <TouchableOpacity
                      style={styles.scheduleButton}
                      onPress={() => router.push('/(tabs)/schedule')}
                    >
                      <Text style={styles.scheduleButtonText}>
                        Schedule a Delivery
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === 'older' && (
              <View>
                {orders.length > 0 ? (
                  orders.map((order) => renderOrderCard(order))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No older orders</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
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
    backgroundColor: COLORS.darkBackground,
    padding: 20,
    paddingBottom: 15,
  },
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkBackground,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#333',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    color: COLORS.lightGray,
    fontSize: 14,
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapContainer: {
    height: 200,
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  orderCard: {
    margin: 15,
    backgroundColor: COLORS.darkBackground,
    borderRadius: 15,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2A2A2A',
  },
  orderHeaderLeft: {
    flex: 1,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: 'white',
  },
  deliveryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryStatusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: 'white',
    textTransform: 'capitalize',
  },
  scheduledText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  orderDate: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  orderTime: {
    fontFamily: 'Inter-Regular',
    color: COLORS.lightGray,
    fontSize: 14,
  },
  orderDetails: {
    padding: 15,
  },
  orderRow: {
    marginBottom: 15,
  },
  orderSubRow: {
    marginBottom: 10,
  },
  orderLabel: {
    fontFamily: 'Inter-Regular',
    color: COLORS.lightGray,
    fontSize: 14,
    marginBottom: 2,
  },
  orderValue: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 20,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  scheduleButtonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
  },
});
