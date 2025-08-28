import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export default function Index() {
  // This component redirects to the splash screen on initial load
  // and to the main tabs if the user is already logged in
  return <Redirect href="/splash" />;
}