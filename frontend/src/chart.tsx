
import { createChart, CandlestickSeries} from 'lightweight-charts'
import { useState, useEffect, useRef } from 'react'

interface Bars {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export default function Chart(){
    const [data, setData] = useState<Array<Bars>>()
    const [query, setQuery] = useState<string>()
    const today = new Date(Date.now()).toISOString().slice(0,10)
    // const chartContainerRef = useRef<any>("")

    // useEffect(() => {
        // chartContainerRef.current = document.getElementById('chartContainer')
    // }, [])

    useEffect(() => {
        // const container = chartContainerRef.current
        const chart = createChart('chartContainer')
        if (data){
            const candles = chart.addSeries(CandlestickSeries)
            candles.setData(data)
        }

        return () => {
            chart.remove()
        }
    }, [data])

    const handleSubmit = async () => {
        const ticker = document.getElementById('ticker') as HTMLInputElement
        const TFAmount = document.getElementById('TFAmount') as HTMLInputElement
        const TFUnit = document.getElementById('TFUnit') as HTMLInputElement
        const start = document.getElementById('start') as HTMLInputElement
        const end = document.getElementById('end') as HTMLInputElement
        
        const queryString = `${ticker.value}_${TFAmount.value}_${TFUnit.value}_${start.value}_${end.value}`

        if (query != queryString){
            const response = JSON.parse(await (await fetch(`http://localhost:8000/bars/${queryString}`)).json()) // backend api_base in config.py
            const newData: Array<Bars> = Object.values(response)
            
            setData(newData)
            setQuery(queryString)
        }
    }
    return (
        <>
            <div id='filters' className='w-screen bg-green-100 h-[10vh] flex basis-0.2 gap-4 p-3'>
                <input type='text' id='ticker' defaultValue='GOOGL' className='border-black border'></input>
                <input type='number' id='TFAmount' defaultValue={1} className='border-black border'></input>
                <select id='TFUnit' defaultValue='Day' className='border-black border'>
                    <option value='Min'>Minute</option>
                    <option value='Hour'>Hour</option>
                    <option value='Day'>Day</option>
                    <option value='Week'>Week</option>
                    <option value='Month'>Month</option>
                </select>
                <input type='date' id='start' defaultValue='2026-01-01'></input>
                <input type='date' id='end' defaultValue={today}></input>
                <button id='fetchData' className='bg-blue-600 w-20' onClick={() => {handleSubmit()}}></button>
            </div>
            <div id='chartContainer' className='w-screen h-[90vh]'/>
        </>
    )
}