
import { createChart, CandlestickSeries, CrosshairMode, type ISeriesApi, type CandlestickData, type UTCTimestamp } from 'lightweight-charts'
import { useState, useEffect, useRef } from 'react'

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
    const today = new Date(Date.now()).toISOString().slice(0, 10)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

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

        return () => {
            seriesRef.current = null
            chart.remove()
        }
    }, [])

    useEffect(() => {
        if (!seriesRef.current || data.length === 0) return
        seriesRef.current.setData(data as CandlestickData[])
    }, [data])

    const handleSubmit = async () => {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement).value
        const queryString = `${get('ticker')}_${get('TFAmount')}_${get('TFUnit')}_${get('start')}_${get('end')}`

        if (query === queryString) return

        const raw: Record<string, Bar> = JSON.parse(
            await (await fetch(`http://localhost:8000/bars/${queryString}`)).json()
        )
        setData(Object.values(raw))
        setQuery(queryString)
    }

    return (
        <>
            <div id='filters' className='w-screen bg-green-100 h-[10vh] flex basis-0.2 gap-4 p-3'>
                <input type='text' id='ticker' defaultValue='GOOGL' className='border-black border' />
                <input type='number' id='TFAmount' defaultValue={1} className='border-black border' />
                <select id='TFUnit' defaultValue='Day' className='border-black border'>
                    <option value='Min'>Minute</option>
                    <option value='Hour'>Hour</option>
                    <option value='Day'>Day</option>
                    <option value='Week'>Week</option>
                    <option value='Month'>Month</option>
                </select>
                <input type='date' id='start' min='2016-08-01' max={today} />
                <input type='date' id='end' defaultValue={today} min='2016-08-02' max={today} />
                <button id='fetchData' className='bg-blue-600 w-20' onClick={handleSubmit}></button>
            </div>
            <div id='chartContainer' className='w-screen h-[90vh]' />
        </>
    )
}