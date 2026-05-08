from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, models, datasets, metrics, evaluations, experiments 

app = FastAPI(title="LLMOps Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(models.router)
app.include_router(datasets.router)
app.include_router(metrics.router)
app.include_router(evaluations.router) 
app.include_router(experiments.router)

@app.get("/")
async def root():
    return {"message": "LLMOps API is running smoothly!"}
