from database import SessionLocal
from models import City

db = SessionLocal()

cities = [
    City(city_name="New York", country="USA", latitude=40.7128, longitude=-74.0060, population=8419600),
    City(city_name="London", country="UK", latitude=51.5074, longitude=-0.1278, population=8982000),
    City(city_name="Tokyo", country="Japan", latitude=35.6895, longitude=139.6917, population=13929286),
    City(city_name="Delhi", country="India", latitude=28.6139, longitude=77.2090, population=16787941)
]

db.add_all(cities)
db.commit()
db.close()

print("✅ Sample cities added!")
from database import SessionLocal
from models import City

db = SessionLocal()

cities = [
    City(city_name="New York", country="USA", latitude=40.7128, longitude=-74.0060, population=8419600),
    City(city_name="London", country="UK", latitude=51.5074, longitude=-0.1278, population=8982000),
    City(city_name="Tokyo", country="Japan", latitude=35.6895, longitude=139.6917, population=13929286),
    City(city_name="Delhi", country="India", latitude=28.6139, longitude=77.2090, population=16787941)
]

db.add_all(cities)
db.commit()
db.close()

print("✅ Sample cities added!")
