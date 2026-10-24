
import { createChart, CandlestickSeries, CrosshairMode, type ISeriesApi, type CandlestickData, type UTCTimestamp, type MouseEventParams } from 'lightweight-charts'
import { useState, useEffect, useRef, type RefObject } from 'react'
import { Search, Clock, Calendar, ArrowRight } from 'lucide-react'

interface Bar {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
}

const ET_FORMATTER = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
})

const formatET = (utcSeconds: number): string =>
    ET_FORMATTER.format(new Date(utcSeconds * 1000))

export default function Chart() {
    const [data, setData] = useState<Bar[]>([])
    const [query, setQuery] = useState<string>('')
    const [ticker_TF, setTicker_TF] = useState<[string, string, string]>(['GOOGL', '1', 'Day'])
    const today = new Date(Date.now()).toISOString().slice(0, 10)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const legendRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const chart = createChart('chartContainer', {
            autoSize: true,
            crosshair: { mode: CrosshairMode.MagnetOHLC },
            timeScale: {
                rightBarStaysOnScroll: true,
                timeVisible: true,
                secondsVisible: false,
            },
            localization: {
                timeFormatter: (utcSeconds: number) => formatET(utcSeconds),
            },
        })
        seriesRef.current = chart.addSeries(CandlestickSeries)

        const updateLegend = (param: MouseEventParams) => {
            if (param.point && seriesRef.current && legendRef.current){
                const data = param.seriesData.get(seriesRef.current) as Bar
                if (data) {
                    legendRef.current.innerHTML = `
                        ${data['open'].toFixed(2)}<br> 
                        ${data['high'].toFixed(2)}<br>
                        ${data['low'].toFixed(2)}<br>
                        ${data['close'].toFixed(2)}
                    `
                    legendRef.current.style.color = data['open'] < data['close'] ? 'green' : 'red'
                }
            }
        }
        chart.subscribeCrosshairMove(updateLegend)

        return () => {
            seriesRef.current = null
            chart.unsubscribeCrosshairMove(updateLegend)
            chart.remove()
        }
    }, [])

    useEffect(() => {
        if (!seriesRef.current || data.length === 0) return
        seriesRef.current.setData(data as CandlestickData[])
    }, [data])

    const handleSubmit = async () => {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement).value
        const ticker = get('ticker')
        const TFAmount = get('TFAmount')
        const TFUnit = get('TFUnit')

        const queryString = `${ticker}_${TFAmount}_${TFUnit}_${get('start')}_${get('end')}`

        if (query === queryString) return

        const raw: Record<string, Bar> = JSON.parse(
            await (await fetch(`http://localhost:8000/bars/${queryString}`)).json()
        )
        setData(Object.values(raw))
        setQuery(queryString)
        setTicker_TF([ticker, TFAmount, TFUnit])
    }

    return (
        <div className='w-screen h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden'>
            <div id='filters' className='w-full bg-zinc-950/95 backdrop-blur border-b border-zinc-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md'>
                <div className='flex flex-wrap items-center gap-2.5'>
                    <div className='flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/70 hover:border-zinc-600 rounded-md px-2.5 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all'>
                        <Search className='w-3.5 h-3.5 text-zinc-400' />
                        <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-400'>Ticker</span>
                        <input type='text' id='ticker' defaultValue='GOOGL' className='bg-transparent text-xs font-mono font-bold tracking-wider text-white uppercase w-16 focus:outline-none'/>
                    </div>
                    <div className='flex items-center gap-1 bg-zinc-900 border border-zinc-700/70 hover:border-zinc-600 rounded-md px-2 py-1 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all'>
                        <Clock className='w-3.5 h-3.5 text-zinc-400 ml-0.5' />
                        <input type='number' id='TFAmount' defaultValue={1} min={1} className='bg-transparent text-xs font-semibold text-white w-8 text-center focus:outline-none'/>
                        <div className='h-3.5 w-px bg-zinc-700' />
                        <select id='TFUnit' defaultValue='Day' className='bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer pr-1'>
                            <option value='Min' className='bg-zinc-900 text-zinc-100'>Minute</option>
                            <option value='Hour' className='bg-zinc-900 text-zinc-100'>Hour</option>
                            <option value='Day' className='bg-zinc-900 text-zinc-100'>Day</option>
                            <option value='Week' className='bg-zinc-900 text-zinc-100'>Week</option>
                            <option value='Month' className='bg-zinc-900 text-zinc-100'>Month</option>
                        </select>
                    </div>
                    <div className='flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/70 hover:border-zinc-600 rounded-md px-2.5 py-1 text-xs text-zinc-300 transition-all'>
                        <Calendar className='w-3.5 h-3.5 text-zinc-400' />
                        <span className='text-[10px] uppercase font-semibold text-zinc-400'>From</span>
                        <input type='date' id='start' min='2016-08-01' max={today} className='bg-transparent text-xs text-zinc-200 focus:outline-none scheme-dark'/>
                        <span className='text-zinc-500 text-xs px-0.5'>→</span>
                        <span className='text-[10px] uppercase font-semibold text-zinc-400'>To</span>
                        <input type='date' id='end' defaultValue={today} min='2016-08-02' max={today} className='bg-transparent text-xs text-zinc-200 focus:outline-none scheme-dark'/>
                    </div>
                    <button id='fetchData' onClick={handleSubmit} className='bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-950/50 cursor-pointer'>
                        <span>Load Bars</span>
                        <ArrowRight className='w-3.5 h-3.5' />
                    </button>
                </div>
            </div>
            <div id='chartContainer' className='w-full flex-1 relative'>
                <Legend ticker_TF={ticker_TF} legendRef={legendRef}/>
            </div>
        </div>
    )
}

export function Legend( { ticker_TF, legendRef }: {ticker_TF: [string, string, string], legendRef: RefObject<HTMLDivElement | null>} ){
    const [ticker, tfAmount, tfUnit] = ticker_TF
    const abbreviate = (tfUnit: string) => {
        if (tfUnit == 'Min'){
            return 'm'
        } else {
            return tfUnit[0]
        }
    }

    return(
        <div className='w-fit h-fit top-2 left-2 pl-3 pr-3 absolute border-black border-2 bg-blue-50/60 z-2 text-center text-black font-bold rounded-lg'>
            <div>{ticker.toUpperCase()} • {`${tfAmount}${abbreviate(tfUnit)}`}</div>
            <div className='flex gap-4'>
                <div>O <br/>H <br/>L <br/>C <br/></div>
                <div ref={legendRef} />
            </div>
        </div>
    )
}