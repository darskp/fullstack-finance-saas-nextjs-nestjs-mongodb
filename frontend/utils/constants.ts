
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