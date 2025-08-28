import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

export default function SplashScreen() {
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const isLoggedIn = await AsyncStorage.getItem('userToken');
        
        // Wait for 2.5 seconds to show splash screen
        setTimeout(() => {
          if (!hasSeenOnboarding) {
            router.replace('/onboarding');
          } else if (isLoggedIn) {
            router.replace('/(tabs)');
          } else {
            router.replace('/auth');
          }
        }, 2500);
      } catch (error) {
        console.error('Error checking app state:', error);
        router.replace('/onboarding');
      }
    };

    checkFirstLaunch();
  }, []);

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Ondegoo</Text>
        <Text style={styles.slogan}>Fast, Safe and Convenient</Text>
      </View>
      <Image 
        source={{ uri: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400' }}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: 'white',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  slogan: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 15,
  }
});