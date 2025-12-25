import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import {
  ArrowLeft,
  Shield,
  Smartphone,
  Mail,
  Check,
  Copy,
  QrCode,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { twoFactorAuthApi } from '@/utils/api';

export default function TwoFactorAuthScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<
    'overview' | 'qr' | 'backup' | 'verify'
  >('overview');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const result = await twoFactorAuthApi.getStatus();
      if (result?.success && result.data) {
        setIsEnabled(result.data.isEnabled);
      }
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const result = await twoFactorAuthApi.generateSecret();
      if (result?.success && result.data) {
        setSecretKey(result.data.secret);
        setQrCodeUrl(result.data.qrCodeUrl);
        setBackupCodes(result.data.backupCodes);
        setSetupStep('qr');
      } else {
        Alert.alert('Error', 'Failed to generate 2FA secret');
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      Alert.alert('Error', 'Failed to enable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = () => {
    Alert.alert(
      'Disable Two-Factor Authentication',
      'Are you sure you want to disable 2FA? This will make your account less secure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await twoFactorAuthApi.disable();
              if (result?.success) {
                setIsEnabled(false);
                setSetupStep('overview');
                Alert.alert(
                  'Success',
                  'Two-factor authentication has been disabled.'
                );
              } else {
                Alert.alert('Error', 'Failed to disable 2FA');
              }
            } catch (error) {
              console.error('Failed to disable 2FA:', error);
              Alert.alert('Error', 'Failed to disable 2FA. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert(
        'Invalid Code',
        'Please enter a valid 6-digit verification code.'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await twoFactorAuthApi.enable(verificationCode);
      if (result?.success) {
        setIsEnabled(true);
        setSetupStep('overview');
        Alert.alert(
          'Success',
          'Two-factor authentication has been enabled successfully!'
        );
      } else {
        Alert.alert(
          'Invalid Code',
          'The verification code is incorrect. Please try again.'
        );
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Secret key copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert(
        'Error',
        'Failed to copy to clipboard. Please copy manually:\n\n' + text
      );
    }
  };

  const handleRegenerateBackupCodes = async () => {
    Alert.alert(
      'Regenerate Backup Codes',
      'This will invalidate your existing backup codes. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await twoFactorAuthApi.regenerateBackupCodes();
              if (result?.success && result.data) {
                setBackupCodes(result.data.backupCodes);
                setSetupStep('backup');
                Alert.alert(
                  'Success',
                  'New backup codes have been generated. Please save them in a safe place.'
                );
              } else {
                Alert.alert('Error', 'Failed to regenerate backup codes');
              }
            } catch (error) {
              console.error('Failed to regenerate backup codes:', error);
              Alert.alert(
                'Error',
                'Failed to regenerate backup codes. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderOverview = () => (
    <View style={styles.content}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Shield
            size={32}
            color={isEnabled ? COLORS.primary : COLORS.lightGray}
          />
          <Text style={styles.statusTitle}>
            {isEnabled
              ? 'Two-Factor Authentication Enabled'
              : 'Two-Factor Authentication Disabled'}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {isEnabled
            ? "Your account is protected with two-factor authentication. You'll need to enter a verification code from your authenticator app when signing in."
            : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
        </Text>
      </View>

      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Benefits of 2FA:</Text>
        <View style={styles.benefitItem}>
          <Check size={20} color={COLORS.primary} />
          <Text style={styles.benefitText}>
            Protects against unauthorized access
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Check size={20} color={COLORS.primary} />
          <Text style={styles.benefitText}>
            Required for sensitive operations
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Check size={20} color={COLORS.primary} />
          <Text style={styles.benefitText}>
            Works with popular authenticator apps
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          isEnabled ? styles.disableButton : styles.enableButton,
        ]}
        onPress={isEnabled ? handleDisable2FA : handleEnable2FA}
        disabled={loading}
      >
        <Text
          style={[
            styles.actionButtonText,
            isEnabled ? styles.disableButtonText : styles.enableButtonText,
          ]}
        >
          {loading ? 'Loading...' : isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Text>
      </TouchableOpacity>

      {isEnabled && (
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={handleRegenerateBackupCodes}
          disabled={loading}
        >
          <Text style={styles.regenerateButtonText}>
            Regenerate Backup Codes
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQRCode = () => (
    <View style={styles.content}>
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>Step 1: Scan QR Code</Text>
        <Text style={styles.stepDescription}>
          Open your authenticator app and scan this QR code to add your Fortisel
          account.
        </Text>

        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <QrCode size={64} color={COLORS.primary} />
            <Text style={styles.qrText}>QR Code</Text>
          </View>
        </View>

        <View style={styles.secretKeyContainer}>
          <Text style={styles.secretKeyLabel}>
            Or enter this secret key manually:
          </Text>
          <View style={styles.secretKeyInput}>
            <Text style={styles.secretKeyText}>{secretKey}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(secretKey)}>
              <Copy size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setSetupStep('backup')}
        >
          <Text style={styles.nextButtonText}>Next: Backup Codes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBackupCodes = () => (
    <View style={styles.content}>
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>Step 2: Save Backup Codes</Text>
        <Text style={styles.stepDescription}>
          Save these backup codes in a safe place. You can use them to access
          your account if you lose your authenticator device.
        </Text>

        <View style={styles.backupCodesContainer}>
          <View style={styles.backupCodesHeader}>
            <Text style={styles.backupCodesTitle}>Your Backup Codes</Text>
            <TouchableOpacity
              onPress={() => setShowBackupCodes(!showBackupCodes)}
            >
              {showBackupCodes ? (
                <EyeOff size={20} color={COLORS.primary} />
              ) : (
                <Eye size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.backupCodesGrid}>
            {backupCodes.map((code, index) => (
              <View key={index} style={styles.backupCodeItem}>
                <Text style={styles.backupCodeText}>
                  {showBackupCodes ? code : '••••••••'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setSetupStep('verify')}
        >
          <Text style={styles.nextButtonText}>Next: Verify Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerification = () => (
    <View style={styles.content}>
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>Step 3: Verify Setup</Text>
        <Text style={styles.stepDescription}>
          Enter the 6-digit code from your authenticator app to complete the
          setup.
        </Text>

        <View style={styles.verificationContainer}>
          <TextInput
            style={styles.verificationInput}
            placeholder="000000"
            placeholderTextColor={COLORS.lightGray}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!verificationCode || verificationCode.length !== 6) &&
              styles.verifyButtonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={
            !verificationCode || verificationCode.length !== 6 || loading
          }
        >
          <Text
            style={[
              styles.verifyButtonText,
              (!verificationCode || verificationCode.length !== 6) &&
                styles.verifyButtonTextDisabled,
            ]}
          >
            {loading ? 'Verifying...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {setupStep === 'overview' && renderOverview()}
        {setupStep === 'qr' && renderQRCode()}
        {setupStep === 'backup' && renderBackupCodes()}
        {setupStep === 'verify' && renderVerification()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkBackground,
    padding: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginLeft: 12,
    flex: 1,
  },
  statusDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
    lineHeight: 24,
  },
  benefitsCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    marginLeft: 12,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: COLORS.primary,
  },
  disableButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  enableButtonText: {
    color: 'white',
  },
  disableButtonText: {
    color: 'white',
  },
  stepCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 20,
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  stepDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
    lineHeight: 24,
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  qrText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
  },
  secretKeyContainer: {
    marginBottom: 20,
  },
  secretKeyLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  secretKeyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secretKeyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
    flex: 1,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  backupCodesContainer: {
    marginBottom: 20,
  },
  backupCodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backupCodesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  backupCodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  backupCodeItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: '45%',
    alignItems: 'center',
  },
  backupCodeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.darkText,
  },
  verificationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  verificationInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.darkText,
    width: 200,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  verifyButtonTextDisabled: {
    color: '#999',
  },
  regenerateButton: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  regenerateButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.primary,
  },
});
