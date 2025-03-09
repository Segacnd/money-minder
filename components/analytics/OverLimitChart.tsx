import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BarChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { OverLimitRecord } from '@/types/budget';
import { formatCurrency } from '@/utils/formatters';
import { groupBy } from '@/utils/collections';

interface OverLimitChartProps {
  history: OverLimitRecord[];
}

export function OverLimitChart({ history }: OverLimitChartProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Если истории нет или она пуста, показываем сообщение
  if (!history || history.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Нет данных о превышениях лимита
        </ThemedText>
      </ThemedView>
    );
  }

  // Группируем превышения по дням
  const groupedByDay = groupBy(history, (record) => {
    const date = new Date(record.date);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  });
  
  // Создаем данные для графика
  const chartData = Object.entries(groupedByDay).map(([day, records]) => {
    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
    return {
      day,
      amount: totalAmount,
      count: records.length
    };
  });
  
  // Сортируем по дате (от старых к новым)
  chartData.sort((a, b) => {
    const [dayA, monthA] = a.day.split('.').map(Number);
    const [dayB, monthB] = b.day.split('.').map(Number);
    
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });
  
  // Берем только последние 7 дней с превышениями (или меньше, если данных меньше)
  const lastDaysData = chartData.slice(-7);
  
  // Готовим данные для графика в формате библиотеки
  const data = {
    labels: lastDaysData.map(d => d.day),
    datasets: [
      {
        data: lastDaysData.map(d => d.amount),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
      }
    ]
  };
  
  // Статистика по всем превышениям
  const totalOverLimitAmount = history.reduce((sum, record) => sum + record.amount, 0);
  const averageOverLimitAmount = totalOverLimitAmount / history.length;
  const maxOverLimitRecord = history.reduce((max, record) => 
    record.amount > max.amount ? record : max, history[0]);
    
  // Настройки для графика
  const chartConfig = {
    backgroundGradientFrom: themeColors.background,
    backgroundGradientTo: themeColors.background,
    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Статистика превышений дневного лимита
      </ThemedText>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricValue}>
            {history.length}
          </ThemedText>
          <ThemedText style={styles.metricLabel}>
            Всего превышений
          </ThemedText>
        </View>
        
        <View style={styles.metricItem}>
          <ThemedText style={[styles.metricValue, { color: 'red' }]}>
            {formatCurrency(totalOverLimitAmount)}
          </ThemedText>
          <ThemedText style={styles.metricLabel}>
            Сумма превышений
          </ThemedText>
        </View>
        
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricValue}>
            {formatCurrency(averageOverLimitAmount)}
          </ThemedText>
          <ThemedText style={styles.metricLabel}>
            В среднем
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.chartTitle}>
        Сумма превышений за последние дни
      </ThemedText>
      
      {lastDaysData.length > 0 ? (
        <BarChart
          data={data}
          width={Dimensions.get('window').width - 32}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero={true}
          showBarTops={true}
          withHorizontalLabels={true}
          segments={4}
          yAxisLabel=""
          yAxisSuffix=""
        />
      ) : (
        <ThemedText style={styles.noDataText}>
          Недостаточно данных для построения графика
        </ThemedText>
      )}
      
      <View style={styles.worstRecord}>
        <ThemedText style={styles.worstRecordTitle}>
          Самое большое превышение лимита:
        </ThemedText>
        <ThemedText style={styles.worstRecordValue}>
          {formatCurrency(maxOverLimitRecord.amount)}
        </ThemedText>
        <ThemedText style={styles.worstRecordDescription}>
          {maxOverLimitRecord.expenseTitle || 'Без названия'} 
          ({new Date(maxOverLimitRecord.date).toLocaleDateString('ru-RU')})
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  chartTitle: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 32,
    opacity: 0.7,
  },
  worstRecord: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  worstRecordTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  worstRecordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 4,
  },
  worstRecordDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyContainer: {
    marginVertical: 12,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.7,
  },
}); 