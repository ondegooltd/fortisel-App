import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(''); // You might want to pass this as a param
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const { resetPassword } = useAuth();

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

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure your passwords match');
      return;
    }
    
    if (!isPasswordValid()) {
      Alert.alert('Password requirements not met', 'Please ensure your password meets all requirements');
      return;
    }

    const result = await resetPassword.execute(phoneNumber || 'demo-phone', password);
    if (result?.success) {
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please sign in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/auth/signin') }]
      );
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
        <Text style={[styles.criteriaText, passwordStrength.hasMinLength && styles.criteriaValid]}>
          At least 8 characters
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather 
          name={passwordStrength.hasUppercase ? 'check-circle' : 'circle'} 
          size={16} 
          color={passwordStrength.hasUppercase ? '#4CAF50' : '#999'} 
        />
        <Text style={[styles.criteriaText, passwordStrength.hasUppercase && styles.criteriaValid]}>
          One uppercase letter
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather 
          name={passwordStrength.hasLowercase ? 'check-circle' : 'circle'} 
          size={16} 
          color={passwordStrength.hasLowercase ? '#4CAF50' : '#999'} 
        />
        <Text style={[styles.criteriaText, passwordStrength.hasLowercase && styles.criteriaValid]}>
          One lowercase letter
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather 
          name={passwordStrength.hasNumber ? 'check-circle' : 'circle'} 
          size={16} 
          color={passwordStrength.hasNumber ? '#4CAF50' : '#999'} 
        />
        <Text style={[styles.criteriaText, passwordStrength.hasNumber && styles.criteriaValid]}>
          One number
        </Text>
      </View>
      <View style={styles.criteriaItem}>
        <Feather 
          name={passwordStrength.hasSpecialChar ? 'check-circle' : 'circle'} 
          size={16} 
          color={passwordStrength.hasSpecialChar ? '#4CAF50' : '#999'} 
        />
        <Text style={[styles.criteriaText, passwordStrength.hasSpecialChar && styles.criteriaValid]}>
          One special character (!@#$%^&*)
        </Text>
      </View>
    </View>
  );

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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Create a new password for your account</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={COLORS.lightGray}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Feather
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={24}
              color={COLORS.lightGray}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, (!password || !confirmPassword || !isPasswordValid() || resetPassword.loading) && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={!password || !confirmPassword || !isPasswordValid() || resetPassword.loading}
        >
          <Text style={styles.buttonText}>
            {resetPassword.loading ? 'Resetting Password...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: 'white',
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
  },
  disabledButton: {
    backgroundColor: '#7E7E7E',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});