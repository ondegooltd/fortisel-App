import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useApi';

export default function OTPVerificationScreen() {
  const { context } = useLocalSearchParams();
  const [otp, setOTP] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [phoneNumber, setPhoneNumber] = useState(''); // You might want to pass this as a param
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const { verifyOTP, sendOTP } = useAuth();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOTP(newOtp);
    if (text !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 4) {
      const result = await verifyOTP.execute(phoneNumber || 'demo-phone', otpValue, context);
      if (result?.success) {
        if (context === 'reset') {
          router.push('/auth/reset-password');
        } else if (context === 'signup') {
          await AsyncStorage.setItem('userToken', result.data?.token || 'verified-token');
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
          router.replace('/(tabs)');
        }
      }
    } else {
      Alert.alert('Invalid OTP', 'Please enter all 4 digits');
    }
  };

  const handleResendOTP = async () => {
    const result = await sendOTP.execute(phoneNumber || 'demo-phone', context);
    if (result?.success) {
      setTimer(30);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.logo}>Ondegoo</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>We have sent an OTP{'\n'}to your phone</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, (otp.includes('') || verifyOTP.loading) && styles.disabledButton]}
          onPress={handleVerify}
          disabled={otp.includes('') || verifyOTP.loading}
        >
          <Text style={styles.buttonText}>
            {verifyOTP.loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive an OTP? </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={sendOTP.loading}
            >
              <Text style={[styles.resendLink, sendOTP.loading && styles.disabledText]}>
                {sendOTP.loading ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
    alignItems: 'center',
    paddingTop: 60,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 42,
    color: 'white',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  formContainer: {
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#7E7E7E',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    color: COLORS.lightGray,
    fontFamily: 'Inter-Regular',
  },
  timerText: {
    color: COLORS.lightGray,
    fontFamily: 'Inter-Medium',
  },
  resendLink: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
  },
  disabledText: {
    color: COLORS.lightGray,
  },
});