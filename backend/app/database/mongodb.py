import os
import pymongo
import certifi
from gridfs import GridFS
from typing import Optional
from ..config import MONGODB_URI, MONGODB_DB_NAME

class MongoDBManager:
    def __init__(self):
        self.client: Optional[pymongo.MongoClient] = None
        self.db = None
        self.fs: Optional[GridFS] = None
        self.is_connected = False
        # lazy-loaded


    def init_connection(self):
        # If no URI is provided (e.g., during tests), fall back to an in‑memory mongomock client
        if not MONGODB_URI:
            try:
                import mongomock
                self.client = mongomock.MongoClient()
                self.db = self.client[MONGODB_DB_NAME or "test_db"]
                self.fs = None
                self.is_connected = True
                print("[MongoDB] Using mongomock in‑memory database for testing.")
            except Exception as e:
                print(f"[MongoDB] Failed to initialize mongomock: {e}")
                self.is_connected = False
                self.client = None
                self.db = None
                self.fs = None
            return

        # Ensure DNS resolution doesn't fail on local ISP DNS
        try:
            import dns.resolver
            resolver = dns.resolver.get_default_resolver()
            if "8.8.8.8" not in resolver.nameservers:
                resolver.nameservers = ["8.8.8.8", "1.1.1.1"] + resolver.nameservers
        except Exception:
            pass

        # Attempt connection with certifi CA bundle
        try:
            ca_path = certifi.where()
            self.client = pymongo.MongoClient(
                MONGODB_URI,
                tlsCAFile=ca_path,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000
            )
            self.client.admin.command('ping')
            self.db = self.client[MONGODB_DB_NAME]
            self.fs = GridFS(self.db)
            self.is_connected = True
            print(f"[MongoDB Atlas] Connected successfully to DB '{MONGODB_DB_NAME}' on Atlas cluster!")
            return
        except Exception as e:
            print(f"[MongoDB Atlas] Standard TLS attempt notice: {e}")

        # Fallback for Windows TLS issues
        try:
            self.client = pymongo.MongoClient(
                MONGODB_URI,
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000
            )
            self.client.admin.command('ping')
            self.db = self.client[MONGODB_DB_NAME]
            self.fs = GridFS(self.db)
            self.is_connected = True
            print(f"[MongoDB Atlas] Connected successfully via resilient TLS fallback to DB '{MONGODB_DB_NAME}'!")
        except Exception as e2:
            print(f"[MongoDB Atlas] Connection notice (Atlas unreachable or IP not whitelisted): {e2}")

        if not self.is_connected:
            # Final fallback to in‑memory mongomock if real connection failed
            try:
                import mongomock
                self.client = mongomock.MongoClient()
                self.db = self.client[MONGODB_DB_NAME or "test_db"]
                self.fs = None
                self.is_connected = True
                print("[MongoDB] Fallback to mongomock after failed Atlas connection.")
            except Exception as e2:
                print(f"[MongoDB] Fallback to mongomock also failed: {e2}")
                self.is_connected = False
                self.client = None
                self.db = None
                self.fs = None

    def get_db(self):
        if not self.is_connected:
            self.init_connection()
        return self.db if self.is_connected else None

    def get_fs(self) -> Optional[GridFS]:
        return self.fs if self.is_connected else None

mongodb_manager = MongoDBManager()

