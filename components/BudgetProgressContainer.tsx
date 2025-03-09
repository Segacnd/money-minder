import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses } from '@/hooks/useExpenses';
import { DailyLimitProgressBar } from './DailyLimitProgressBar';
import { usePathname } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface BudgetProgressContainerProps {
  forceRefresh?: number; // Необязательный счетчик для обновления из родительского компонента
}

export function BudgetProgressContainer({ forceRefresh = 0 }: BudgetProgressContainerProps) {
  const { budgetData, loadBudgetData } = useBudget();
  const { expenses, loadExpenses } = useExpenses();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Для предотвращения слишком частых обновлений
  const lastUpdateRef = useRef<number>(0);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  
  // Функция для загрузки данных с минимальным интервалом
  const loadData = useCallback(async () => {
    const now = Date.now();
    // Предотвращаем обновление чаще чем раз в 1 секунду
    if (now - lastUpdateRef.current < 1000) {
      return;
    }
    
    lastUpdateRef.current = now;
    console.log('BudgetProgressContainer: загрузка данных');
    
    try {
      // Загружаем данные бюджета
      await loadBudgetData();
    } catch (error) {
      console.error('Ошибка при обновлении данных бюджета:', error);
    }
  }, [loadBudgetData]);
  
  // Обновляем данные при изменении маршрута
  useEffect(() => {
    loadData();
  }, [pathname, loadData]);
  
  // Реагируем на внешнее обновление из родительского компонента
  useEffect(() => {
    if (forceRefresh > 0) {
      loadData();
    }
  }, [forceRefresh, loadData]);
  
  // Обновляем данные при возвращении приложения из фона
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        loadData();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, loadData]);
  
  // Начальная загрузка данных
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Если бюджет не заполнен, показываем подсказку
  if (!budgetData || !budgetData.dailyLimit) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <ThemedText style={styles.emptyText}>
            Чтобы увидеть дневной лимит расходов, заполните данные бюджета
          </ThemedText>
          <TouchableOpacity 
            style={[styles.setupButton, { borderColor: '#007AFF' }]}
            onPress={() => router.push('/budget')}
          >
            <ThemedText style={{ color: '#007AFF' }}>
              Настроить бюджет
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }
  
  // Бюджет заполнен, показываем прогресс-бар
  console.log('BudgetProgressContainer передает данные:', {
    remainingLimit: budgetData.remainingDailyLimit,
    totalLimit: budgetData.dailyLimit,
    unusedFundsYesterday: budgetData.unusedFundsYesterday || 0
  });
  
  // Обеспечиваем, что все значения - числа
  // ВАЖНО: сохраняем отрицательное значение remainingLimit, если оно отрицательное,
  // это позволит компоненту DailyLimitProgressBar правильно определить превышение лимита
  const remainingLimit = isNaN(Number(budgetData.remainingDailyLimit)) ? 0 : budgetData.remainingDailyLimit;
  const totalLimit = isNaN(Number(budgetData.dailyLimit)) ? 0 : budgetData.dailyLimit;
  const unusedFundsYesterday = isNaN(Number(budgetData.unusedFundsYesterday)) ? 0 : budgetData.unusedFundsYesterday || 0;
  
  return (
    <DailyLimitProgressBar 
      remainingLimit={remainingLimit}
      totalLimit={totalLimit}
      unusedFundsYesterday={unusedFundsYesterday}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  setupButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  setupButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  setupIcon: {
    marginRight: 6,
  },
}); 