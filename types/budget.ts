export interface CriticalExpense {
  id: string;
  title: string;
  amount: number;
}

export interface OverLimitRecord {
  id: string;
  date: string;  // ISO строка
  amount: number;
  expenseId?: string;
  expenseTitle?: string;
}

export interface BudgetData {
  monthlyIncome: number;
  salaryDate: string; // ISO string
  criticalExpenses: CriticalExpense[];
  savingsGoal: number;
  dailyLimit: number;
  remainingDailyLimit: number;
  lastUpdateDate: string; // ISO string
  overLimitAmount?: number; // Сумма превышения дневного лимита
  overLimitHistory?: OverLimitRecord[]; // История превышений лимита
  savedUnusedFunds?: number; // Общая сумма сэкономленных средств
  unusedFundsYesterday?: number; // Неиспользованные средства за предыдущий день
} 