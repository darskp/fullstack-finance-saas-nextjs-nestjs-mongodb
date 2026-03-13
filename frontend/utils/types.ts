export type ITransactionData = {
  emoji: string;
  title: string;
  category: string;
  amount: string;
  date: Date | null;
  transactionType?: string;
  _id?: string;
};