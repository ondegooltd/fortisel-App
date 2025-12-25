import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useApi';

export default function SigninScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signin } = useAuth();

  const isFormValid = () => {
    const hasPhone =
      phoneNumber.trim().length >= 10 &&
      /^[0-9+\-\s()]+$/.test(phoneNumber.trim());
    const hasPassword = password.trim().length >= 8;
    return hasPhone && hasPassword;
  };

  const handleSignIn = async () => {
    if (isFormValid()) {
      console.log('🔑 Signin attempt with:', {
        phoneNumber,
        password: password.substring(0, 3) + '***',
      });
      const result = await signin.execute(phoneNumber, password);
      console.log('🔍 Signin result:', {
        success: result?.success,
        hasAccessToken: !!result?.accessToken,
        hasUser: !!result?.user,
        message: result?.message,
      });

      if (result?.success && result.accessToken) {
        console.log('✅ Signin successful, storing token and redirecting...');
        await AsyncStorage.setItem('userToken', result.accessToken);
        if (rememberMe) {
          await AsyncStorage.setItem('rememberMe', 'true');
        }
        console.log('🚀 Redirecting to home screen...');
        router.replace('/(tabs)');
      } else {
        console.log('❌ Signin failed or missing data:', result);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    // In a real app, implement Google OAuth
    await AsyncStorage.setItem('userToken', 'google-token');
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Fortisel</Text>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              phoneNumber.trim().length > 0 &&
                (phoneNumber.trim().length < 10 ||
                  !/^[0-9+\-\s()]+$/.test(phoneNumber.trim())) &&
                styles.inputError,
            ]}
            placeholder="Enter Phone Number (e.g., 0531129204)"
            placeholderTextColor={COLORS.lightGray}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              // Remove invalid characters and keep only digits, +, -, spaces, and parentheses
              const cleaned = text.replace(/[^0-9+\-\s()]/g, '');
              setPhoneNumber(cleaned);
            }}
          />
          {phoneNumber.trim().length > 0 && phoneNumber.trim().length < 10 && (
            <Text style={styles.errorText}>
              Phone number must be at least 10 digits
            </Text>
          )}
          {phoneNumber.trim().length > 0 &&
            !/^[0-9+\-\s()]+$/.test(phoneNumber.trim()) && (
              <Text style={styles.errorText}>
                Phone number can only contain digits, +, -, spaces, and
                parentheses
              </Text>
            )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor={COLORS.lightGray}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color={COLORS.lightGray}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rememberForgotContainer}>
          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
              {rememberMe && <Feather name="check" size={14} color="white" />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.forgotText}>Forgotten Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid() || signin.loading) && styles.disabledButton,
          ]}
          onPress={handleSignIn}
          disabled={!isFormValid() || signin.loading}
        >
          <Text style={styles.buttonText}>
            {signin.loading ? 'Signing in...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=50',
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account yet?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signUpLink}>Sign up</Text>
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    fontFamily: 'Inter-Regular',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    color: COLORS.lightGray,
    fontFamily: 'Inter-Regular',
  },
  forgotText: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
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
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  orText: {
    color: COLORS.lightGray,
    marginHorizontal: 10,
    fontFamily: 'Inter-Regular',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12,
  },
  googleButtonText: {
    color: COLORS.darkText,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signUpText: {
    color: COLORS.lightGray,
    fontFamily: 'Inter-Regular',
  },
  signUpLink: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
});
