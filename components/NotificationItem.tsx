import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '@/constants/colors';

interface NotificationItemProps {
  message: string;
  time: string;
  date: string;
  isToday?: boolean;
}

export default function NotificationItem({ message, time, date, isToday = false }: NotificationItemProps) {
  return (
    <View style={styles.notificationItem}>
      <Image 
        source={{ uri: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=80' }}
        style={styles.notificationIcon}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{message}</Text>
        <Text style={styles.notificationTime}>
          {isToday ? `Today, ${time}` : `${date}, ${time}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBackground,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 5,
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.6,
  },
});