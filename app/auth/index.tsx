import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function AuthIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Ondegoo</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.outlineButton]}
          onPress={() => router.push('/auth/signin')}
        >
          <Text style={[styles.buttonText, styles.outlineButtonText]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: 'white',
    marginBottom: 60,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
  },
  outlineButtonText: {
    color: 'white',
  },
});