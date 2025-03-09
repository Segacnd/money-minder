import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Expense } from '@/types/expenses';
import { formatCurrency } from '@/utils/formatters';
import { MaterialIcons } from '@expo/vector-icons';

interface KeyMetricsProps {
  expenses: Expense[];
  previousPeriodExpenses: Expense[];
  startDate?: Date;
  endDate?: Date;
}

export const KeyMetrics = ({ expenses, previousPeriodExpenses, startDate, endDate }: KeyMetricsProps) => {
  const metrics = React.useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousTotal = previousPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Расчет среднего расхода в день с учетом выбранного периода
    let daysInPeriod = 30; // По умолчанию примерно за месяц
    
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      daysInPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Минимум 1 день
    }
    
    const averagePerDay = total / daysInPeriod;

    // Находим самую большую категорию
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Нет данных';

    // Изменение по сравнению с предыдущим периодом
    const change = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0;

    return {
      total,
      averagePerDay,
      topCategory,
      change,
    };
  }, [expenses, previousPeriodExpenses, startDate, endDate]);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Ключевые метрики</ThemedText>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Общая сумма"
          value={formatCurrency(metrics.total)}
          icon="account-balance-wallet"
        />
        <MetricCard
          title="Средний расход в день"
          value={formatCurrency(metrics.averagePerDay)}
          icon="today"
        />
        <MetricCard
          title="Основная категория"
          value={metrics.topCategory}
          icon="category"
        />
        <MetricCard
          title="Изменение"
          value={`${metrics.change > 0 ? '+' : ''}${metrics.change.toFixed(1)}%`}
          icon="trending-up"
          valueColor={metrics.change > 0 ? '#ff3b30' : '#34c759'}
        />
      </View>
    </View>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  valueColor?: string;
}

const MetricCard = ({ title, value, icon, valueColor }: MetricCardProps) => (
  <ThemedView style={styles.card}>
    <MaterialIcons name={icon} size={24} color="#4794eb" style={styles.icon} />
    <ThemedText style={styles.cardTitle}>{title}</ThemedText>
    <ThemedText style={[styles.cardValue, valueColor ? { color: valueColor } : undefined]}>
      {value}
    </ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 