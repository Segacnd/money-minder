import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настраиваем поведение уведомлений для приложения
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Запрашиваем разрешения при первом запуске
  useEffect(() => {
    registerForPushNotificationsAsync();

    // Слушаем получение уведомлений когда приложение открыто
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Получено уведомление:', notification);
    });

    // Слушаем нажатия на уведомления
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Нажатие на уведомление:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Запрос разрешений на уведомления
  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Не удалось получить разрешение на отправку уведомлений');
        return;
      }

      console.log('Разрешения на уведомления получены');
    } catch (error) {
      console.error('Ошибка при запросе разрешений:', error);
    }
  };

  // Отправка уведомления о дневном лимите
  const scheduleDailyLimitNotification = async (remainingLimit: number) => {
    try {
      // Отменяем предыдущие запланированные уведомления
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Если осталось меньше 20% от дневного лимита
      if (remainingLimit > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Напоминание о бюджете',
            body: `У вас осталось ${remainingLimit.toFixed(2)} BYN на сегодня`,
            sound: true,
          },
          trigger: null, // Отправить немедленно
        });
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
    }
  };

  // Отправка уведомления о превышении дневного лимита
  const sendDailyLimitExceededNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Превышение дневного лимита',
          body: 'Вы превысили дневной лимит расходов',
          sound: true,
        },
        trigger: null, // Отправить немедленно
      });
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
    }
  };

  return {
    scheduleDailyLimitNotification,
    sendDailyLimitExceededNotification,
  };
} 