import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Expense } from '@/types/expenses';

interface MonthlyExpensesChartProps {
  expenses: Expense[];
  year: number;
}

export const MonthlyExpensesChart: React.FC<MonthlyExpensesChartProps> = ({
  expenses,
  year,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Получаем названия месяцев
  const months = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  
  // Расчет расходов по месяцам для выбранного года
  const calculateMonthlyExpenses = () => {
    // Создаем массив с нулевыми значениями для каждого месяца
    const monthlyTotals = Array(12).fill(0);
    
    // Суммируем расходы по месяцам
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.timestamp);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      
      if (expenseYear === year) {
        monthlyTotals[expenseMonth] += expense.amount;
      }
    });
    
    return monthlyTotals;
  };
  
  const monthlyExpenses = calculateMonthlyExpenses();
  const hasData = monthlyExpenses.some(amount => amount > 0);
  
  // Проверяем, есть ли данные для отображения
  if (!hasData) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.noDataText}>
          Нет данных о расходах за {year} год
        </ThemedText>
      </View>
    );
  }
  
  // Подготавливаем данные для гистограммы
  const chartData = {
    labels: months,
    datasets: [
      {
        data: monthlyExpenses,
        color: (opacity = 1) => `rgba(71, 148, 235, ${opacity})`
      },
    ],
  };

  // Цвета для темной и светлой темы
  const backgroundColor = colorScheme === 'dark' ? '#333' : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';
  
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Расходы по месяцам ({year})
      </ThemedText>
      
      <View style={[styles.chartContainer, {backgroundColor: colorScheme === 'dark' ? '#222' : '#f5f5f5'}]}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=" ₽"
          chartConfig={{
            backgroundColor: backgroundColor,
            backgroundGradientFrom: backgroundColor,
            backgroundGradientTo: backgroundColor,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(71, 148, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.7,
            propsForLabels: {
              fill: textColor,
            },
            propsForBackgroundLines: {
              stroke: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            }
          }}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero
        />
      </View>
      
      {/* Показываем итоговую сумму за год */}
      <ThemedText style={styles.totalText}>
        Всего за {year} год: {monthlyExpenses.reduce((sum, amount) => sum + amount, 0).toFixed(2)} ₽
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 8,
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    marginVertical: 30,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  totalText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
}); 