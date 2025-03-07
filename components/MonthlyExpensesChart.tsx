import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';

interface MonthlyExpensesChartProps {
  expenses: Expense[];
  startDate: Date;
  endDate: Date;
}

export const MonthlyExpensesChart: React.FC<MonthlyExpensesChartProps> = ({
  expenses,
  startDate,
  endDate,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Получаем названия месяцев
  const months = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  
  // Расчет расходов по месяцам для выбранного периода
  const calculateMonthlyExpenses = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Создаем массив с тремя месяцами: предыдущий, текущий и следующий
    const monthlyTotals = Array(3).fill(0);
    const monthLabels = Array(3).fill('');
    
    // Определяем индексы месяцев
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    
    // Устанавливаем метки месяцев
    monthLabels[0] = months[prevMonth];
    monthLabels[1] = months[currentMonth];
    monthLabels[2] = months[nextMonth];
    
    // Фильтруем расходы по выбранному периоду и суммируем по месяцам
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.timestamp);
      const expenseMonth = expenseDate.getMonth();
      
      if (expenseMonth === prevMonth) {
        monthlyTotals[0] += expense.amount;
      } else if (expenseMonth === currentMonth) {
        monthlyTotals[1] += expense.amount;
      } else if (expenseMonth === nextMonth) {
        monthlyTotals[2] += expense.amount;
      }
    });
    
    return { monthlyTotals, monthLabels };
  };
  
  const { monthlyTotals, monthLabels } = calculateMonthlyExpenses();
  const hasData = monthlyTotals.some(amount => amount > 0);
  
  // Проверяем, есть ли данные для отображения
  if (!hasData) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.noDataText}>
          Нет данных о расходах за выбранный период
        </ThemedText>
      </View>
    );
  }
  
  // Подготавливаем данные для гистограммы
  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        data: monthlyTotals,
        color: (opacity = 1) => `rgba(71, 148, 235, ${opacity})`
      },
    ],
  };

  // Цвета для темной и светлой темы
  const backgroundColor = colorScheme === 'dark' ? '#333' : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';
  
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={[styles.title, { fontSize: 13 }]}>
        Расходы по месяцам
      </ThemedText>
      
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=" BYN"
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
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
              stroke: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }
          }}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero
        />
      </View>
      
      <ThemedText style={styles.totalText}>
        Всего за период: {monthlyTotals.reduce((sum, amount) => sum + amount, 0).toFixed(2)} BYN
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'left',
    paddingHorizontal: 16,
    width: '100%',
  },
  chartWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    opacity: 0.7,
    paddingHorizontal: 16,
    width: '100%',
  },
  totalText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    paddingHorizontal: 16,
    width: '100%',
  },
}); 