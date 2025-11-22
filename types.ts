export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum CategoryType {
  FOOD = 'Food',
  SHOPPING = 'Shopping',
  TRANSPORT = 'Transport',
  BILLS = 'Bills',
  HEALTH = 'Health',
  SALARY = 'Salary',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO String
  type: TransactionType;
  category: CategoryType;
  icon?: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  logoUrl?: string;
}

export interface NotificationPreferences {
  billReminders: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  totalBalance: number;
  notificationPreferences: NotificationPreferences;
  currency: string;
}

export type ViewState = 'HOME' | 'EXPENSES' | 'BILLS' | 'REPORTS' | 'PROFILE';