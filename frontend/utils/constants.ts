
import { BadgeDollarSign, Home, TrendingDown, TrendingUp } from "lucide-react";

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