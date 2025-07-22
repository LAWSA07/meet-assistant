import motor.motor_asyncio
from pymongo import MongoClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "project_co_pilot")

# --- ASYNC (for FastAPI) ---
def get_async_client():
    return motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)

def get_async_database(client):
    return client[DATABASE_NAME]

def get_users_collection(database):
    return database.users

def get_meeting_sessions_collection(database):
    return database.meeting_sessions

# --- SYNC (for background tasks) ---
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]

# Create indexes
async def create_indexes(users_collection, meeting_sessions_collection):
    """Create database indexes for better performance"""
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("github_id")
    await users_collection.create_index("google_id")
    await meeting_sessions_collection.create_index("user_id")
    await meeting_sessions_collection.create_index("created_at")

# Database utilities (all now require explicit collection arguments)
async def get_user_by_email(users_collection, email: str):
    return await users_collection.find_one({"email": email})

async def get_user_by_id(users_collection, user_id: str):
    from bson import ObjectId
    return await users_collection.find_one({"_id": ObjectId(user_id)})

async def get_user_by_github_id(users_collection, github_id: str):
    return await users_collection.find_one({"github_id": github_id})

async def get_user_by_google_id(users_collection, google_id: str):
    return await users_collection.find_one({"google_id": google_id})

async def create_user(users_collection, user_data: dict):
    result = await users_collection.insert_one(user_data)
    return str(result.inserted_id)

async def update_user(users_collection, user_id: str, update_data: dict):
    from bson import ObjectId
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def create_meeting_session(meeting_sessions_collection, session_data: dict):
    result = await meeting_sessions_collection.insert_one(session_data)
    return str(result.inserted_id)

async def get_user_meetings(meeting_sessions_collection, user_id: str, limit: int = 10):
    from bson import ObjectId
    cursor = meeting_sessions_collection.find(
        {"user_id": ObjectId(user_id)}
    ).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)

async def test_connection(async_client, sync_client, users_collection, meeting_sessions_collection):
    try:
        await async_client.admin.command('ping')
        print("✅ MongoDB async connection successful!")
        sync_client.admin.command('ping')
        print("✅ MongoDB sync connection successful!")
        await create_indexes(users_collection, meeting_sessions_collection)
        print("✅ Database indexes created successfully!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def test_connection_sync():
    try:
        sync_client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False 