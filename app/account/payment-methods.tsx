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
  CreditCard,
  Trash2,
  Edit,
  Check,
  X,
} from 'lucide-react-native';
import { paymentMethodsApi, PaymentMethod } from '@/utils/api';

// Remove duplicate interface - using imported PaymentMethod from api.ts

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'card' as 'card' | 'mobile_money',
    name: '',
    number: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const result = await paymentMethodsApi.getPaymentMethods();
      if (result?.success && result.data) {
        setPaymentMethods(result.data);
      } else {
        Alert.alert('Error', 'Failed to load payment methods');
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = () => {
    setFormData({
      type: 'card',
      name: '',
      number: '',
      expiryDate: '',
      cvv: '',
    });
    setEditingMethod(null);
    setShowAddModal(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setFormData({
      type: method.type,
      name: method.name,
      number: method.number,
      expiryDate: '',
      cvv: '',
    });
    setEditingMethod(method);
    setShowAddModal(true);
  };

  const handleDeleteMethod = (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await paymentMethodsApi.deletePaymentMethod(
                methodId
              );
              if (result?.success) {
                setPaymentMethods((prev) =>
                  prev.filter((method) => method._id !== methodId)
                );
                Alert.alert('Success', 'Payment method deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete payment method');
              }
            } catch (error) {
              console.error('Failed to delete payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const result = await paymentMethodsApi.setDefaultPaymentMethod(methodId);
      if (result?.success) {
        setPaymentMethods((prev) =>
          prev.map((method) => ({
            ...method,
            isDefault: method._id === methodId,
          }))
        );
        Alert.alert('Success', 'Default payment method updated');
      } else {
        Alert.alert('Error', 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  const handleSaveMethod = async () => {
    if (!formData.name.trim() || !formData.number.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingMethod) {
        // Update existing method
        const result = await paymentMethodsApi.updatePaymentMethod(
          editingMethod._id,
          {
            name: formData.name,
            number: formData.number,
            type: formData.type,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
          }
        );
        if (result?.success && result.data) {
          setPaymentMethods((prev) =>
            prev.map((method) =>
              method._id === editingMethod._id
                ? (result.data as PaymentMethod)
                : method
            )
          );
          Alert.alert('Success', 'Payment method updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update payment method');
        }
      } else {
        // Add new method
        const result = await paymentMethodsApi.createPaymentMethod({
          type: formData.type,
          name: formData.name,
          number: formData.number,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          isDefault: paymentMethods.length === 0,
        });
        if (result?.success && result.data) {
          setPaymentMethods((prev) => [...prev, result.data as PaymentMethod]);
          Alert.alert('Success', 'Payment method added successfully');
        } else {
          Alert.alert('Error', 'Failed to add payment method');
        }
      }
      setShowAddModal(false);
      setEditingMethod(null);
    } catch (error) {
      console.error('Failed to save payment method:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method._id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodInfo}>
        <View style={styles.paymentMethodHeader}>
          <CreditCard size={24} color={COLORS.primary} />
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodName}>{method.name}</Text>
            <Text style={styles.paymentMethodNumber}>{method.number}</Text>
          </View>
        </View>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.paymentMethodActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(method._id)}
          >
            <Check size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditMethod(method)}
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteMethod(method._id)}
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={handleAddMethod}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>
              Add a payment method to make orders easier
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddMethod}
            >
              <Text style={styles.addFirstButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
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
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'card' && styles.typeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: 'card' }))
                    }
                  >
                    <CreditCard
                      size={20}
                      color={
                        formData.type === 'card' ? 'white' : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'card' &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      Card
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'mobile_money' &&
                        styles.typeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: 'mobile_money' }))
                    }
                  >
                    <CreditCard
                      size={20}
                      color={
                        formData.type === 'mobile_money'
                          ? 'white'
                          : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'mobile_money' &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      Mobile Money
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {formData.type === 'card' ? 'Card Name' : 'Provider Name'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    formData.type === 'card'
                      ? 'e.g., Visa, Mastercard'
                      : 'e.g., MTN, Vodafone'
                  }
                  placeholderTextColor={COLORS.lightGray}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {formData.type === 'card' ? 'Card Number' : 'Phone Number'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    formData.type === 'card'
                      ? '1234 5678 9012 3456'
                      : '+233 20 123 4567'
                  }
                  placeholderTextColor={COLORS.lightGray}
                  value={formData.number}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, number: text }))
                  }
                  keyboardType={
                    formData.type === 'card' ? 'numeric' : 'phone-pad'
                  }
                />
              </View>

              {formData.type === 'card' && (
                <>
                  <View style={styles.row}>
                    <View
                      style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}
                    >
                      <Text style={styles.label}>Expiry Date</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/YY"
                        placeholderTextColor={COLORS.lightGray}
                        value={formData.expiryDate}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, expiryDate: text }))
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View
                      style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}
                    >
                      <Text style={styles.label}>CVV</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="123"
                        placeholderTextColor={COLORS.lightGray}
                        value={formData.cvv}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, cvv: text }))
                        }
                        keyboardType="numeric"
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              )}
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
                onPress={handleSaveMethod}
              >
                <Text style={styles.saveButtonText}>
                  {editingMethod ? 'Update' : 'Add'} Method
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
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 2,
  },
  paymentMethodNumber: {
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
  paymentMethodActions: {
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
    maxHeight: '80%',
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
  row: {
    flexDirection: 'row',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
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
