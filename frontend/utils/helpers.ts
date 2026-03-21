import { ChartPoint, ChartTypes, ITransactionData, NewCategoriesDataType } from "./types"

const formatAmount = (amount: number) => {
    if (isNaN(amount) || amount === undefined || amount === null) return '0';
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1e15) return (amount / 1e15).toFixed(1).replace(/\.0$/, '') + 'Q';
    if (absAmount >= 1e12) return (amount / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
    if (absAmount >= 1e9)  return (amount / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (absAmount >= 1e6)  return (amount / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (absAmount >= 1e3)  return (amount / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    
    return amount.toString();
}

const fetchTransactionsList = (list: ITransactionData[]) => {
    const chartData = list.map((t: ITransactionData) => {
        return {
            x: new Date(t.date || ""),
            y: Number(t.amount),
            type: t.transactionType,
            icon: t.emoji,
            category: t.category
        }
    })

    const sortedChartedDataByDate = chartData.sort((a, b) => a.x.getTime() - b.x.getTime())
    const newSeriesData = sortedChartedDataByDate.map((point, index: number) => {
        const { y, type, icon, category, x } = point || {};

        return {
            x: index,
            y,
            type,
            icon,
            tCategory: category,
            rawDate: x,
            color: type?.toLowerCase() === "income" ? "#22c55e" : "#EF5350",
        };
    })

    const newCategoriesData = sortedChartedDataByDate.map((p) =>
        p.x.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        }))

    return {
        newSeriesData,
        newCategoriesData
    }
}

const getChartOptions = (
    categories: any,
    seriesData: NewCategoriesDataType[],
    chartType: ChartTypes = "column",
    color?: string,
): Highcharts.Options => {
    return {
        title: {
            text: "",
        },
        xAxis: {
            type: "category",
            categories,
        },
        credits: {
            enabled: false,
        },
        chart: {
            height: 200,
            backgroundColor: "transparent",
        },
        legend: {
            enabled: false,
        },
        yAxis: {
            title: {
                text: "",
            },
        },
        tooltip: {
            shape: "rect",
            useHTML: true,
            shadow: false,
            backgroundColor: "white",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: function (this: any) {
                const point = this.point;
                const { type, icon, tCategory } = point;
                const dataLabel = categories[this.x];
                const textClass = type === "Income" ? "text-green-500" : "text-red-500";

                return `<div class="p-2 border shadow rounded-md flex flex-col items-center justify-start">
            <div class="flex w-full justify-between">
              <span class="text-sm">Date:</span>
              <span class="font-medium text-sm">${dataLabel}</span>
            </div>
            <div class="flex items-center justify-between w-full gap-1">
              <div class="flex justify-between items-center">
                <span class="text-sm">Category:</span>
              </div>
              <span class="font-medium text-sm">${tCategory}</span>
          </div>
            <div class="flex items-center justify-between w-full">
              <div class="flex justify-between items-center">
                <span class="text-sm">${icon}</span>
               <span class="text-sm">${type === "Income" ? "Income:" : "Expense:"
                    }</span>
              </div>
              <span class="font-medium ${textClass} text-sm">$${formatAmount(Number(this.y) || 0)}</span>
          </div>          
        </div>
    `;
            },
        },
        plotOptions: {
            column: {
                borderRadius: 8,
            },
        },
        series: [
            {
                type: chartType,
                data: seriesData,
                ...(color ? { color: color } : {}),
            },
        ] as any,
    };
}


const tableColumns: {}[] = [
    {
        name: 'Icon',
        id: 1
    }, {
        name: 'Title',
        id: 2
    }, {
        name: 'Type',
        id: 3
    }, {
        name: 'Category',
        id: 4
    }, {
        name: 'Date',
        id: 5
    }, {
        name: 'Amount',
        id: 6
    }, {
        name: 'Edit',
        id: 7
    }, {
        name: 'Delete',
        id: 8
    }
]

const getMonthlyIncomeExpense = async (
    incomeList: ITransactionData[],
    expenseList: ITransactionData[]
) => {
    const monthData: Record<string, { income: number; expense: number; label: string }> = {};

    const processItem = (item: ITransactionData, type: 'income' | 'expense') => {
        if (!item?.date) return;
        const d = new Date(item.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthData[key]) {
            monthData[key] = {
                income: 0,
                expense: 0,
                label: d.toLocaleString("default", {
                    month: "short",
                    year: "2-digit",
                })
            };
        }
        monthData[key][type] += Number(item.amount);
    };

    incomeList?.forEach((item) => processItem(item, 'income'));
    expenseList?.forEach((item) => processItem(item, 'expense'));

    const sortedKeys = Object.keys(monthData).sort();

    const categories = sortedKeys.map((key) => monthData[key].label);
    const incomeSeries = sortedKeys.map((key) => monthData[key].income);
    const expenseSeries = sortedKeys.map((key) => monthData[key].expense);

    return { incomeSeries, expenseSeries, categories };
}

const getMoneyFlowOptions = (categories: string[],
    incomeSeries: number[],
    expenseSeries: number[]
): Highcharts.Options => {
    return {
        chart: {
            type: "column",
            backgroundColor: "transparent",
            marginTop: 45,
            height: 350,
            scrollablePlotArea: {
                minWidth: categories.length > 10 ? categories.length * 60 : undefined,
                scrollPositionX: 1,
                opacity: 0,
            }
        },
        title: {
            text: "",
        },
        legend: {
            align: "right",
            verticalAlign: "top",
            layout: "horizontal",
            symbolRadius: 6,
            symbolHeight: 10,
            symbolWidth: 10,
            itemStyle: {
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
            },
            y: -22,
        },

        xAxis: {
            categories,
            title: {
                text: "",
            },
            labels: {
                style: { fontSize: "12px", fontWeight: "500", color: "#6a7282" },
            },
        },
        yAxis: {
            title: {
                text: "",
            },
            labels: {
                style: { fontSize: "12px", fontWeight: "500", color: "#6a7282" },
                formatter: function () {
                    return `$${formatAmount(Number(this.value))}`;
                },
            },
            gridLineColor: "#e0e0e0",
        },
        tooltip: {
            shape: "rect",
            useHTML: true,
            shadow: false,
            backgroundColor: "transparent",
            formatter: function () {
                return `<div class="bg-white py-1 px-4 text-base font-medium border border-gray-300 rounded-3xl">$${formatAmount(Number(this.y) || 0)}</div>`;
            },
        },
        plotOptions: {
            column: {
                grouping: true,
                borderWidth: 0,
                maxPointWidth: 30,
                borderRadius: 8,
                groupPadding: 0.3,
                pointPadding: 0.1,
                states: {
                    hover: {
                        enabled: false,
                    },
                    inactive: {
                        enabled: false,
                    },
                },
            },
        },
        credits: {
            enabled: false,
        },
        series: [
            {
                name: "Income",
                type: "column",
                data: incomeSeries,
                color: "#22c55e",
            },
            {
                name: "Expense",
                type: "column",
                data: expenseSeries,
                color: "#EF5350",
            },
        ],
    };

}

const getPieChartOptions = (categorySeries: { name: string, y: number }[]): Highcharts.Options => {
    let totalValue = 0;
    categorySeries.forEach((ct) => {
        totalValue += ct.y;
    });

    return {
        chart: {
            type: "pie",
            backgroundColor: "transparent",
            height: 350,
        },
        credits: {
            enabled: false,
        },
        title: {
            useHTML: true,
            text: `<div style="text-align: center; line-height: 1.2;">
        <div style="font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Total</div>
        <div style="font-size: 18px; font-weight: 700; color: #1f2937;">$${formatAmount(totalValue)}</div>
      </div>`,
            floating: true,
            verticalAlign: "middle",
            align: "center",
            y: -12,
        },
        legend: {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
            floating: false,
            maxHeight: 100,
            navigation: {
                enabled: true,
            },
            itemStyle: {
                fontSize: "12px",
                fontWeight: "500",
                color: "#6a7282",
            },
            itemMarginBottom: 4,
        },
        tooltip: {
            shape: "rect",
            useHTML: true,
            shadow: false,
            backgroundColor: "transparent",
            formatter: function () {
                return `<div class="bg-white py-1 px-4 text-base 
        font-medium border border-gray-300 rounded-full">$${formatAmount(Number(this.y) || 0)}</div>`;
            },
        },
        plotOptions: {
            pie: {
                innerSize: "70%",
                size: "80%",
                borderWidth: 4,
                borderColor: "#f4f4f4",
                borderRadius: 20,
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
                states: {
                    hover: {
                        enabled: false,
                    },
                    inactive: {
                        enabled: false,
                    },
                },
            },
        },
        series: [
            {
                type: "pie",
                data: categorySeries,
            },
        ],
    };

}

const getCategoryWiseValue = (transactions: ITransactionData[]) => {
  const categoryMap: Record<string, number> = {};

  transactions?.forEach((tr) => {
    if (!categoryMap[tr.category]) {
      categoryMap[tr.category] = 0;
    }

    categoryMap[tr.category] += Number(tr.amount);
  });

  const category = Object.entries(categoryMap).map(([name, y]) => ({
    name,
    y,
  }));

  return category;
};


export { formatAmount, getChartOptions, fetchTransactionsList, tableColumns, getMonthlyIncomeExpense, getMoneyFlowOptions, getPieChartOptions, getCategoryWiseValue }