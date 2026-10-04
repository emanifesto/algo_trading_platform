from fastapi import APIRouter
from config import data_client
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
from alpaca.data.requests import StockBarsRequest
from datetime import datetime

router = APIRouter()

@router.get('/{request}')
async def fetch_bars(request: str):

    ticker, amount, unit = request.split('_')
    tf_amount = int(amount)
    tf_unit = TimeFrameUnit(unit)
    bars = data_client.get_stock_bars(StockBarsRequest(symbol_or_symbols=ticker, timeframe=TimeFrame(tf_amount, tf_unit), start=datetime(2026, 9, 21), end=datetime(2026, 9, 25)))
    df = bars.df.reset_index().drop(columns=['symbol'])
    df['timestamp'] = df['timestamp'].apply(lambda x: x.date()).astype(str)
    bars_json = df.T.to_json()

    return bars_json