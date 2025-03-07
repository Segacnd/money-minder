import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Expense } from '@/types/expenses';
import { formatCurrency } from '@/utils/formatters';
import { MaterialIcons } from '@expo/vector-icons';

interface DetailedAnalyticsProps {
  expenses: Expense[];
}

export const DetailedAnalytics = ({ expenses }: DetailedAnalyticsProps) => {
  const analytics = React.useMemo(() => {
    // Топ-5 самых крупных расходов
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Топ-3 категории
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));

    // Распределение по дням недели
    const weekdayTotals = expenses.reduce((acc, expense) => {
      const date = new Date(expense.timestamp);
      const day = date.toLocaleString('ru-RU', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      topExpenses,
      topCategories,
      weekdayTotals,
    };
  }, [expenses]);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Детальная аналитика</ThemedText>
      
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Топ-5 крупных расходов</ThemedText>
        {analytics.topExpenses.map((expense, index) => (
          <View key={expense.id} style={styles.expenseRow}>
            <View style={styles.expenseInfo}>
              <ThemedText style={styles.expenseTitle}>{expense.title}</ThemedText>
              <ThemedText style={styles.expenseCategory}>{expense.category}</ThemedText>
            </View>
            <ThemedText style={styles.expenseAmount}>
              {formatCurrency(expense.amount)}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Топ-3 категории расходов</ThemedText>
        {analytics.topCategories.map((category, index) => (
          <View key={category.category} style={styles.categoryRow}>
            <ThemedText style={styles.categoryName}>{category.category}</ThemedText>
            <ThemedText style={styles.categoryAmount}>
              {formatCurrency(category.amount)}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Расходы по дням недели</ThemedText>
        {Object.entries(analytics.weekdayTotals).map(([day, amount]) => (
          <View key={day} style={styles.weekdayRow}>
            <ThemedText style={styles.weekdayName}>{day}</ThemedText>
            <ThemedText style={styles.weekdayAmount}>
              {formatCurrency(amount)}
            </ThemedText>
          </View>
        ))}
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseCategory: {
    fontSize: 12,
    opacity: 0.7,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryName: {
    fontSize: 14,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayName: {
    fontSize: 14,
  },
  weekdayAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 