export interface Purchase {
  id: string;
  name: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface Week {
  startDate: string; // Sunday YYYY-MM-DD
  budget: number;
  purchases: Purchase[];
}

export interface AppData {
  weeks: Record<string, Week>;
  defaultBudget: number;
}

export interface WeekSummary {
  startDate: string;
  endDate: string;
  totalSpent: number;
  budget: number;
  isOverBudget: boolean;
}
