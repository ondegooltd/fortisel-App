import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';
import { ChevronRight } from 'lucide-react-native';
import { useCylinders } from '@/hooks/useApi';
import { Cylinder, CylinderSize } from '@/utils/api';

interface CylinderOption {
  id: string;
  title: string;
  deliveryFee: number;
  weight: string;
  size: CylinderSize;
  description?: string;
}

const defaultCylinderOptions: Record<CylinderSize, CylinderOption> = {
  smallest: {
    id: 'smallest',
    title: 'Smallest Size',
    deliveryFee: 15,
    weight: 'Delivery Fee: GHS 15',
    size: 'smallest',
  },
  small: {
    id: 'small',
    title: 'Small Size',
    deliveryFee: 20,
    weight: 'Delivery Fee: GHS 20',
    size: 'small',
  },
  medium: {
    id: 'medium',
    title: 'Medium Size',
    deliveryFee: 25,
    weight: 'Delivery Fee: GHS 25',
    size: 'medium',
  },
  big: {
    id: 'big',
    title: 'Big Size',
    deliveryFee: 32,
    weight: 'Delivery Fee: GHS 32',
    size: 'big',
  },
  large: {
    id: 'large',
    title: 'Large Size',
    deliveryFee: 35,
    weight: 'Delivery Fee: GHS 35',
    size: 'large',
  },
  commercial: {
    id: 'commercial',
    title: 'Largest/Commercial Size',
    deliveryFee: 40,
    weight: 'Delivery Fee: GHS 40',
    size: 'commercial',
  },
};

export default function HomeScreen() {
  const [selectedSize, setSelectedSize] = useState<CylinderSize | null>(null);
  const [cylinderOptions, setCylinderOptions] = useState<CylinderOption[]>(
    Object.values(defaultCylinderOptions)
  );
  const [loading, setLoading] = useState(true);
  const { getCylinders } = useCylinders();
  const getCylindersRef = useRef(getCylinders.execute);

  // Update ref when getCylinders changes
  useEffect(() => {
    getCylindersRef.current = getCylinders.execute;
  }, [getCylinders.execute]);

  const getCylinderTitle = (size: CylinderSize): string => {
    const titles: Record<CylinderSize, string> = {
      smallest: 'Smallest Size',
      small: 'Small Size',
      medium: 'Medium Size',
      big: 'Big Size',
      large: 'Large Size',
      commercial: 'Largest/Commercial Size',
    };
    return titles[size] || size;
  };

  const loadCylinders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCylindersRef.current();
      if (result?.success && result.data && Array.isArray(result.data)) {
        // Transform backend cylinders to match UI format
        const transformed = result.data.map((cylinder: Cylinder) => ({
          id: cylinder.size,
          title: getCylinderTitle(cylinder.size),
          deliveryFee: cylinder.deliveryFee,
          weight: `Delivery Fee: GHS ${cylinder.deliveryFee}`,
          size: cylinder.size,
          description: cylinder.description,
        }));
        setCylinderOptions(transformed);
      } else {
        // Fallback to default options if API fails
        setCylinderOptions(Object.values(defaultCylinderOptions));
      }
    } catch (error) {
      console.error('Failed to load cylinders:', error);
      // Fallback to default options on error
      setCylinderOptions(Object.values(defaultCylinderOptions));
    } finally {
      setLoading(false);
    }
  }, []); // Stable - uses ref

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

  const handleCylinderSelect = (size: CylinderSize) => {
    const selectedOption = cylinderOptions.find((opt) => opt.size === size);
    if (selectedOption) {
      router.push({
        pathname: '/request',
        params: {
          size,
          deliveryFee: selectedOption.deliveryFee.toString(),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.headerTitle}>Refill Your</Text>
          <Text style={styles.headerTitle}>LPG Cylinder</Text>
        </View>
        <Image
          source={{
            uri: 'https://drive.google.com/uc?export=view&id=1Ku-BIxFmYFvPb4NBF4J8xY_cTnB92xqf',
          }}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            Choose a Cylinder Size,by tapping on any below
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Loading cylinder options...
              </Text>
            </View>
          ) : (
            cylinderOptions.map((option) => {
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.cylinderOption,
                    selectedSize === option.size && styles.selectedOption,
                  ]}
                  onPress={() => handleCylinderSelect(option.size)}
                >
                  <View style={styles.optionContent}>
                    <Image
                      source={{
                        uri: 'https://drive.google.com/uc?export=view&id=1Ku-BIxFmYFvPb4NBF4J8xY_cTnB92xqf',
                      }}
                      style={styles.cylinderIcon}
                    />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionPrice}>{option.weight}</Text>
                      {option.description && (
                        <Text
                          style={styles.optionDescription}
                          numberOfLines={2}
                        >
                          {option.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  {selectedSize === option.size && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: 'white',
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 15,
  },
  cylinderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 15,
    marginBottom: 10,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cylinderIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 8,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 4,
  },
  optionPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.6,
    lineHeight: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  statusContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusIcon: {
    fontSize: 30,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 5,
  },
  makeRequestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
    marginTop: 12,
  },
});
