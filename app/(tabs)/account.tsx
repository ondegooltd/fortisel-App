import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { ChevronRight, LogOut, CreditCard as Edit, Bell, MapPin, CreditCard, Shield, CircleHelp as HelpCircle, Star, Gift, Settings, Phone, Mail, Globe, Lock } from 'lucide-react-native';

export default function AccountScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            router.replace('/auth');
          },
        },
      ]
    );
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120' }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileContact}>+233 20 123 4567</Text>
              <Text style={styles.profileEmail}>john.doe@email.com</Text>
              <View style={styles.verificationBadge}>
                <Shield size={14} color={COLORS.primary} />
                <Text style={styles.verificationText}>Verified Account</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Edit size={16} color="white" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>GHS 450</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Account Management */}
        {renderSectionHeader('Account Management')}
        <View style={styles.section}>
          {renderSettingItem(
            <CreditCard size={20} color={COLORS.primary} />,
            'Payment Methods',
            () => {},
            'Manage cards and mobile money'
          )}
          {renderSettingItem(
            <MapPin size={20} color={COLORS.primary} />,
            'Saved Addresses',
            () => {},
            'Home, work and other locations'
          )}
          {renderSettingItem(
            <Gift size={20} color={COLORS.primary} />,
            'Loyalty Program',
            () => {},
            'Earn points and rewards'
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
              onValueChange={setPushNotifications}
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
              onValueChange={setEmailNotifications}
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
              onValueChange={setLocationServices}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={locationServices ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Settings size={20} color={COLORS.primary} />,
            'App Settings',
            () => {}
          )}
        </View>

        {/* Security & Privacy */}
        {renderSectionHeader('Security & Privacy')}
        <View style={styles.section}>
          {renderSettingItem(
            <Lock size={20} color={COLORS.primary} />,
            'Change Password',
            () => {}
          )}
          {renderSettingItem(
            <Shield size={20} color={COLORS.primary} />,
            'Two-Factor Authentication',
            () => {}
          )}
          {renderSettingItem(
            <Globe size={20} color={COLORS.primary} />,
            'Privacy Policy',
            () => {}
          )}
        </View>

        {/* Support */}
        {renderSectionHeader('Support')}
        <View style={styles.section}>
          {renderSettingItem(
            <HelpCircle size={20} color={COLORS.primary} />,
            'Help Center',
            () => {}
          )}
          {renderSettingItem(
            <Phone size={20} color={COLORS.primary} />,
            'Contact Support',
            () => {}
          )}
          {renderSettingItem(
            <Star size={20} color={COLORS.primary} />,
            'Rate Our App',
            () => {}
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Ondegoo v1.0.0</Text>
          <Text style={styles.versionSubtext}>© 2024 Ondegoo. All rights reserved.</Text>
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
  profileSection: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 3,
  },
  profileContact: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    marginBottom: 5,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
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
});