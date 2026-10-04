
import { createChart, CandlestickSeries, type IChartApi } from 'lightweight-charts'

setTimeout(() => {
    const container = document.getElementById('container')
let chart: IChartApi
if (container){
    // const chartOptions = {autoSize: true, layout: { textColor: 'black', background: { color: 'white' } } };
    chart = createChart(container)//, chartOptions);
    const candles = chart.addSeries(CandlestickSeries)//, {
    // upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
    // wickUpColor: '#26a69a', wickDownColor: '#ef5350',})
    candles.setData([
        { time: '2026-09-21', open: 350.64, high: 357.61, low: 349.10, close: 354.97},
        { time: '2026-09-22', open: 357.65, high: 364.17, low: 350.22, close: 351.16},
        { time: '2026-09-23', open: 349.86, high: 350.00, low: 337.45, close: 337.83},
        { time: '2026-09-24', open: 336.22, high: 343.09, low: 336.02, close: 342.36},
        { time: '2026-09-25', open: 342.35, high: 347.03, low: 341.11, close: 343.92},
    ])
    // chart.timeScale().fitContent()
}
}, 0)