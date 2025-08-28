import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { Calendar, Clock, ChevronDown, Map, User, Phone, MapPin, Plus, Minus } from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';
import { useOrders } from '@/hooks/useApi';

const cylinderSizeOptions = [
  { label: '5kg-8kg (Smallest Size)', value: '5kg-8kg', deliveryFee: 20 },
  { label: '9kg-12kg (Small Size)', value: '9kg-12kg', deliveryFee: 20 },
  { label: '13kg-16kg (Medium Size)', value: '13kg-16kg', deliveryFee: 25 },
  { label: '17kg-20kg (Big Size)', value: '17kg-20kg', deliveryFee: 32 },
  { label: '21kg-24kg (Large Size)', value: '21kg-24kg', deliveryFee: 35 },
  { label: '25kg-30kg (Largest/Commercial Size)', value: '25kg-30kg', deliveryFee: 40 },
];

const momoProviders = ['MTN', 'Telecel', 'AirtelTigo'];

const timeOptions = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function ScheduleScreen() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropOffAddress, setDropOffAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [refillAmount, setRefillAmount] = useState('');
  const [selectedCylinderSize, setSelectedCylinderSize] = useState(cylinderSizeOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash On Pickup');
  const [selectedMomoProvider, setSelectedMomoProvider] = useState('MTN');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showCylinderModal, setShowCylinderModal] = useState(false);
  const [showMomoModal, setShowMomoModal] = useState(false);

  const currentDeliveryFee = selectedCylinderSize.deliveryFee * quantity;
  const currentRefillAmount = (parseFloat(refillAmount) || 0) * quantity;
  const totalAmount = currentRefillAmount + currentDeliveryFee;

  const { createOrder } = useOrders();

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        value: date.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const handleScheduleNow = async () => {
    if (!receiverName || !receiverPhone || !pickupAddress || !dropOffAddress || !refillAmount || !date || !time) {
      Alert.alert('Missing Information', 'Please fill in all required fields including scheduled date and time');
      return;
    }

    const orderData = {
      cylinderSize: selectedCylinderSize.label,
      quantity: quantity,
      refillAmount: currentRefillAmount,
      deliveryFee: currentDeliveryFee,
      totalAmount: totalAmount,
      receiverName: receiverName,
      receiverPhone: receiverPhone,
      deliveryAddress: pickupAddress,
      notes: '', // No notes field in this form
      scheduledDate: date,
      scheduledTime: time,
    };

    const result = await createOrder.execute(orderData);
    if (result?.success && result.data) {
      router.push({
        pathname: '/summary',
        params: { 
          orderId: result.data.orderId,
          cylinderSize: selectedCylinderSize.label,
          quantity: quantity.toString(),
          refillAmount: currentRefillAmount.toString(),
          deliveryFee: currentDeliveryFee.toString(),
          totalAmount: totalAmount.toString(),
          receiverName: receiverName,
          receiverPhone: receiverPhone,
          deliveryAddress: pickupAddress,
          notes: '',
          scheduledDate: date,
          scheduledTime: time,
          isScheduled: 'true'
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule Delivery</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab} onPress={() => router.push('/(tabs)/request')}>
          <Text style={styles.tabText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Schedule Refill</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Choose a date *</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowDateModal(true)}
            >
              <Calendar size={20} color={COLORS.darkText} style={styles.inputIcon} />
              <Text style={[styles.input, !date && styles.placeholder]}>
                {date ? new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Select Date'}
              </Text>
              <ChevronDown size={20} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowTimeModal(true)}
            >
              <Clock size={20} color={COLORS.darkText} style={styles.inputIcon} />
              <Text style={styles.input}>{time}</Text>
              <ChevronDown size={20} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pickup Address *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.darkText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter pickup location"
                placeholderTextColor="#999"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Drop Off Address *</Text>
            <View style={styles.inputContainer}>
              <Map size={20} color={COLORS.darkText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter drop off location"
                placeholderTextColor="#999"
                value={dropOffAddress}
                onChangeText={setDropOffAddress}
              />
            </View>
          </View>

          {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.darkText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View> */}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Refill Amount (GHS) *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter amount to refill"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={refillAmount}
                onChangeText={setRefillAmount}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cylinder Size</Text>
            <TouchableOpacity 
              style={styles.selectInput}
              onPress={() => setShowCylinderModal(true)}
            >
              <Text style={styles.selectText}>{selectedCylinderSize.label}</Text>
              <ChevronDown size={20} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Multiple refill</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} color={quantity <= 1 ? '#999' : COLORS.darkText} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Plus size={20} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Delivery Fee: GHS {currentDeliveryFee}</Text>
            <Text style={styles.label}>Total Amount: GHS {totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Option</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity 
                style={[
                  styles.paymentOption, 
                  paymentMethod === 'Cash On Pickup' && styles.selectedPaymentOption
                ]}
                onPress={() => setPaymentMethod('Cash On Pickup')}
              >
                <Text style={styles.paymentOptionText}>Cash On Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.paymentOption, 
                  paymentMethod === 'Momo' && styles.selectedPaymentOption
                ]}
                onPress={() => {
                  setPaymentMethod('Momo');
                  setShowMomoModal(true);
                }}
              >
                <Text style={styles.paymentOptionText}>Momo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.receiverSection}>
            <Text style={styles.subsectionTitle}>Receiver <Text style={{color: 'red'}}>*</Text></Text>
            
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <User size={20} color={COLORS.darkText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name *"
                  placeholderTextColor="#999"
                  value={receiverName}
                  onChangeText={setReceiverName}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <Phone size={20} color={COLORS.darkText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number *"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={receiverPhone}
                  onChangeText={setReceiverPhone}
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scheduleButton, (!receiverName || !receiverPhone || !pickupAddress || !dropOffAddress || !refillAmount || !date || !time || createOrder.loading) && styles.disabledButton]}
          onPress={handleScheduleNow}
          disabled={!receiverName || !receiverPhone || !pickupAddress || !dropOffAddress || !refillAmount || !date || !time || createOrder.loading}
        >
          <Text style={styles.scheduleButtonText}>
            {createOrder.loading ? 'Scheduling Order...' : 'Schedule Now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <ScrollView style={styles.modalScrollView}>
              {generateDateOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    date === option.value && styles.selectedModalOption
                  ]}
                  onPress={() => {
                    setDate(option.value);
                    setShowDateModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  time === option && styles.selectedModalOption
                ]}
                onPress={() => {
                  setTime(option);
                  setShowTimeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cylinder Size Modal */}
      <Modal
        visible={showCylinderModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Cylinder Size</Text>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {cylinderSizeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    selectedCylinderSize.value === option.value && styles.selectedModalOption
                  ]}
                  onPress={() => {
                    setSelectedCylinderSize(option);
                    setShowCylinderModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                  <Text style={styles.modalOptionFee}>Delivery: GHS {option.deliveryFee}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowCylinderModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Momo Provider Modal */}
      <Modal
        visible={showMomoModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Momo Provider</Text>
            {momoProviders.map((provider) => (
              <TouchableOpacity
                key={provider}
                style={[
                  styles.modalOption,
                  selectedMomoProvider === provider && styles.selectedModalOption
                ]}
                onPress={() => {
                  setSelectedMomoProvider(provider);
                  setShowMomoModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{provider}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowMomoModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
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
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scheduleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 15,
  },
  subsectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 15,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 60,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
  },
  placeholder: {
    color: '#999',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 60,
  },
  selectText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: COLORS.darkText,
    paddingHorizontal: 20,
  },
  paymentOptions: {
    flexDirection: 'row',
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
  },
  selectedPaymentOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#f9e6e7',
  },
  paymentOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkText,
  },
  receiverSection: {
    marginTop: 20,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  scheduleButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
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
    maxHeight: '70%',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedModalOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#f9e6e7',
  },
  modalOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
  },
  modalOptionFee: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});