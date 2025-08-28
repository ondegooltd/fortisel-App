import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { Home, ShoppingBag, User } from 'lucide-react-native';

export default function BottomTab() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      icon: Home,
      path: '/(tabs)',
    },
    {
      name: 'Orders',
      icon: ShoppingBag,
      path: '/orders',
    },
    {
      name: 'Account',
      icon: User,
      path: '/account',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.path)}
          >
            <Icon
              size={24}
              color={isActive ? COLORS.primary : COLORS.lightGray}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkBackground,
    paddingTop: 10,
    paddingBottom: 25,
    borderTopWidth: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 5,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
  },
});