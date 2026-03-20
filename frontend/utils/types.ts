export type ITransactionData = {
  emoji: string;
  title: string;
  category: string;
  amount: string;
  date: Date | null;
  transactionType?: string;
  _id?: string;
};

export type ChartPoint = {
  x: Date;
  y: number;
  type: string;
  icon: string;
  category: string;
};

 export type NewCategoriesDataType={
    x: number;
    y: number;
    type: string;
    icon: string;
    tCategory: string;
    rawDate?: Date;
    color?: string;
}

export type ChartTypes = "line" | "column" | "bar";

export type CardProps = {
  title: string;
  imgSrc: string;
  value: number;
};