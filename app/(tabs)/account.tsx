import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import {
  ChevronRight,
  LogOut,
  CreditCard as Edit,
  Bell,
  MapPin,
  CreditCard,
  Shield,
  CircleHelp as HelpCircle,
  Star,
  Gift,
  Settings,
  Phone,
  Mail,
  Globe,
  Lock,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth, useProfile } from '@/hooks/useApi';
import { Linking } from 'react-native';

export default function AccountScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { getProfile, updateProfile } = useProfile();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('🔍 Loading user profile from API...');
        const result = await getProfile.execute();
        if (result?.success && result.data) {
          console.log('✅ User profile loaded:', result.data);
          setUserProfile(result.data);

          // Load user preferences from profile data
          const userData = result.data as any;
          if (userData.notificationPreferences) {
            setPushNotifications(
              userData.notificationPreferences.pushNotifications ?? true
            );
            setEmailNotifications(
              userData.notificationPreferences.emailNotifications ?? false
            );
          }
          if (userData.locationServices !== undefined) {
            setLocationServices(userData.locationServices);
          }
        } else {
          console.log('❌ Failed to load user profile:', result);
        }
      } else {
        console.log('❌ No user token found');
        // Redirect to login if no token
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('rememberMe');
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleUpdateProfile = async (field: string, value: any) => {
    try {
      console.log(`✏️ Updating ${field}:`, value);
      const result = await updateProfile.execute({ [field]: value });
      if (result?.success && result.data) {
        console.log('✅ Profile updated successfully:', result.data);
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleNotificationToggle = async (
    type: 'push' | 'email',
    value: boolean
  ) => {
    try {
      if (type === 'push') {
        setPushNotifications(value);
      } else {
        setEmailNotifications(value);
      }

      // Update user preferences in backend
      await handleUpdateProfile('notificationPreferences', {
        pushNotifications: type === 'push' ? value : pushNotifications,
        emailNotifications: type === 'email' ? value : emailNotifications,
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    try {
      setLocationServices(value);
      // Update user preferences in backend
      await handleUpdateProfile('locationServices', value);
    } catch (error) {
      console.error('Failed to update location settings:', error);
    }
  };

  // Navigation handlers
  const handleEditProfile = () => {
    router.push('/account/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('/auth/reset-password');
  };

  const handlePaymentMethods = () => {
    router.push('/account/payment-methods');
  };

  const handleDeliveryAddresses = () => {
    router.push('/account/delivery-addresses');
  };

  const handleAppSettings = () => {
    router.push('/account/app-settings');
  };

  const handleTwoFactorAuth = () => {
    router.push('/account/two-factor-auth');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://fortisel.com/privacy-policy');
  };

  const handleHelpCenter = () => {
    router.push('/account/help-center');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@fortisel.com?subject=Support Request');
  };

  const handleRateApp = () => {
    // For iOS App Store
    Linking.openURL('https://apps.apple.com/app/fortisel/id123456789');
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    subtitle?: string,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconTitle}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <ChevronRight size={20} color={COLORS.darkText} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Account</Text>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : userProfile ? (
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {userProfile.name || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {userProfile.email || 'No email'}
              </Text>
              <Text style={styles.profilePhone}>
                {userProfile.phone || 'No phone'}
              </Text>
              <Text style={styles.profileStatus}>
                {userProfile.isEmailVerified ? '✅ Verified' : '⚠️ Unverified'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadUserProfile}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                color={COLORS.primary}
                style={loading ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load profile</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadUserProfile}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Stats */}
        {userProfile && (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile.totalOrders || 0}
              </Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile.rating || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                GHS {userProfile.totalSpent || 0}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        )}

        {/* General Settings */}
        {renderSectionHeader('General')}
        <View style={styles.section}>
          {renderSettingItem(
            <Edit size={20} color={COLORS.primary} />,
            'Edit Profile',
            handleEditProfile
          )}
          {renderSettingItem(
            <Bell size={20} color={COLORS.primary} />,
            'Notifications',
            () => router.push('/account/notifications')
          )}
          {renderSettingItem(
            <Lock size={20} color={COLORS.primary} />,
            'Change Password',
            handleChangePassword
          )}
          {renderSettingItem(
            <CreditCard size={20} color={COLORS.primary} />,
            'Payment Methods',
            handlePaymentMethods
          )}
          {renderSettingItem(
            <MapPin size={20} color={COLORS.primary} />,
            'Delivery Addresses',
            handleDeliveryAddresses
          )}
        </View>

        {/* Preferences */}
        {renderSectionHeader('Preferences')}
        <View style={styles.section}>
          {renderSettingItem(
            <Bell size={20} color={COLORS.primary} />,
            'Push Notifications',
            () => {},
            'Order updates and promotions',
            <Switch
              value={pushNotifications}
              onValueChange={(value) => handleNotificationToggle('push', value)}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={pushNotifications ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Mail size={20} color={COLORS.primary} />,
            'Email Notifications',
            () => {},
            'Weekly summaries and offers',
            <Switch
              value={emailNotifications}
              onValueChange={(value) =>
                handleNotificationToggle('email', value)
              }
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={emailNotifications ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Globe size={20} color={COLORS.primary} />,
            'Location Services',
            () => {},
            'For better delivery experience',
            <Switch
              value={locationServices}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={locationServices ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Settings size={20} color={COLORS.primary} />,
            'App Settings',
            handleAppSettings
          )}
        </View>

        {/* Security & Privacy */}
        {renderSectionHeader('Security & Privacy')}
        <View style={styles.section}>
          {renderSettingItem(
            <Lock size={20} color={COLORS.primary} />,
            'Change Password',
            handleChangePassword
          )}
          {renderSettingItem(
            <Shield size={20} color={COLORS.primary} />,
            'Two-Factor Authentication',
            handleTwoFactorAuth
          )}
          {renderSettingItem(
            <Globe size={20} color={COLORS.primary} />,
            'Privacy Policy',
            handlePrivacyPolicy
          )}
        </View>

        {/* Support */}
        {renderSectionHeader('Support')}
        <View style={styles.section}>
          {renderSettingItem(
            <HelpCircle size={20} color={COLORS.primary} />,
            'Help Center',
            handleHelpCenter
          )}
          {renderSettingItem(
            <Phone size={20} color={COLORS.primary} />,
            'Contact Support',
            handleContactSupport
          )}
          {renderSettingItem(
            <Star size={20} color={COLORS.primary} />,
            'Rate Our App',
            handleRateApp
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Fortisel v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            © 2025 Fortisel. All rights reserved.
          </Text>
        </View>
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
    backgroundColor: COLORS.darkBackground,
    padding: 20,
  },
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkText,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 12,
    marginTop: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkText,
    opacity: 0.6,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.6,
  },
  versionSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.5,
    marginTop: 2,
  },
  profileSection: {
    backgroundColor: COLORS.darkBackground,
    padding: 20,
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: 'white',
  },
  profileDetails: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 2,
  },
  profilePhone: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
  },
  profileStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.lightGray,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
});
