
import { BadgeDollarSign, Bot, Home, TrendingDown, TrendingUp } from "lucide-react";

export const SIDEBAR_CONSTANTS = [
  {
    id: "/",
    title: "Dashboard",
    icon: Home,
  },

  {
    id: "/transactions",
    title: "Transactions",
    icon: BadgeDollarSign,
  },
  {
    id: "/income",
    title: "Income",
    icon: TrendingUp,
  },
  {
    id: "/expense",
    title: "Expense",
    icon: TrendingDown,
  },
  {
    id: "/ai-chat",
    title: "AI Assistant",
    icon: Bot,
  },
];

export const INCOME_CATEGORY_CONSTANTS: {
    value: string;
    title: string;
}[] = [
  {
    value: "business",
    title: "Business",
  },
  {
    value: "freelance",
    title: "Freelance",
  },
  {
    value: "salary",
    title: "Salary",
  },
  {
    value: "investment",
    title: "Investment",
  },
  {
    value: "rentalIncome",
    title: "Rental Income",
  },
  {
    value: "otherIncome",
    title: "Other Income",
  },
];

export const EXPENSE_CATEGORY_CONSTANTS: {
    value: string;
    title: string;
}[] = [
  {
    value: "food",
    title: "Food",
  },
  {
    value: "rent",
    title: "Rent",
  },
  {
    value: "utilities",
    title: "Utilities",
  },
  {
    value: "entertainment",
    title: "Entertainment",
  },
  {
    value: "transportation",
    title: "Transportation",
  },
  {
    value: "shopping",
    title: "Shopping",
  },
  {
    value: "healthcare",
    title: "Healthcare",
  },
  {
    value: "otherExpense",
    title: "Other Expense",
  },
];

export const USER_IMAGE = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
export const TOTAL_BALANCE_IMAGE =
  "https://cdn-icons-png.flaticon.com/128/2169/2169864.png";
export const INCOME_IMAGE = "https://cdn-icons-png.flaticon.com/128/3176/3176837.png";
export const EXPENSE_IMAGE = "https://cdn-icons-png.flaticon.com/128/3176/3176833.png";
export const TOTAL_TRANSACTION_IMAGE =
  "https://cdn-icons-png.flaticon.com/128/10691/10691348.png";
