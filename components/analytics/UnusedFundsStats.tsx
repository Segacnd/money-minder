import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface UnusedFundsStatsProps {
  savedUnusedFunds: number;
  unusedFundsYesterday?: number;
  monthlyIncome?: number;
}

export function UnusedFundsStats({ 
  savedUnusedFunds, 
  unusedFundsYesterday = 0,
  monthlyIncome = 0 
}: UnusedFundsStatsProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Рассчитываем процент сэкономленных средств от месячного дохода
  const savingsPercentage = monthlyIncome > 0 
    ? ((savedUnusedFunds / monthlyIncome) * 100).toFixed(1) 
    : '0';
  
  // Если нет сэкономленных средств, показываем заглушку
  if (savedUnusedFunds <= 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Статистика неиспользованных средств
        </ThemedText>
        <View style={styles.emptyState}>
          <Ionicons 
            name="hourglass-outline" 
            size={48} 
            color={themeColors.text} 
            style={{ opacity: 0.7 }}
          />
          <ThemedText style={styles.emptyStateText}>
            Пока нет данных о неиспользованных средствах
          </ThemedText>
          <ThemedText style={styles.emptyStateSubtext}>
            Экономьте средства, не тратя весь дневной лимит
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Статистика неиспользованных средств
      </ThemedText>
      
      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>
            Сэкономлено всего
          </ThemedText>
          <ThemedText style={[styles.metricValue, { color: '#4CAF50' }]}>
            {formatCurrency(savedUnusedFunds)}
          </ThemedText>
          {monthlyIncome > 0 && (
            <ThemedText style={styles.metricSubtext}>
              {savingsPercentage}% от доходов
            </ThemedText>
          )}
        </View>
        
        {unusedFundsYesterday > 0 && (
          <View style={styles.metricItem}>
            <ThemedText style={styles.metricLabel}>
              Вчерашняя экономия
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: '#4CAF50' }]}>
              {formatCurrency(unusedFundsYesterday)}
            </ThemedText>
            <ThemedText style={styles.metricSubtext}>
              добавлено к лимиту
            </ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.infoBox}>
        <Ionicons 
          name="information-circle-outline" 
          size={20} 
          color={themeColors.text} 
          style={{ opacity: 0.7, marginRight: 8 }}
        />
        <ThemedText style={styles.infoText}>
          Неиспользованные средства каждого дня распределяются на оставшиеся дни до следующей зарплаты, 
          увеличивая ваш дневной лимит.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricItem: {
    flex: 1,
    minWidth: 150,
    marginBottom: 16,
    marginRight: 16,
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    marginTop: 6,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 