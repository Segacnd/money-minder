import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { formatCurrency } from '@/utils/formatters';

interface DailyLimitProgressBarProps {
  remainingLimit: number;
  totalLimit: number;
}

export function DailyLimitProgressBar({ remainingLimit, totalLimit }: DailyLimitProgressBarProps) {
  const progress = remainingLimit / totalLimit;
  const percentage = Math.max(0, Math.min(100, progress * 100));
  const spentAmount = totalLimit - remainingLimit;

  // Определяем цвет на основе процента оставшихся средств
  const getProgressColor = () => {
    if (percentage > 50) return '#4CAF50'; // Зеленый
    if (percentage > 20) return '#FFC107'; // Желтый
    return '#FF5252'; // Красный
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText>Осталось на сегодня:</ThemedText>
        <ThemedText style={{ fontWeight: 'bold' }}>
          {formatCurrency(remainingLimit)}
        </ThemedText>
      </View>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${percentage}%`,
              backgroundColor: getProgressColor()
            }
          ]} 
        />
      </View>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.smallText}>
          {percentage.toFixed(0)}% от дневного лимита
        </ThemedText>
        <ThemedText style={styles.smallText}>
          {spentAmount.toFixed(2)} / {totalLimit.toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  smallText: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 