import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface OrderMapProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: Array<{
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
  }>;
}

export default function OrderMap({ style }: OrderMapProps) {
  return (
    <View style={[styles.mapPlaceholder, style]}>
      <Text style={styles.placeholderText}>Map View</Text>
      <Text style={styles.placeholderSubtext}>
        Interactive map available on mobile devices
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    backgroundColor: COLORS.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  placeholderText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 5,
  },
  placeholderSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.7,
    textAlign: 'center',
  },
});