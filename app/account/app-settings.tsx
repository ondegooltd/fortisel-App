import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import {
  ArrowLeft,
  Palette,
  Globe,
  Bell,
  Shield,
  Database,
  Trash2,
  Info,
  Moon,
  Sun,
} from 'lucide-react-native';

export default function AppSettingsScreen() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [dataUsage, setDataUsage] = useState('wifi'); // 'wifi' | 'cellular' | 'always'

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      const savedLanguage = await AsyncStorage.getItem('app_language');
      const savedNotifications = await AsyncStorage.getItem(
        'app_notifications'
      );
      const savedSound = await AsyncStorage.getItem('app_sound');
      const savedHaptic = await AsyncStorage.getItem('app_haptic');
      const savedAutoSync = await AsyncStorage.getItem('app_auto_sync');
      const savedDataUsage = await AsyncStorage.getItem('app_data_usage');

      if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'auto');
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedSound) setSoundEnabled(savedSound === 'true');
      if (savedHaptic) setHapticFeedback(savedHaptic === 'true');
      if (savedAutoSync) setAutoSync(savedAutoSync === 'true');
      if (savedDataUsage) setDataUsage(savedDataUsage);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    saveSetting('app_theme', newTheme);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    saveSetting('app_language', newLanguage);
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    saveSetting('app_notifications', value.toString());
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    saveSetting('app_sound', value.toString());
  };

  const handleHapticToggle = (value: boolean) => {
    setHapticFeedback(value);
    saveSetting('app_haptic', value.toString());
  };

  const handleAutoSyncToggle = (value: boolean) => {
    setAutoSync(value);
    saveSetting('app_auto_sync', value.toString());
  };

  const handleDataUsageChange = (newUsage: string) => {
    setDataUsage(newUsage);
    saveSetting('app_data_usage', newUsage);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all app settings to default. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to defaults
            setTheme('light');
            setLanguage('en');
            setNotifications(true);
            setSoundEnabled(true);
            setHapticFeedback(true);
            setAutoSync(true);
            setDataUsage('wifi');

            // Clear saved settings
            AsyncStorage.multiRemove([
              'app_theme',
              'app_language',
              'app_notifications',
              'app_sound',
              'app_haptic',
              'app_auto_sync',
              'app_data_usage',
            ]);

            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconTitle}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        {renderSectionHeader('Appearance')}
        <View style={styles.section}>
          {renderSettingItem(
            <Palette size={20} color={COLORS.primary} />,
            'Theme',
            'Choose your preferred theme',
            <View style={styles.themeSelector}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'light' && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Sun
                  size={16}
                  color={theme === 'light' ? 'white' : COLORS.primary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    theme === 'light' && styles.themeOptionTextSelected,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'dark' && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Moon
                  size={16}
                  color={theme === 'dark' ? 'white' : COLORS.primary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    theme === 'dark' && styles.themeOptionTextSelected,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'auto' && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange('auto')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    theme === 'auto' && styles.themeOptionTextSelected,
                  ]}
                >
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Language & Region */}
        {renderSectionHeader('Language & Region')}
        <View style={styles.section}>
          {renderSettingItem(
            <Globe size={20} color={COLORS.primary} />,
            'Language',
            'English',
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => {
                Alert.alert(
                  'Language',
                  'Language selection will be available soon'
                );
              }}
            >
              <Text style={styles.languageText}>English</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications */}
        {renderSectionHeader('Notifications')}
        <View style={styles.section}>
          {renderSettingItem(
            <Bell size={20} color={COLORS.primary} />,
            'Push Notifications',
            'Receive notifications about orders and updates',
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={notifications ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Bell size={20} color={COLORS.primary} />,
            'Sound',
            'Play sounds for notifications',
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={soundEnabled ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Bell size={20} color={COLORS.primary} />,
            'Haptic Feedback',
            'Vibrate for notifications and interactions',
            <Switch
              value={hapticFeedback}
              onValueChange={handleHapticToggle}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={hapticFeedback ? COLORS.primary : '#f4f3f4'}
            />
          )}
        </View>

        {/* Data & Sync */}
        {renderSectionHeader('Data & Sync')}
        <View style={styles.section}>
          {renderSettingItem(
            <Database size={20} color={COLORS.primary} />,
            'Auto Sync',
            'Automatically sync data when connected',
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: '#767577', true: '#f1c8cb' }}
              thumbColor={autoSync ? COLORS.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            <Database size={20} color={COLORS.primary} />,
            'Data Usage',
            'Choose when to sync data',
            <View style={styles.dataUsageSelector}>
              <TouchableOpacity
                style={[
                  styles.dataUsageOption,
                  dataUsage === 'wifi' && styles.dataUsageOptionSelected,
                ]}
                onPress={() => handleDataUsageChange('wifi')}
              >
                <Text
                  style={[
                    styles.dataUsageOptionText,
                    dataUsage === 'wifi' && styles.dataUsageOptionTextSelected,
                  ]}
                >
                  WiFi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dataUsageOption,
                  dataUsage === 'cellular' && styles.dataUsageOptionSelected,
                ]}
                onPress={() => handleDataUsageChange('cellular')}
              >
                <Text
                  style={[
                    styles.dataUsageOptionText,
                    dataUsage === 'cellular' &&
                      styles.dataUsageOptionTextSelected,
                  ]}
                >
                  Cellular
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dataUsageOption,
                  dataUsage === 'always' && styles.dataUsageOptionSelected,
                ]}
                onPress={() => handleDataUsageChange('always')}
              >
                <Text
                  style={[
                    styles.dataUsageOptionText,
                    dataUsage === 'always' &&
                      styles.dataUsageOptionTextSelected,
                  ]}
                >
                  Always
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Storage */}
        {renderSectionHeader('Storage')}
        <View style={styles.section}>
          {renderSettingItem(
            <Trash2 size={20} color={COLORS.primary} />,
            'Clear Cache',
            'Free up storage space',
            undefined,
            handleClearCache
          )}
        </View>

        {/* About */}
        {renderSectionHeader('About')}
        <View style={styles.section}>
          {renderSettingItem(
            <Info size={20} color={COLORS.primary} />,
            'App Version',
            '1.0.0',
            undefined
          )}
          {renderSettingItem(
            <Shield size={20} color={COLORS.primary} />,
            'Privacy Policy',
            'View our privacy policy',
            undefined,
            () => {
              // TODO: Open privacy policy
              Alert.alert(
                'Privacy Policy',
                'Privacy policy will open in browser'
              );
            }
          )}
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
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
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  themeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  themeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  themeOptionTextSelected: {
    color: 'white',
  },
  languageSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightBackground,
  },
  languageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkText,
  },
  dataUsageSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  dataUsageOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  dataUsageOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  dataUsageOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
  },
  dataUsageOptionTextSelected: {
    color: 'white',
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  resetButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});
