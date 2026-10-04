from fastapi import FastAPI
from routes.bars import router as bars_router


app = FastAPI()

@app.get('/')
def root():
    return {'message': 'Server Initialized!'}

app.include_router(bars_router, prefix='/bars', tags=["Bars"])