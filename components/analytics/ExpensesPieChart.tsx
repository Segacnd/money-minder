import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { VictoryPie, VictoryLabel } from 'victory-native';
import { ThemedText } from '../ThemedText';
import { Expense } from '@/types/expenses';
import { formatCurrency } from '@/utils/formatters';

interface ExpensesPieChartProps {
  expenses: Expense[];
}

interface ChartDatum {
  x: string;
  y: number;
}

export const ExpensesPieChart = ({ expenses }: ExpensesPieChartProps) => {
  const { width } = useWindowDimensions();
  const chartWidth = width - 32;

  const categoryData = React.useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      x: category,
      y: amount,
    }));
  }, [expenses]);

  const total = React.useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const chartStyle = {
    labels: { fill: '#fff', fontSize: 10 }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Расходы по категориям</ThemedText>
      <ThemedText style={styles.total}>Всего: {formatCurrency(total)}</ThemedText>
      <View style={styles.chartContainer}>
        <VictoryPie
          animate={{ duration: 500 }}
          data={categoryData}
          width={chartWidth}
          height={chartWidth * 0.75}
          colorScale="qualitative"
          innerRadius={60}
          radius={100}
          padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={chartStyle}
          labels={({ datum }) => `${datum.x}\n${Math.round((datum.y / total) * 100)}%`}
          labelRadius={100}
          labelComponent={<VictoryLabel style={{ fill: '#fff' }} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: -10,
  },
}); 