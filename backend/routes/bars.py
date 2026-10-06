from fastapi import APIRouter
from config import data_client
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
from alpaca.data.requests import StockBarsRequest
from datetime import datetime

router = APIRouter()

@router.get('/{request}')
async def fetch_bars(request: str):

    ticker, amount, unit, start_str, end_str = request.split('_')

    tf_amount = int(amount)
    tf_unit = TimeFrameUnit(unit)

    start_y, start_m, start_d = [int(s) for s in start_str.split('-')]
    end_y, end_m, end_d = [int(s) for s in end_str.split('-')]
    start = datetime(start_y, start_m, start_d)
    end = datetime(end_y, end_m, end_d)

    bars = data_client.get_stock_bars(StockBarsRequest(symbol_or_symbols=ticker, timeframe=TimeFrame(tf_amount, tf_unit), start=start, end=end))
    df = bars.df.reset_index().drop(columns=['symbol', 'trade_count', 'vwap', 'volume']).rename(columns={'timestamp': 'time'})
    df['time'] = df['time'].apply(lambda x: x.date()).astype(str)
    bars_json = df.T.to_json()

    return bars_json