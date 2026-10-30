export interface CreditTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  type: 'tts_generation' | 'monthly_renewal' | 'tier_upgrade' | 'top_up';
  description: string;
  createdAt: string;
}

export const globalTransactionsStore: CreditTransaction[] = [
  {
    id: "tx-init",
    amount: 10000,
    balanceAfter: 10000,
    type: "monthly_renewal",
    description: "Welcome grant: 10,000 starter credits",
    createdAt: new Date().toISOString(),
  },
];

export function addTransaction(amount: number, balanceAfter: number, type: CreditTransaction['type'], description: string) {
  globalTransactionsStore.unshift({
    id: `tx-${Date.now()}`,
    amount,
    balanceAfter,
    type,
    description,
    createdAt: new Date().toISOString(),
  });
}
