import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useApi';

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const { sendOTP } = useAuth();

  const handleSendOTP = async () => {
    if (phoneNumber) {
      const result = await sendOTP.execute(phoneNumber, 'reset');
      if (result?.success) {
        router.push('/auth/otp-verification?context=reset');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.logo}>Ondegoo</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your phone number and we'll send you a code to reset your password</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            placeholderTextColor={COLORS.lightGray}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!phoneNumber || sendOTP.loading) && styles.disabledButton]}
          onPress={handleSendOTP}
          disabled={!phoneNumber || sendOTP.loading}
        >
          <Text style={styles.buttonText}>
            {sendOTP.loading ? 'Sending OTP...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signin')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.darkBackground,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
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
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#7E7E7E',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signInText: {
    color: COLORS.lightGray,
    fontFamily: 'Inter-Regular',
  },
  signInLink: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
});