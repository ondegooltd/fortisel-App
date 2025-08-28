import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, FlatList } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

const onboardingData = [
  {
    id: '1',
    title: 'Convenient Ordering',
    description: 'Schedule LPG refills in just a few taps.',
    image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    title: 'Flexible Scheduling',
    description: 'Pick a time that suits you best',
    image: 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    title: 'Secured Payment Options',
    description: 'Select a secure payment at your convenience',
    image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth');
  };

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? COLORS.primary : COLORS.lightGray }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => (
          <Animated.View 
            style={[styles.slide, { width }]}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />

      {renderDots()}

      <View style={styles.buttonContainer}>
        {currentIndex < onboardingData.length - 1 ? (
          <>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: '50%',
    marginBottom: 30,
    borderRadius: 15,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.darkText,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.darkText,
    opacity: 0.7,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 15,
  },
  skipText: {
    fontFamily: 'Inter-Medium',
    color: COLORS.darkText,
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  nextText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
    alignItems: 'center',
  },
  getStartedText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
});