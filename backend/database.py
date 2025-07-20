import motor.motor_asyncio
from pymongo import MongoClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "project_co_pilot")

# Async client for FastAPI
async_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
async_database = async_client[DATABASE_NAME]

# Sync client for background tasks
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]

# Collections
users_collection = async_database.users
meeting_sessions_collection = async_database.meeting_sessions

# Create indexes
async def create_indexes():
    """Create database indexes for better performance"""
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("github_id")
    await users_collection.create_index("google_id")
    await meeting_sessions_collection.create_index("user_id")
    await meeting_sessions_collection.create_index("created_at")

# Database utilities
async def get_user_by_email(email: str):
    """Get user by email"""
    return await users_collection.find_one({"email": email})

async def get_user_by_id(user_id: str):
    """Get user by ID"""
    from bson import ObjectId
    return await users_collection.find_one({"_id": ObjectId(user_id)})

async def get_user_by_github_id(github_id: str):
    """Get user by GitHub ID"""
    return await users_collection.find_one({"github_id": github_id})

async def get_user_by_google_id(google_id: str):
    """Get user by Google ID"""
    return await users_collection.find_one({"google_id": google_id})

async def create_user(user_data: dict):
    """Create a new user"""
    result = await users_collection.insert_one(user_data)
    return str(result.inserted_id)

async def update_user(user_id: str, update_data: dict):
    """Update user data"""
    from bson import ObjectId
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def create_meeting_session(session_data: dict):
    """Create a new meeting session"""
    result = await meeting_sessions_collection.insert_one(session_data)
    return str(result.inserted_id)

async def get_user_meetings(user_id: str, limit: int = 10):
    """Get user's meeting sessions"""
    from bson import ObjectId
    cursor = meeting_sessions_collection.find(
        {"user_id": ObjectId(user_id)}
    ).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)

async def test_connection():
    """Test MongoDB connection"""
    try:
        # Test async connection
        await async_client.admin.command('ping')
        print("✅ MongoDB async connection successful!")
        
        # Test sync connection
        sync_client.admin.command('ping')
        print("✅ MongoDB sync connection successful!")
        
        # Create indexes
        await create_indexes()
        print("✅ Database indexes created successfully!")
        
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def test_connection_sync():
    """Test MongoDB connection synchronously"""
    try:
        # Test sync connection
        sync_client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False 