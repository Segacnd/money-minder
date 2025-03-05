import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface TimeOfDayChartProps {
  morningAmount: number;
  afternoonAmount: number;
  eveningAmount: number;
  nightAmount: number;
}

export const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({
  morningAmount,
  afternoonAmount,
  eveningAmount,
  nightAmount,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Проверяем, есть ли вообще данные для отображения
  const hasData = morningAmount > 0 || afternoonAmount > 0 || eveningAmount > 0 || nightAmount > 0;

  // Подготавливаем данные для диаграммы
  const chartData = [
    {
      name: 'Утро',
      amount: morningAmount,
      color: '#FFD700', // золотой
      legendFontColor: colorScheme === 'dark' ? '#FFF' : '#000',
    },
    {
      name: 'День',
      amount: afternoonAmount,
      color: '#FF8C00', // оранжевый
      legendFontColor: colorScheme === 'dark' ? '#FFF' : '#000',
    },
    {
      name: 'Вечер',
      amount: eveningAmount,
      color: '#8A2BE2', // фиолетовый
      legendFontColor: colorScheme === 'dark' ? '#FFF' : '#000',
    },
    {
      name: 'Ночь',
      amount: nightAmount,
      color: '#4B0082', // индиго
      legendFontColor: colorScheme === 'dark' ? '#FFF' : '#000',
    },
  ].filter(item => item.amount > 0); // Отображаем только те периоды, где есть расходы

  // Рассчитываем процентное соотношение
  const total = morningAmount + afternoonAmount + eveningAmount + nightAmount;

  if (!hasData) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.noDataText}>
          Нет данных для отображения диаграммы
        </ThemedText>
      </View>
    );
  }

  // Преобразуем данные для PieChart (нужны только population и color)
  const pieChartData = chartData.map(item => ({
    name: item.name,
    population: item.amount,
    color: item.color,
    legendFontColor: item.legendFontColor,
    legendFontSize: 13,
  }));

  // Цвета для темной и светлой темы
  const backgroundColor = colorScheme === 'dark' ? '#333' : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Распределение расходов по времени суток
      </ThemedText>
      
      <View style={[styles.chartContainer, {backgroundColor: colorScheme === 'dark' ? '#222' : '#f5f5f5'}]}>
        <PieChart
          data={pieChartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: backgroundColor,
            backgroundGradientFrom: backgroundColor,
            backgroundGradientTo: backgroundColor,
            color: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            labelColor: textColor,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
          hasLegend={true}
        />
      </View>
      
      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <ThemedText>
              {item.name}: {Math.round((item.amount / total) * 100)}% ({item.amount.toFixed(2)} BYN)
            </ThemedText>
          </View>
        ))}
      </View>
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
    width: '100%',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  noDataText: {
    marginVertical: 30,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
}); 