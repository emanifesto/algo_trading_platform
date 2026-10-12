from fastapi import APIRouter
from config import data_client
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
from alpaca.data.requests import StockBarsRequest
from datetime import datetime

router = APIRouter()

@router.get('/{request}')
async def fetch_bars(request: str):

    ticker, amount, unit, start_iso, end_iso = request.split('_')

    tf_amount = int(amount)
    tf_unit = TimeFrameUnit(unit)
    start = datetime.fromisoformat(start_iso)
    end = datetime.fromisoformat(end_iso)

    bars = data_client.get_stock_bars(StockBarsRequest(symbol_or_symbols=ticker, timeframe=TimeFrame(tf_amount, tf_unit), start=start, end=end))
    df = bars.df.reset_index().drop(columns=['symbol', 'trade_count', 'vwap', 'volume']).rename(columns={'timestamp': 'time'})
    df['time'] = df['time'].apply(lambda x: int(x.timestamp()))
    bars_json = df.T.to_json()

    return bars_json