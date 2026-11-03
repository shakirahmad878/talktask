import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RemindersRepository } from '../db/RemindersRepository';
import { Reminder } from '../../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('talktask_reminders', {
          name: 'TalkTask Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
          sound: 'default',
        });
      }

      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permissions:', e);
      return false;
    }
  }

  static async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    const hasPerm = await this.requestPermissions();
    if (!hasPerm) {
      console.warn('Notification permissions not granted');
      return null;
    }

    const scheduledDate = new Date(reminder.scheduled_at);
    const now = new Date();

    if (scheduledDate.getTime() <= now.getTime()) {
      console.warn('Cannot schedule reminder in the past');
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TalkTask Reminder',
          body: reminder.title,
          data: { reminderId: reminder.id, linkedType: reminder.linked_type, linkedId: reminder.linked_id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
          channelId: Platform.OS === 'android' ? 'talktask_reminders' : undefined,
        },
      });

      // Update notification ID in local database
      RemindersRepository.updateNotificationId(reminder.id, notificationId);
      return notificationId;
    } catch (err) {
      console.error('Failed to schedule local notification:', err);
      return null;
    }
  }

  static async cancelReminderNotification(notificationId?: string | null): Promise<void> {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Failed to cancel scheduled notification:', e);
    }
  }

  /**
   * Re-syncs upcoming reminders with Android notification system upon app boot.
   */
  static async resyncUpcomingReminders(): Promise<void> {
    try {
      const upcoming = RemindersRepository.getUpcoming(25);
      const now = new Date();

      for (const rem of upcoming) {
        const schedTime = new Date(rem.scheduled_at).getTime();
        if (schedTime > now.getTime()) {
          // If no notification ID or needing refresh, re-schedule
          if (!rem.notification_id) {
            await this.scheduleReminderNotification(rem);
          }
        } else {
          // Mark as fired
          RemindersRepository.setStatus(rem.id, 'fired');
        }
      }
    } catch (e) {
      console.warn('Error resyncing reminders:', e);
    }
  }
}
