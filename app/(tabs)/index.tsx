import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';
import { ChevronRight } from 'lucide-react-native';

type CylinderSize = 'smallest' | 'small' | 'medium' | 'big' | 'large' | 'commercial';

interface CylinderOption {
  id: string;
  title: string;
  deliveryFee: number;
  weight: string;
}

const cylinderOptions: Record<CylinderSize, CylinderOption> = {
  smallest: { id: 'smallest', title: 'Smallest Size', deliveryFee: 15, weight: 'Delivery Fee: GHS 15' },
  small: { id: 'small', title: 'Small Size', deliveryFee: 20, weight: 'Delivery Fee: GHS 20' },
  medium: { id: 'medium', title: 'Medium Size', deliveryFee: 25, weight: 'Delivery Fee: GHS 25' },
  big: { id: 'big', title: 'Big Size', deliveryFee: 32, weight: 'Delivery Fee: GHS 32' },
  large: { id: 'large', title: 'Large Size', deliveryFee: 35, weight: 'Delivery Fee: GHS 35'},
  commercial: { id: 'commercial', title: 'Largest/Commercial Size', deliveryFee: 40, weight: 'Delivery Fee: GHS 40' }
};

export default function HomeScreen() {
  const [selectedSize, setSelectedSize] = useState<CylinderSize | null>(null);

  const handleCylinderSelect = (size: CylinderSize) => {
    router.push({
      pathname: '/request',
      params: {
        size,
        deliveryFee: cylinderOptions[size].deliveryFee
      }
    });
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
          source={{ uri: 'https://drive.google.com/uc?export=view&id=1Ku-BIxFmYFvPb4NBF4J8xY_cTnB92xqf' }}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Choose a Cylinder Size,by tapping on any below</Text>
          
          {Object.keys(cylinderOptions).map((size) => {
            const option = cylinderOptions[size as CylinderSize];
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.cylinderOption,
                  selectedSize === size && styles.selectedOption
                ]}
                onPress={() => handleCylinderSelect(size as CylinderSize)}
              >
                <View style={styles.optionContent}>
                  <Image 
                    source={{ uri: 'https://drive.google.com/uc?export=view&id=1Ku-BIxFmYFvPb4NBF4J8xY_cTnB92xqf' }}
                    style={styles.cylinderIcon}
                  />
                  <View>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionPrice}>{option.weight}</Text>
                  </View>
                </View>
                {selectedSize === size && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.statusContainer}>
            <View style={styles.statusIconContainer}>
              <Text style={styles.statusIcon}>😊</Text>
            </View>
            <Text style={styles.statusText}>Relax, we'll handle the rest</Text>
          </View>
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
  },
  cylinderIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 8,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  optionPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
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
});