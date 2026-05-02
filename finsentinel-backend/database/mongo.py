from motor.motor_asyncio import AsyncIOMotorClient
from config import Config
import certifi

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongodb = MongoDB()

async def connect_to_mongo():
    # Create connection with tlsCAFile parameter
    mongodb.client = AsyncIOMotorClient(
        Config.MONGO_URL, 
        tlsCAFile=certifi.where(),
        retryWrites=True
    )
    mongodb.db = mongodb.client[Config.DB_NAME]
    print("Connected to MongoDB.")

async def close_mongo_connection():
    mongodb.client.close()
    print("Closed MongoDB connection.")

def get_database():
    return mongodb.db
