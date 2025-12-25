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
import { COLORS } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useApi';

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const { signup } = useAuth();

  const validatePassword = (password: string) => {
    const strength: PasswordStrength = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(Boolean);
  };

  const isFormValid = () => {
    // Basic validation
    const hasName = name.trim().length >= 2;
    const hasEmail = email.trim().includes('@') && email.trim().includes('.');
    const hasPhone =
      phoneNumber.trim().length >= 10 &&
      /^[0-9+\-\s()]+$/.test(phoneNumber.trim());
    const hasPassword = password && isPasswordValid();

    return hasName && hasEmail && hasPhone && hasPassword;
  };

  const handleContinue = async () => {
    if (isFormValid()) {
      console.log('📝 Form data being sent:', {
        name,
        email,
        phoneNumber,
        password: password ? password.substring(0, 3) + '***' : 'undefined', // Hide password for security
      });
      console.log('🔍 Form validation check:', {
        hasName: name.trim().length >= 2,
        hasEmail: email.trim().includes('@') && email.trim().includes('.'),
        hasPhone:
          phoneNumber.trim().length >= 10 &&
          /^[0-9+\-\s()]+$/.test(phoneNumber.trim()),
        hasPassword: password && isPasswordValid(),
        passwordLength: password ? password.length : 0,
        isPasswordValid: isPasswordValid(),
        phoneFormat: /^[0-9+\-\s()]+$/.test(phoneNumber.trim()),
        phoneLength: phoneNumber.trim().length,
      });
      const result = await signup.execute(name, email, phoneNumber, password);
      if (result?.success) {
        router.push('/auth/otp-verification?context=signup');
      }
    }
  };

  const handleGoogleSignup = async () => {
    // In a real app, implement Google OAuth
    // For now, use demo data for Google signup
    const result = await signup.execute(
      'Google User',
      'demo@google.com',
      phoneNumber || 'demo-phone',
      'GooglePassword123!'
    );
    if (result?.success) {
      router.push('/auth/otp-verification?context=signup');
    }
  };

  const renderPasswordCriteria = () => (
    <View style={styles.passwordCriteria}>
      <Text style={styles.criteriaTitle}>Password must contain:</Text>
      <View style={styles.criteriaItem}>
        <Feather
          name={passwordStrength.hasMinLength ? 'check-circle' : 'circle'}
          size={16}
          color={passwordStrength.hasMinLength ? '#4CAF50' : '#999'}
        />
        <Text
          style={[
            styles.criteriaText,
            passwordStrength.hasMinLength && styles.criteriaValid,
          ]}
        >
          At least 8 characters
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather
          name={passwordStrength.hasUppercase ? 'check-circle' : 'circle'}
          size={16}
          color={passwordStrength.hasUppercase ? '#4CAF50' : '#999'}
        />
        <Text
          style={[
            styles.criteriaText,
            passwordStrength.hasUppercase && styles.criteriaValid,
          ]}
        >
          One uppercase letter
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather
          name={passwordStrength.hasLowercase ? 'check-circle' : 'circle'}
          size={16}
          color={passwordStrength.hasLowercase ? '#4CAF50' : '#999'}
        />
        <Text
          style={[
            styles.criteriaText,
            passwordStrength.hasLowercase && styles.criteriaValid,
          ]}
        >
          One lowercase letter
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather
          name={passwordStrength.hasNumber ? 'check-circle' : 'circle'}
          size={16}
          color={passwordStrength.hasNumber ? '#4CAF50' : '#999'}
        />
        <Text
          style={[
            styles.criteriaText,
            passwordStrength.hasNumber && styles.criteriaValid,
          ]}
        >
          One number
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather
          name={passwordStrength.hasSpecialChar ? 'check-circle' : 'circle'}
          size={16}
          color={passwordStrength.hasSpecialChar ? '#4CAF50' : '#999'}
        />
        <Text
          style={[
            styles.criteriaText,
            passwordStrength.hasSpecialChar && styles.criteriaValid,
          ]}
        >
          One special character (!@#$%^&*)
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Fortisel</Text>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              name.trim().length > 0 &&
                name.trim().length < 2 &&
                styles.inputError,
            ]}
            placeholder="Enter Full Name"
            placeholderTextColor={COLORS.lightGray}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {name.trim().length > 0 && name.trim().length < 2 && (
            <Text style={styles.errorText}>
              Name must be at least 2 characters
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              email.trim().length > 0 &&
                (!email.includes('@') || !email.includes('.')) &&
                styles.inputError,
            ]}
            placeholder="Enter Email Address"
            placeholderTextColor={COLORS.lightGray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {email.trim().length > 0 &&
            (!email.includes('@') || !email.includes('.')) && (
              <Text style={styles.errorText}>
                Please enter a valid email address
              </Text>
            )}
        </View>

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
            onChangeText={handlePasswordChange}
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

        {password.length > 0 && renderPasswordCriteria()}

        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid() || signup.loading) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid() || signup.loading}
        >
          <Text style={styles.buttonText}>
            {signup.loading ? 'Creating Account...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, signup.loading && styles.disabledButton]}
          onPress={handleGoogleSignup}
          disabled={signup.loading}
        >
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=50',
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Signup with Google</Text>
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
  passwordCriteria: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  criteriaTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
    marginBottom: 10,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  criteriaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  criteriaValid: {
    color: '#4CAF50',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
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
