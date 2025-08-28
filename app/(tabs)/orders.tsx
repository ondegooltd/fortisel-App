import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import OrderMap from '@/components/OrderMap';

type OrderTab = 'recent' | 'scheduled' | 'older';

interface Order {
  id: string;
  date: string;
  time: string;
  pickupAddress: string;
  dropOffAddress: string;
  cylinderSize: string;
  amount: number;
  paymentMethod: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    date: 'October 30',
    time: '10:00am',
    pickupAddress: 'LPG Station',
    dropOffAddress: 'UCC First Gate',
    cylinderSize: '5KG',
    amount: 150,
    paymentMethod: 'Cash On Pick',
  },
  {
    id: '2',
    date: 'October 28',
    time: '11:30am',
    pickupAddress: 'LPG Station',
    dropOffAddress: 'UCC First Gate',
    cylinderSize: '5KG',
    amount: 150,
    paymentMethod: 'Cash On Pick',
  }
];

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderTab>('recent');

  const renderTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => setActiveTab('recent')}
      >
        <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>Recent</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
        onPress={() => setActiveTab('scheduled')}
      >
        <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>Scheduled</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'older' && styles.activeTab]}
        onPress={() => setActiveTab('older')}
      >
        <Text style={[styles.tabText, activeTab === 'older' && styles.activeTabText]}>Older</Text>
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
            title: "Your Location"
          }
        ]}
      />
    </View>
  );

  const renderOrderCard = (order: Order) => (
    <View style={styles.orderCard} key={order.id}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{order.date}</Text>
        <Text style={styles.orderTime}>{order.time}</Text>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Orders</Text>
      </View>
      
      {renderTabs()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'recent' && (
          <>
            {renderMap()}
            {mockOrders.map(order => renderOrderCard(order))}
          </>
        )}
        
        {activeTab === 'scheduled' && (
          <View style={styles.emptyState}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.emptyStateImage}
            />
            <Text style={styles.emptyStateText}>No scheduled orders</Text>
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={() => router.push('/schedule')}
            >
              <Text style={styles.scheduleButtonText}>Schedule a Delivery</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'older' && (
          <View>
            {mockOrders.map(order => renderOrderCard(order))}
          </View>
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
    padding: 15,
    backgroundColor: '#2A2A2A',
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
});