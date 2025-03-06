export interface CriticalExpense {
  id: string;
  title: string;
  amount: number;
}

export interface BudgetData {
  monthlyIncome: number;
  salaryDate: string; // ISO string
  criticalExpenses: CriticalExpense[];
  savingsGoal: number;
  dailyLimit: number;
  remainingDailyLimit: number;
  lastUpdateDate: string; // ISO string
} 