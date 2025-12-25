import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { COLORS } from '@/constants/colors';
import {
  MapPin,
  Map,
  Plus,
  Minus,
  ChevronDown,
  Phone,
  ArrowLeft,
  Calendar,
} from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';
import { useCylinders } from '@/hooks/useApi';
import { Cylinder, CylinderSize } from '@/utils/api';

interface CylinderOption {
  label: string;
  value: CylinderSize;
  deliveryFee: number;
  description?: string;
}

const momoProviders = ['MTN', 'Telecel', 'AirtelTigo'];

const momoProviderLogos: Record<string, string> = {
  MTN: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/MTN_Logo.svg',
  Telecel:
    'https://seeklogo.com/images/T/telecel-logo-6B1B6B6B2B-seeklogo.com.png',
  AirtelTigo:
    'https://upload.wikimedia.org/wikipedia/commons/2/2e/AirtelTigo_logo.png',
};

export default function RequestScreen() {
  const { size, deliveryFee } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropOffAddress, setDropOffAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [refillAmount, setRefillAmount] = useState('');
  const [cylinderOptions, setCylinderOptions] = useState<CylinderOption[]>([]);
  const [loadingCylinders, setLoadingCylinders] = useState(true);
  const [selectedCylinderSize, setSelectedCylinderSize] =
    useState<CylinderOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash On Pickup');
  const [selectedMomoProvider, setSelectedMomoProvider] = useState('MTN');
  const [notes, setNotes] = useState('');
  const [showCylinderModal, setShowCylinderModal] = useState(false);
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);

  const { getCylinders } = useCylinders();
  const getCylindersRef = useRef(getCylinders.execute);

  // Update ref when getCylinders changes
  useEffect(() => {
    getCylindersRef.current = getCylinders.execute;
  }, [getCylinders.execute]);

  const getCylinderLabel = (cylinderSize: CylinderSize): string => {
    const labels: Record<CylinderSize, string> = {
      smallest: '5kg-8kg (Smallest Size)',
      small: '9kg-12kg (Small Size)',
      medium: '13kg-16kg (Medium Size)',
      big: '17kg-20kg (Big Size)',
      large: '21kg-24kg (Large Size)',
      commercial: '25kg-30kg (Largest/Commercial Size)',
    };
    return labels[cylinderSize] || cylinderSize;
  };

  const loadCylinders = useCallback(async () => {
    try {
      setLoadingCylinders(true);
      const result = await getCylindersRef.current();
      if (result?.success && result.data && Array.isArray(result.data)) {
        // Transform backend cylinders to match UI format
        const transformed: CylinderOption[] = result.data.map(
          (cylinder: Cylinder) => ({
            label: getCylinderLabel(cylinder.size),
            value: cylinder.size,
            deliveryFee: cylinder.deliveryFee,
            description: cylinder.description,
          })
        );
        setCylinderOptions(transformed);

        // Set initial selected cylinder if not already set or if size param changed
        if (transformed.length > 0) {
          // If size param is provided, find matching cylinder
          if (size) {
            const matchingCylinder = transformed.find((c) => c.value === size);
            if (matchingCylinder) {
              setSelectedCylinderSize(matchingCylinder);
            } else if (!selectedCylinderSize) {
              setSelectedCylinderSize(transformed[0]);
            }
          } else if (!selectedCylinderSize) {
            setSelectedCylinderSize(transformed[0]);
          }
        }
      } else {
        console.warn('Failed to load cylinders: Invalid response');
      }
    } catch (error) {
      console.error('Failed to load cylinders:', error);
    } finally {
      setLoadingCylinders(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]); // Only depend on size param, not selectedCylinderSize to avoid infinite loop

  // Load cylinders on initial mount
  useEffect(() => {
    loadCylinders();
  }, [loadCylinders]);

  // Reload cylinders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCylinders();
    }, [loadCylinders])
  );

  const currentDeliveryFee = selectedCylinderSize
    ? selectedCylinderSize.deliveryFee * quantity
    : 0;
  const currentRefillAmount = (parseFloat(refillAmount) || 0) * quantity;
  const totalAmount = currentRefillAmount + currentDeliveryFee;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleMakeRequest = () => {
    // Validate required fields
    if (!receiverName || !receiverPhone || !dropOffAddress) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Validate refillAmount
    if (!refillAmount || parseFloat(refillAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid refill amount');
      return;
    }

    // Ensure all required numeric fields are valid
    const finalRefillAmount =
      currentRefillAmount > 0
        ? currentRefillAmount
        : parseFloat(refillAmount) || 0.01;
    const finalTotalAmount =
      totalAmount > 0 ? totalAmount : finalRefillAmount + currentDeliveryFee;

    if (!selectedCylinderSize) {
      Alert.alert('Missing Information', 'Please select a cylinder size');
      return;
    }

    // Navigate to summary screen WITHOUT creating order
    // Order will be created when user confirms on summary screen
    router.push({
      pathname: '/summary',
      params: {
        // Pass order data as params (order will be created on summary screen)
        cylinderSize: selectedCylinderSize.value, // Enum value for backend
        cylinderSizeLabel: selectedCylinderSize.label, // Display label
        quantity: quantity.toString(),
        refillAmount: finalRefillAmount.toString(),
        deliveryFee: currentDeliveryFee.toString(),
        totalAmount: finalTotalAmount.toString(),
        pickupAddress: pickupAddress || '',
        dropOffAddress: dropOffAddress,
        receiverName: receiverName,
        receiverPhone: receiverPhone,
        paymentMethod:
          paymentMethod === 'Cash On Pickup' ? 'cash' : 'mobile_money',
        notes: notes || '',
        isScheduled: 'false',
      },
    });
  };

  const handlePaystackSuccess = () => {
    setShowPaystackModal(false);
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Request</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/(tabs)/schedule')}
        >
          <Text style={styles.tabText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pickup Address *</Text>
          <View style={styles.inputContainer}>
            <MapPin
              size={20}
              color={COLORS.darkText}
              style={styles.inputIcon}
            />
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
          {loadingCylinders ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Loading cylinder options...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectionBox}
              onPress={() => setShowCylinderModal(true)}
              disabled={!selectedCylinderSize}
            >
              <Text style={styles.selectionText}>
                {selectedCylinderSize?.label || 'Select cylinder size'}
              </Text>
              <ChevronDown size={20} color={COLORS.darkText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Multiple refill</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus
                size={20}
                color={quantity <= 1 ? '#999' : COLORS.darkText}
              />
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
          <Text style={styles.label}>
            Delivery Fee: GHS {currentDeliveryFee}
          </Text>
          <Text style={styles.label}>
            Total Amount: GHS {totalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Option</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Cash On Pickup' &&
                  styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod('Cash On Pickup')}
            >
              <Text style={styles.paymentOptionText}>Cash On Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Momo' && styles.selectedPaymentOption,
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Receiver</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#999"
                value={receiverName}
                onChangeText={setReceiverName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
              />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions?"
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.requestButton,
            (!receiverName ||
              !receiverPhone ||
              !dropOffAddress ||
              !selectedCylinderSize ||
              !refillAmount ||
              parseFloat(refillAmount) <= 0) &&
              styles.disabledButton,
          ]}
          onPress={handleMakeRequest}
          disabled={
            !receiverName ||
            !receiverPhone ||
            !dropOffAddress ||
            !selectedCylinderSize ||
            !refillAmount ||
            parseFloat(refillAmount) <= 0
          }
        >
          <Text style={styles.requestButtonText}>Make Request</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Cylinder Size Modal */}
      <Modal
        visible={showCylinderModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Cylinder Size</Text>
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {loadingCylinders ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>
                    Loading cylinder options...
                  </Text>
                </View>
              ) : cylinderOptions.length === 0 ? (
                <View style={styles.modalLoadingContainer}>
                  <Text style={styles.loadingText}>
                    No cylinder options available
                  </Text>
                </View>
              ) : (
                cylinderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      selectedCylinderSize?.value === option.value &&
                        styles.selectedModalOption,
                    ]}
                    onPress={() => {
                      setSelectedCylinderSize(option);
                      setShowCylinderModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                    <Text style={styles.modalOptionFee}>
                      Delivery: GHS {option.deliveryFee}
                    </Text>
                    {option.description && (
                      <Text
                        style={styles.modalOptionDescription}
                        numberOfLines={2}
                      >
                        {option.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
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
      <Modal visible={showMomoModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Momo Provider</Text>
            {momoProviders.map((provider) => (
              <TouchableOpacity
                key={provider}
                style={[
                  styles.modalOption,
                  selectedMomoProvider === provider &&
                    styles.selectedModalOption,
                ]}
                onPress={() => {
                  setSelectedMomoProvider(provider);
                  setShowMomoModal(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: momoProviderLogos[provider] }}
                    style={{
                      width: 32,
                      height: 32,
                      marginRight: 10,
                      borderRadius: 6,
                      backgroundColor: '#eee',
                    }}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalOptionText}>{provider}</Text>
                </View>
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
              Your refill request has been successfully made, you will receive a
              phone call in the next 5 minutes to confirm your request. If it
              delays, call customer support on 0205400925.
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
  formGroup: {
    marginBottom: 20,
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
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    height: 100,
  },
  selectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 60,
  },
  selectionText: {
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
  requestButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  requestButtonText: {
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
  modalOptionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.6,
    marginTop: 4,
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
  },
  modalLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
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
  modalScrollView: {
    maxHeight: 300,
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
});
