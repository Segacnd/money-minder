import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetData, CriticalExpense, OverLimitRecord } from '@/types/budget';
import { ExpenseService } from '@/services/ExpenseService';
import { Expense } from '@/types/expenses';

const BUDGET_STORAGE_KEY = 'budget_data';

const initialBudgetData: BudgetData = {
  monthlyIncome: 0,
  salaryDate: new Date().toISOString(),
  criticalExpenses: [],
  savingsGoal: 0,
  dailyLimit: 0,
  remainingDailyLimit: 0,
  lastUpdateDate: new Date().toISOString(),
  overLimitAmount: 0,
  overLimitHistory: [],
};

export function useBudget() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных при инициализации
  useEffect(() => {
    loadBudgetData();
  }, []);

  // Загрузка данных из хранилища
  const loadBudgetData = async () => {
    try {
      const data = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        // Проверяем, нужно ли обновить дневной лимит
        const updatedData = checkAndUpdateDailyLimit(parsedData);
        
        // Если данные были обновлены, сохраняем их
        if (updatedData !== parsedData) {
          await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedData));
        }
        
        // Учитываем уже существующие расходы за сегодня
        const finalData = await updateRemainingLimitWithExistingExpenses(updatedData);
        
        setBudgetData(finalData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке данных бюджета:', error);
      setLoading(false);
    }
  };

  // Проверяем, нужно ли обновить дневной лимит (например, наступил новый день)
  const checkAndUpdateDailyLimit = (data: BudgetData): BudgetData => {
    // Получаем дату последнего обновления
    const lastUpdateDate = new Date(data.lastUpdateDate);
    const today = new Date();
    
    // Если последнее обновление было в другой день, нужно обновить дневной лимит
    if (lastUpdateDate.getDate() !== today.getDate() || 
        lastUpdateDate.getMonth() !== today.getMonth() || 
        lastUpdateDate.getFullYear() !== today.getFullYear()) {
      
      // Сохраняем неиспользованные средства предыдущего дня (если есть)
      const unusedFunds = Math.max(0, data.remainingDailyLimit);
      
      // Пересчитываем дневной лимит с учетом оставшихся дней до зарплаты
      const dailyLimit = calculateDailyLimit(data);
      
      // Добавляем неиспользованные средства к расчету нового лимита
      // Распределяем их на оставшиеся дни до следующей зарплаты
      const daysUntilSalary = getDaysUntilSalary(data);
      
      // Предотвращаем деление на ноль или отрицательное число дней
      const adjustedDays = Math.max(1, daysUntilSalary - 1); // -1 потому что сегодняшний день уже учтен
      
      // Добавляем неиспользованные средства к дневному лимиту, распределив их на оставшиеся дни
      const adjustedDailyLimit = unusedFunds > 0 && adjustedDays > 0 
        ? dailyLimit + (unusedFunds / adjustedDays)
        : dailyLimit;
      
      // Сохраняем информацию о неиспользованных средствах для аналитики
      const savedUnusedFunds = data.savedUnusedFunds || 0;
      
      return {
        ...data,
        dailyLimit: adjustedDailyLimit,
        remainingDailyLimit: adjustedDailyLimit,
        lastUpdateDate: today.toISOString(),
        savedUnusedFunds: savedUnusedFunds + unusedFunds,
        unusedFundsYesterday: unusedFunds
      };
    }
    
    return data;
  };
  
  // Получаем количество дней до следующей зарплаты
  const getDaysUntilSalary = (data: BudgetData): number => {
    const today = new Date();
    const salaryDate = new Date(data.salaryDate);
    
    // Приводим дату зарплаты к текущему месяцу
    salaryDate.setFullYear(today.getFullYear());
    salaryDate.setMonth(today.getMonth());
    
    // Если дата зарплаты уже прошла в этом месяце, значит следующая будет в следующем месяце
    if (today > salaryDate) {
      salaryDate.setMonth(salaryDate.getMonth() + 1);
    }
    
    // Рассчитываем количество дней до зарплаты
    const diffTime = Math.abs(salaryDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Сохранение данных в хранилище
  const saveBudgetData = async (data: BudgetData) => {
    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(data));
      setBudgetData(data);
    } catch (error) {
      console.error('Ошибка при сохранении данных бюджета:', error);
    }
  };

  // Расчет дневного лимита
  const calculateDailyLimit = (data: BudgetData) => {
    const totalCriticalExpenses = data.criticalExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    
    let availableAmount = data.monthlyIncome - totalCriticalExpenses - data.savingsGoal;
    
    // Получаем количество дней до следующей зарплаты
    const today = new Date();
    const salaryDate = new Date(data.salaryDate);
    
    // Приводим дату зарплаты к текущему месяцу
    salaryDate.setFullYear(today.getFullYear());
    salaryDate.setMonth(today.getMonth());
    
    // Создаем дату следующей зарплаты
    const nextSalaryDate = new Date(salaryDate);
    nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
    
    let daysUntilSalary;
    
    // Если сегодня уже после даты зарплаты текущего месяца, считаем до следующей зарплаты
    if (today >= salaryDate) {
      daysUntilSalary = Math.ceil(
        (nextSalaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
    } else {
      // Если сегодня до даты зарплаты, считаем от предыдущей зарплаты до следующей
      const prevSalaryDate = new Date(salaryDate);
      prevSalaryDate.setMonth(prevSalaryDate.getMonth() - 1);
      
      // Общее количество дней между зарплатами
      const totalDays = Math.ceil(
        (salaryDate.getTime() - prevSalaryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Сколько дней осталось до следующей зарплаты
      daysUntilSalary = Math.ceil(
        (salaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Корректируем доступную сумму, так как прошла только часть периода
      availableAmount = availableAmount * (daysUntilSalary / totalDays);
    }

    // Защита от деления на ноль или отрицательных чисел дней
    daysUntilSalary = Math.max(1, daysUntilSalary);

    return Math.max(0, availableAmount / daysUntilSalary);
  };

  // Установка месячного дохода и даты зарплаты
  const setIncomeData = async (monthlyIncome: number, salaryDate: Date) => {
    const newData: BudgetData = {
      ...(budgetData || initialBudgetData),
      monthlyIncome,
      salaryDate: salaryDate.toISOString(),
    };
    
    const dailyLimit = calculateDailyLimit(newData);
    newData.dailyLimit = dailyLimit;
    newData.remainingDailyLimit = dailyLimit;
    newData.lastUpdateDate = new Date().toISOString();
    
    await saveBudgetData(newData);
  };

  // Добавление критического расхода
  const addCriticalExpense = async (title: string, amount: number) => {
    if (!budgetData) return;

    const newExpense: CriticalExpense = {
      id: Date.now().toString(),
      title,
      amount,
    };

    const newData: BudgetData = {
      ...budgetData,
      criticalExpenses: [...budgetData.criticalExpenses, newExpense],
    };

    const dailyLimit = calculateDailyLimit(newData);
    newData.dailyLimit = dailyLimit;
    newData.remainingDailyLimit = dailyLimit;
    
    await saveBudgetData(newData);
  };

  // Удаление критического расхода
  const removeCriticalExpense = async (id: string) => {
    if (!budgetData) return;

    const newData: BudgetData = {
      ...budgetData,
      criticalExpenses: budgetData.criticalExpenses.filter(exp => exp.id !== id),
    };

    const dailyLimit = calculateDailyLimit(newData);
    newData.dailyLimit = dailyLimit;
    newData.remainingDailyLimit = dailyLimit;
    
    await saveBudgetData(newData);
  };

  // Установка цели по накоплениям
  const setSavingsGoal = async (amount: number) => {
    if (!budgetData) return;

    const newData: BudgetData = {
      ...budgetData,
      savingsGoal: amount,
    };

    const dailyLimit = calculateDailyLimit(newData);
    newData.dailyLimit = dailyLimit;
    newData.remainingDailyLimit = dailyLimit;
    
    await saveBudgetData(newData);
  };

  // Обновление дневного лимита с учетом уже существующих расходов за сегодня
  const updateRemainingLimitWithExistingExpenses = async (data: BudgetData): Promise<BudgetData> => {
    try {
      // Получаем все расходы
      const expenses = await ExpenseService.getExpenses();
      
      // Фильтруем расходы за сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.timestamp);
        return expenseDate >= today && expenseDate < tomorrow;
      });
      
      // Считаем общую сумму сегодняшних расходов
      const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Вычисляем оставшийся дневной лимит (ИСПРАВЛЕНО: теперь может быть отрицательным)
      const remainingDailyLimit = data.dailyLimit - todayTotal;
      
      // Сохраняем данные о превышении лимита
      const overLimitAmount = todayTotal > data.dailyLimit ? todayTotal - data.dailyLimit : 0;
      
      console.log('useBudget: расчет лимита:', {
        dailyLimit: data.dailyLimit,
        todayTotal,
        remainingDailyLimit,
        overLimitAmount
      });
      
      // Проверяем если есть превышение лимита и создаем запись в истории
      let overLimitHistory = data.overLimitHistory || [];
      
      if (overLimitAmount > 0) {
        // Если сумма превышена, находим расход, который привел к превышению
        let runningTotal = 0;
        let overLimitExpenses: Expense[] = [];
        
        // Сортируем расходы по времени
        const sortedExpenses = [...todayExpenses].sort((a, b) => a.timestamp - b.timestamp);
        
        // Проходим по всем расходам и определяем, какие привели к превышению
        for (const expense of sortedExpenses) {
          runningTotal += expense.amount;
          // Если после добавления расхода сумма превышает лимит, добавляем его в список
          if (runningTotal > data.dailyLimit) {
            overLimitExpenses.push(expense);
          }
        }
        
        // Добавляем записи о превышении лимита
        for (const expense of overLimitExpenses) {
          // Проверяем, существует ли уже запись для этого расхода
          const existingRecordIndex = overLimitHistory.findIndex(
            record => record.expenseId === expense.id
          );
          
          if (existingRecordIndex === -1) {
            // Создаем новую запись
            const record: OverLimitRecord = {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              date: new Date(expense.timestamp).toISOString(),
              amount: expense.amount,
              expenseId: expense.id,
              expenseTitle: expense.title
            };
            
            overLimitHistory = [...overLimitHistory, record];
          }
        }
      }
      
      return {
        ...data,
        remainingDailyLimit,  // ИСПРАВЛЕНО: теперь может быть отрицательным
        overLimitAmount,
        overLimitHistory
      };
    } catch (error) {
      console.error('Ошибка при обновлении лимита с учетом существующих расходов:', error);
      return data;
    }
  };

  // Обновление оставшегося дневного лимита
  const updateRemainingLimit = async (spentAmount: number, expense?: { 
    amount: number; 
    title?: string;
    category?: string; 
    description?: string;
    icon?: string;
  }) => {
    if (!budgetData) return;

    // ИСПРАВЛЕНО: оставшийся лимит может быть отрицательным
    const remainingAfterSpent = budgetData.remainingDailyLimit - spentAmount;
    
    const newData: BudgetData = {
      ...budgetData,
      remainingDailyLimit: remainingAfterSpent,
    };

    // Обновляем сумму превышения лимита, если необходимо
    if (budgetData.remainingDailyLimit < spentAmount) {
      const overLimitAmount = (budgetData.overLimitAmount || 0) + (spentAmount - budgetData.remainingDailyLimit);
      newData.overLimitAmount = overLimitAmount;
      
      // Добавляем запись в историю превышений
      if (expense) {
        const expenseId = Date.now().toString();
        const overLimitRecord: OverLimitRecord = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
          amount: spentAmount - budgetData.remainingDailyLimit,
          expenseId,
          expenseTitle: expense.title || 'Без названия'
        };
        
        newData.overLimitHistory = [
          ...(budgetData.overLimitHistory || []),
          overLimitRecord
        ];
      }
    }

    console.log('updateRemainingLimit: новые данные', {
      originalRemaining: budgetData.remainingDailyLimit,
      spent: spentAmount,
      newRemaining: remainingAfterSpent,
      overLimit: budgetData.remainingDailyLimit < spentAmount
    });

    await saveBudgetData(newData);
  };

  // Получение истории превышений лимита
  const getOverLimitHistory = () => {
    return budgetData?.overLimitHistory || [];
  };

  // Сброс всех данных
  const resetBudget = async () => {
    await saveBudgetData(initialBudgetData);
  };

  // Обновление всех данных бюджета
  const updateBudgetData = async (
    monthlyIncome: number,
    salaryDate: Date,
    criticalExpenses: CriticalExpense[],
    savingsGoal: number
  ) => {
    console.log('[DEBUG] updateBudgetData: начало обновления бюджета', {
      monthlyIncome,
      salaryDate: salaryDate.toISOString(),
      criticalExpenses: criticalExpenses.length,
      savingsGoal
    });

    try {
      // Проверка типов и защита от некорректных данных
      const validMonthlyIncome = isNaN(monthlyIncome) ? 0 : monthlyIncome;
      const validSalaryDate = salaryDate instanceof Date ? salaryDate : new Date();
      const validCriticalExpenses = Array.isArray(criticalExpenses) ? criticalExpenses : [];
      const validSavingsGoal = isNaN(savingsGoal) ? 0 : savingsGoal;

      const newData: BudgetData = {
        monthlyIncome: validMonthlyIncome,
        salaryDate: validSalaryDate.toISOString(),
        criticalExpenses: validCriticalExpenses,
        savingsGoal: validSavingsGoal,
        lastUpdateDate: new Date().toISOString(),
        dailyLimit: 0,
        remainingDailyLimit: 0,
        overLimitAmount: 0,
        overLimitHistory: [],
      };

      const dailyLimit = calculateDailyLimit(newData);
      newData.dailyLimit = dailyLimit;
      newData.remainingDailyLimit = dailyLimit;

      // Учитываем уже существующие расходы за сегодня
      const updatedData = await updateRemainingLimitWithExistingExpenses(newData);

      await saveBudgetData(updatedData);
      console.log('[DEBUG] updateBudgetData: успешно завершено');
    } catch (error) {
      console.error('[DEBUG] updateBudgetData: ошибка при обновлении', error);
      throw error;
    }
  };

  return {
    budgetData,
    loading,
    setIncomeData,
    addCriticalExpense,
    removeCriticalExpense,
    setSavingsGoal,
    resetBudget,
    loadBudgetData,
    updateRemainingLimit,
    updateBudgetData,
    updateRemainingLimitWithExistingExpenses,
    getOverLimitHistory,
    checkAndUpdateDailyLimit,
  };
} 