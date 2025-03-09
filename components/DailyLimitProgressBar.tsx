import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemedText } from './ThemedText';
import { formatCurrency } from '@/utils/formatters';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface DailyLimitProgressBarProps {
  remainingLimit: number;
  totalLimit: number;
  unusedFundsYesterday?: number;
}

export function DailyLimitProgressBar({ 
  remainingLimit, 
  totalLimit,
  unusedFundsYesterday = 0
}: DailyLimitProgressBarProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Проверяем наличие лимита, чтобы избежать деления на ноль и проблем с NaN
  const validTotalLimit = totalLimit > 0 ? totalLimit : 1;
  const validRemainingLimit = remainingLimit; // Сохраняем оригинальное значение, даже отрицательное
  const validUnusedFundsYesterday = isNaN(unusedFundsYesterday) ? 0 : unusedFundsYesterday;
  
  // Определяем, превышен ли лимит
  const isOverLimit = validRemainingLimit < 0;
  
  // Рассчитываем сумму превышения лимита (положительное число)
  const overLimitAmount = isOverLimit ? Math.abs(validRemainingLimit) : 0;
  
  // Вычисляем актуальную потраченную сумму
  const spentAmount = isOverLimit 
    ? validTotalLimit + overLimitAmount // Если лимит превышен, потрачено больше лимита
    : validTotalLimit - validRemainingLimit; // Если лимит не превышен, потрачено часть лимита
  
  // Рассчитываем процент оставшихся средств (если лимит превышен, остаток 0%)
  const remainingPercentage = isOverLimit 
    ? 0 
    : Math.max(0, Math.min(100, (validRemainingLimit / validTotalLimit) * 100));
  
  // Определяем, были ли неиспользованные средства вчера
  const hasUnusedFunds = validUnusedFundsYesterday > 0;
  
  // Цвета для индикации
  const DANGER_COLOR = '#FF3B30'; // Красный для iOS
  const WARNING_COLOR = '#FFCC00'; // Жёлтый для iOS
  const SUCCESS_COLOR = '#34C759'; // Зелёный для iOS
  
  // Определяем цвет на основе процента оставшихся средств
  const getProgressColor = () => {
    if (isOverLimit) return DANGER_COLOR;
    if (remainingPercentage < 20) return DANGER_COLOR; 
    if (remainingPercentage < 50) return WARNING_COLOR;
    return SUCCESS_COLOR;
  };

  // Отладочная информация
  console.log('DailyLimitProgressBar данные:', {
    originalRemaining: remainingLimit,
    originalTotal: totalLimit,
    validRemaining: validRemainingLimit,
    validTotal: validTotalLimit,
    isOverLimit,
    overLimitAmount,
    spentAmount,
    remainingPercentage
  });

  return (
    <View style={styles.container}>
      {/* БЛОК ИНФОРМАЦИИ О ЛИМИТЕ */}
      <View style={styles.labelContainer}>
        <ThemedText>
          {isOverLimit ? 'Превышение лимита:' : 'Осталось на сегодня:'}
        </ThemedText>
        <ThemedText style={{ 
          fontWeight: 'bold',
          color: isOverLimit ? DANGER_COLOR : themeColors.tint
        }}>
          {isOverLimit 
            ? `${formatCurrency(overLimitAmount)} BYN`
            : `${formatCurrency(validRemainingLimit)} BYN`
          }
        </ThemedText>
      </View>
      
      {/* БЛОК ИНФОРМАЦИИ ОБ ЭКОНОМИИ */}
      {hasUnusedFunds && (
        <View style={styles.unusedFundsContainer}>
          <ThemedText style={styles.unusedFundsText}>
            <ThemedText style={styles.unusedFundsText}>Экономия вчера: </ThemedText>
            <ThemedText style={styles.unusedFundsText}>+{formatCurrency(validUnusedFundsYesterday)} BYN</ThemedText>
          </ThemedText>
          <ThemedText style={styles.unusedFundsSubtext}>
            (распределено на оставшиеся дни)
          </ThemedText>
        </View>
      )}
      
      {/* ПРОГРЕСС-БАР */}
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: isOverLimit ? '100%' : `${100 - remainingPercentage}%`, // Заполняем потраченную часть
              backgroundColor: getProgressColor()
            }
          ]} 
        />
      </View>
      
      {/* БЛОК ИНФОРМАЦИИ О РАСХОДАХ И ЛИМИТЕ */}
      <View style={styles.labelContainer}>
        <ThemedText style={styles.smallText}>
          {isOverLimit 
            ? 'Дневной лимит превышен' 
            : `${remainingPercentage.toFixed(0)}% от дневного лимита`
          }
        </ThemedText>
        
        {/* Отображаем соотношение spentAmount/totalLimit */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[
            styles.spentAmountText,
            { color: isOverLimit ? DANGER_COLOR : themeColors.text }
          ]}>
            {formatCurrency(spentAmount)} BYN
          </Text>
          <Text style={[styles.smallText, { color: themeColors.text }]}> / </Text>
          <Text style={[styles.smallText, { color: themeColors.text }]}>
            {formatCurrency(validTotalLimit)} BYN
          </Text>
        </View>
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
  unusedFundsContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  unusedFundsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  unusedFundsSubtext: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  spentAmountText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 