import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RemindersRepository } from '../db/RemindersRepository';
import { Reminder } from '../../types';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (err) {
  console.warn('Failed to configure notification handler:', err);
}

export class NotificationManager {
  static async initChannel(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('talktask_reminders', {
          name: 'TalkTask Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
          sound: 'default',
        });
      }
    } catch (e) {
      console.warn('Failed to initialize notification channel:', e);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      await this.initChannel();
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permissions:', e);
      return false;
    }
  }

  static async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    try {
      const hasPerm = await this.requestPermissions();
      if (!hasPerm) {
        console.warn('Notification permissions not granted; skipping system alarm');
        return null;
      }

      const scheduledDate = new Date(reminder.scheduled_at);
      const now = new Date();

      if (scheduledDate.getTime() <= now.getTime()) {
        console.warn('Cannot schedule reminder in the past');
        return null;
      }

      await this.initChannel();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TalkTask Reminder',
          body: reminder.title,
          data: { reminderId: reminder.id, linkedType: reminder.linked_type, linkedId: reminder.linked_id },
          sound: true,
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
      console.warn('Failed to schedule local notification safely:', err);
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
   * Performs non-interactive permission check so startup is never blocked by permission modals.
   */
  static async resyncUpcomingReminders(): Promise<void> {
    try {
      await this.initChannel();

      // Silent permission check: do not prompt on launch
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('[NotificationManager] Notifications not granted yet; skipping startup alarm resync');
        return;
      }

      const upcoming = RemindersRepository.getUpcoming(25);
      const now = new Date();

      for (const rem of upcoming) {
        const schedTime = new Date(rem.scheduled_at).getTime();
        if (schedTime > now.getTime()) {
          if (!rem.notification_id) {
            await this.scheduleReminderNotification(rem);
          }
        } else {
          RemindersRepository.setStatus(rem.id, 'fired');
        }
      }
    } catch (e) {
      console.warn('Error resyncing reminders safely:', e);
    }
  }
}
