from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.bars import router as bars_router


app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173'])

@app.get('/')
def root():
    return {'message': 'Server Initialized!'}

app.include_router(bars_router, prefix='/bars', tags=["Bars"])