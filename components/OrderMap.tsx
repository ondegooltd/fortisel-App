import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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

export default function OrderMap({ style, initialRegion, markers = [] }: OrderMapProps) {
  const defaultRegion = {
    latitude: 5.1215,
    longitude: -1.2795,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <MapView
      style={[StyleSheet.absoluteFillObject, style]}
      initialRegion={initialRegion || defaultRegion}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinate}
          title={marker.title}
        />
      ))}
    </MapView>
  );
}