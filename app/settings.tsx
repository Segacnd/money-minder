import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleClearData = async () => {
    Alert.alert(
      'Очистить данные',
      'Вы уверены, что хотите удалить все данные приложения? Это действие нельзя отменить.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Готово', 'Все данные успешно удалены');
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить данные');
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Настройки
        </ThemedText>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, { borderColor: themeColors.error }]}
          onPress={handleClearData}
        >
          <ThemedText style={[styles.buttonText, { color: themeColors.error }]}>
            Очистить все данные
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
  },
  content: {
    padding: 16,
  },
  button: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 