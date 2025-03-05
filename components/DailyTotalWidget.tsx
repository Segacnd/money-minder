import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatCurrency } from '@/utils/formatters';

interface DailyTotalWidgetProps {
  totalAmount: number;
  date?: Date;
}

export function DailyTotalWidget({ totalAmount, date = new Date() }: DailyTotalWidgetProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Форматирование даты для отображения
  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return 'Сегодня';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long'
    };
    
    return date.toLocaleDateString('ru-RU', options);
  };
  
  return (
    <ThemedView style={[styles.container, { borderColor: themeColors.tint + '30' }]}>
      <View style={styles.header}>
        <ThemedText style={styles.dateText}>
          {formatDate(date)}
        </ThemedText>
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.label}>
          Общая сумма расходов:
        </ThemedText>
        <ThemedText 
          style={[styles.amount, { color: themeColors.tint }]}
        >
          {formatCurrency(totalAmount)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    alignItems: 'center',
    minHeight: 90,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    flexShrink: 1,
  },
}); 