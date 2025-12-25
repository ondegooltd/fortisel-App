import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import {
  ArrowLeft,
  Plus,
  MapPin,
  Trash2,
  Edit,
  Check,
  X,
  Home,
  Building,
  Navigation,
} from 'lucide-react-native';
import { deliveryAddressesApi, DeliveryAddress } from '@/utils/api';

// Remove duplicate interface - using imported DeliveryAddress from api.ts

export default function DeliveryAddressesScreen() {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    name: '',
    address: '',
    city: '',
    region: '',
    phone: '',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await deliveryAddressesApi.getDeliveryAddresses();
      if (result?.success && result.data) {
        setAddresses(result.data);
      } else {
        Alert.alert('Error', 'Failed to load delivery addresses');
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      Alert.alert('Error', 'Failed to load delivery addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setFormData({
      type: 'home',
      name: '',
      address: '',
      city: '',
      region: '',
      phone: '',
    });
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setFormData({
      type: address.type,
      name: address.name,
      address: address.address,
      city: address.city,
      region: address.region,
      phone: address.phone,
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deliveryAddressesApi.deleteDeliveryAddress(
                addressId
              );
              if (result?.success) {
                setAddresses((prev) =>
                  prev.filter((address) => address._id !== addressId)
                );
                Alert.alert('Success', 'Delivery address deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete delivery address');
              }
            } catch (error) {
              console.error('Failed to delete delivery address:', error);
              Alert.alert('Error', 'Failed to delete delivery address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await deliveryAddressesApi.setDefaultDeliveryAddress(
        addressId
      );
      if (result?.success) {
        setAddresses((prev) =>
          prev.map((address) => ({
            ...address,
            isDefault: address._id === addressId,
          }))
        );
        Alert.alert('Success', 'Default delivery address updated');
      } else {
        Alert.alert('Error', 'Failed to set default delivery address');
      }
    } catch (error) {
      console.error('Failed to set default delivery address:', error);
      Alert.alert('Error', 'Failed to set default delivery address');
    }
  };

  const handleSaveAddress = async () => {
    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.region.trim() ||
      !formData.phone.trim()
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing address
        const result = await deliveryAddressesApi.updateDeliveryAddress(
          editingAddress._id,
          {
            type: formData.type,
            name: formData.name,
            address: formData.address,
            city: formData.city,
            region: formData.region,
            phone: formData.phone,
          }
        );
        if (result?.success && result.data) {
          setAddresses((prev) =>
            prev.map((address) =>
              address._id === editingAddress._id
                ? (result.data as DeliveryAddress)
                : address
            )
          );
          Alert.alert('Success', 'Delivery address updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update delivery address');
        }
      } else {
        // Add new address
        const result = await deliveryAddressesApi.createDeliveryAddress({
          type: formData.type,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          phone: formData.phone,
          isDefault: addresses.length === 0,
        });
        if (result?.success && result.data) {
          setAddresses((prev) => [...prev, result.data as DeliveryAddress]);
          Alert.alert('Success', 'Delivery address added successfully');
        } else {
          Alert.alert('Error', 'Failed to add delivery address');
        }
      }
      setShowAddModal(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to save delivery address:', error);
      Alert.alert('Error', 'Failed to save delivery address');
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={24} color={COLORS.primary} />;
      case 'work':
        return <Building size={24} color={COLORS.primary} />;
      default:
        return <Navigation size={24} color={COLORS.primary} />;
    }
  };

  const renderAddress = (address: DeliveryAddress) => (
    <View key={address._id} style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <View style={styles.addressHeader}>
          {getAddressIcon(address.type)}
          <View style={styles.addressDetails}>
            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
            <Text style={styles.addressLocation}>
              {address.city}, {address.region}
            </Text>
            <Text style={styles.addressPhone}>{address.phone}</Text>
          </View>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(address._id)}
          >
            <Check size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAddress(address)}
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(address._id)}
        >
          <Trash2 size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No Delivery Addresses</Text>
            <Text style={styles.emptySubtitle}>
              Add a delivery address to make ordering easier
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddAddress}
            >
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map(renderAddress)}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'home' && styles.typeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: 'home' }))
                    }
                  >
                    <Home
                      size={20}
                      color={
                        formData.type === 'home' ? 'white' : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'home' &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      Home
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'work' && styles.typeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: 'work' }))
                    }
                  >
                    <Building
                      size={20}
                      color={
                        formData.type === 'work' ? 'white' : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'work' &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      Work
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'other' && styles.typeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: 'other' }))
                    }
                  >
                    <Navigation
                      size={20}
                      color={
                        formData.type === 'other' ? 'white' : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'other' &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Home, Office, Apartment"
                  placeholderTextColor={COLORS.lightGray}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your street address"
                  placeholderTextColor={COLORS.lightGray}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, address: text }))
                  }
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Accra"
                    placeholderTextColor={COLORS.lightGray}
                    value={formData.city}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, city: text }))
                    }
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>Region *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Greater Accra"
                    placeholderTextColor={COLORS.lightGray}
                    value={formData.region}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, region: text }))
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+233 20 123 4567"
                  placeholderTextColor={COLORS.lightGray}
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, phone: text }))
                  }
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
              >
                <Text style={styles.saveButtonText}>
                  {editingAddress ? 'Update' : 'Add'} Address
                </Text>
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
    padding: 20,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addFirstButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  addressesList: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  addressDetails: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 4,
  },
  addressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 2,
  },
  addressLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 2,
  },
  addressPhone: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  typeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  typeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
  },
  typeOptionTextSelected: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});
