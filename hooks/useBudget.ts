import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetData, CriticalExpense } from '@/types/budget';

const BUDGET_STORAGE_KEY = 'budget_data';

const initialBudgetData: BudgetData = {
  monthlyIncome: 0,
  salaryDate: new Date().toISOString(),
  criticalExpenses: [],
  savingsGoal: 0,
  dailyLimit: 0,
  remainingDailyLimit: 0,
  lastUpdateDate: new Date().toISOString(),
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
        
        setBudgetData(updatedData);
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
      
      // Пересчитываем дневной лимит
      const dailyLimit = calculateDailyLimit(data);
      return {
        ...data,
        dailyLimit,
        remainingDailyLimit: dailyLimit,
        lastUpdateDate: today.toISOString()
      };
    }
    
    return data;
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

    // Защита от деления на ноль или отрицательные числа дней
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

  // Обновление оставшегося дневного лимита
  const updateRemainingLimit = async (spentAmount: number) => {
    if (!budgetData) return;

    const newData: BudgetData = {
      ...budgetData,
      remainingDailyLimit: Math.max(0, budgetData.remainingDailyLimit - spentAmount),
    };

    await saveBudgetData(newData);
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
    const newData: BudgetData = {
      monthlyIncome,
      salaryDate: salaryDate.toISOString(),
      criticalExpenses,
      savingsGoal,
      lastUpdateDate: new Date().toISOString(),
      dailyLimit: 0,
      remainingDailyLimit: 0,
    };

    const dailyLimit = calculateDailyLimit(newData);
    newData.dailyLimit = dailyLimit;
    newData.remainingDailyLimit = dailyLimit;

    await saveBudgetData(newData);
  };

  return {
    budgetData,
    loading,
    setIncomeData,
    addCriticalExpense,
    removeCriticalExpense,
    setSavingsGoal,
    updateRemainingLimit,
    resetBudget,
    updateBudgetData,
    loadBudgetData,
    checkAndUpdateDailyLimit,
  };
} 