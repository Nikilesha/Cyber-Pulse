from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal
from models import City
from pydantic import BaseModel

app = FastAPI()

# -------------------------------------
# CORS setup so frontend can fetch data
# -------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your React URL later (e.g., "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------
# Database dependency
# -------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------
# Pydantic Schema for City (response model)
# -------------------------------------
class CityResponse(BaseModel):
    id: int
    city_name: str
    country: str
    latitude: float
    longitude: float
    population: int

    class Config:
        orm_mode = True  # allows SQLAlchemy -> Pydantic conversion

# -------------------------------------
# Root endpoint
# -------------------------------------
@app.get("/")
def root():
    return {"message": "🚀 CyberPulse API is running!"}

# -------------------------------------
# Cities endpoint
# -------------------------------------
@app.get("/cities", response_model=list[CityResponse])
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    return cities
