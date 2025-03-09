import React from 'react';
import { StyleSheet, View, useWindowDimensions, LogBox } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { ThemedText } from '../ThemedText';
import { Expense } from '@/types/expenses';
import { formatCurrency } from '@/utils/formatters';

interface ExpensesBarChartProps {
  expenses: Expense[];
  period: 'day' | 'week' | 'month';
}

// Игнорируем предупреждение о defaultProps
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components'
]);

export const ExpensesBarChart = ({ expenses, period }: ExpensesBarChartProps) => {
  const { width } = useWindowDimensions();
  const chartWidth = width - 64;

  const chartData = React.useMemo(() => {
    const data: { [key: string]: number } = {};
    const now = new Date();

    expenses.forEach(expense => {
      const date = new Date(expense.timestamp);
      let key = '';

      switch (period) {
        case 'day':
          key = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
          break;
        case 'week':
          const weekNumber = Math.ceil((date.getDate() - 1) / 7);
          key = `Нед. ${weekNumber}`;
          break;
        case 'month':
          key = date.toLocaleString('ru-RU', { month: 'short' });
          break;
      }

      data[key] = (data[key] || 0) + expense.amount;
    });

    return Object.entries(data).map(([date, amount]) => ({
      x: date,
      y: amount,
    }));
  }, [expenses, period]);

  const maxAmount = Math.max(...chartData.map(d => d.y));

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        Расходы по {period === 'day' ? 'дням' : period === 'week' ? 'неделям' : 'месяцам'}
      </ThemedText>
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={220}
          padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
          domainPadding={{ x: 20 }}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: '#666' },
              ticks: { stroke: '#666' },
              tickLabels: { 
                fontSize: 10, 
                fill: '#999',
                angle: period === 'day' ? -45 : 0,
                textAnchor: period === 'day' ? 'end' : 'middle'
              },
              grid: { stroke: 'transparent' }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => formatCurrency(t)}
            style={{
              axis: { stroke: '#666' },
              ticks: { stroke: '#666' },
              tickLabels: { fontSize: 10, fill: '#999' },
              grid: { stroke: 'rgba(102, 102, 102, 0.2)', strokeDasharray: '4' }
            }}
          />
          <VictoryBar
            data={chartData}
            style={{
              data: {
                fill: '#4794eb',
                width: period === 'day' ? 12 : 20,
              }
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 500 }
            }}
            cornerRadius={{ top: 4 }}
            barRatio={0.8}
          
          />
        </VictoryChart>
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
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: -20,
  },
}); 