import { ChartPoint, ChartTypes, ITransactionData, NewCategoriesDataType } from "./types"

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
        };
    })

    const newCategoriesData = sortedChartedDataByDate.map((p) =>
        p.x.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }))

    return {
        newSeriesData,
        newCategoriesData
    }
}

const getChartOptions = (
    categories: any,
    seriesData: NewCategoriesDataType[],
    chartType: ChartTypes = "column"
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
            height: 250,
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
                const textClass = "text-green-500";

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
                <span class="text-sm">Income</span>
              </div>
              <span class="font-medium ${textClass} text-sm">$${this.y}</span>
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
                color: "#8271fe",
            },
        ],
    };
}

export { getChartOptions, fetchTransactionsList }