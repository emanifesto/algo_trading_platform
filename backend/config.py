import keyring
from alpaca.data.historical import StockHistoricalDataClient

ALPACA_API_KEY = keyring.get_password('env', 'ALPACA_API_KEY')
ALPACA_API_SECRET = keyring.get_password('env', 'ALPACA_API_SECRET')
data_client = StockHistoricalDataClient(ALPACA_API_KEY, ALPACA_API_SECRET)