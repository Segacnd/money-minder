import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Expense } from '@/types/expenses';

const chartColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#36A2EB',
];

interface Props {
  expenses: Expense[];
}

export const CategoryDistributionChart: React.FC<Props> = ({ expenses }) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const getCategoryData = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals).map(([name, amount], index) => ({
      name,
      amount,
      color: chartColors[index % chartColors.length],
      legendFontColor: themeColors.text,
      legendFontSize: 12,
    }));
  };

  const chartData = getCategoryData();

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.noDataText}>
          Нет данных для отображения
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        Распределение по категориям
      </ThemedText>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 12}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: () => themeColors.text,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    opacity: 0.7,
  },
}); 