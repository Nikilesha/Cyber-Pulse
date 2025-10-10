from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import City

app = FastAPI()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Simple root check
@app.get("/")
def root():
    return {"message": "🚀 CyberPulse API is running!"}

# Cities endpoint
@app.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    return cities
