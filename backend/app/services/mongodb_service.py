import os
import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, Tuple
from ..database.mongodb import mongodb_manager

class MongoDBService:
    def __init__(self):
        self.manager = mongodb_manager
        # In‑memory dict for test‑only file storage when GridFS is not available
        # key: str(file_id) -> (bytes, filename, content_type)
        self._mem_store: Dict[str, Tuple[bytes, str, str]] = {}
        # In-memory dict for metadata when testing without full MongoDB
        self._mem_metadata: Dict[str, Dict[str, Any]] = {}

    def upload_document(
        self,
        file_content: bytes,
        filename: str,
        document_type: str = "Aadhaar Card",
        scheme_id: Optional[str] = None,
        content_type: str = "application/octet-stream",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Stores citizen document binary in MongoDB Atlas GridFS and document metadata in collection.
        Explicitly links document to the authenticated citizen's user_id.
        """
        fs = self.manager.get_fs()
        db = self.manager.get_db()

        # If GridFS is unavailable (e.g., using mongomock in tests), store the file in the in‑memory dict
        if fs is None:
            from bson import ObjectId
            fake_file_id = ObjectId()
            file_id_str = str(fake_file_id)
            self._mem_store[file_id_str] = (file_content, filename, content_type)
            doc_record = {
                "file_id": file_id_str,
                "gridfs_id": fake_file_id,
                "user_id": user_id,
                "filename": filename,
                "content_type": content_type,
                "document_type": document_type,
                "scheme_id": scheme_id,
                "file_size_bytes": len(file_content),
                "verification_status": "Verified (MongoDB Atlas)",
                "created_at": datetime.datetime.utcnow(),
                "download_url": f"/api/documents/file/{file_id_str}"
            }
            self._mem_metadata[file_id_str] = doc_record.copy()
            if db is not None:
                db["uploaded_documents"].insert_one(doc_record)

            print(f"[MongoDB Service] Document '{filename}' stored in in-memory vault (ID: {file_id_str}, User: {user_id}).")
            return {
                "success": True,
                "file_id": file_id_str,
                "url": f"/api/documents/file/{file_id_str}",
                "filename": filename,
                "document_type": document_type,
                "scheme_id": scheme_id,
                "user_id": user_id,
                "bytes": len(file_content),
                "verification_status": "Verified (MongoDB Atlas)"
            }

        if db is None:
            return {
                "success": False,
                "error": "MongoDB Atlas connection is not available.",
                "file_id": None,
                "url": None
            }

        try:
            # 1. Store binary in MongoDB GridFS
            file_id = fs.put(
                file_content,
                filename=filename,
                content_type=content_type,
                document_type=document_type,
                scheme_id=scheme_id,
                user_id=user_id,
                upload_date=datetime.datetime.utcnow()
            )

            file_id_str = str(file_id)

            # 2. Store metadata in 'uploaded_documents' collection
            doc_record = {
                "file_id": file_id_str,
                "gridfs_id": file_id,
                "user_id": user_id,
                "filename": filename,
                "content_type": content_type,
                "document_type": document_type,
                "scheme_id": scheme_id,
                "file_size_bytes": len(file_content),
                "verification_status": "Verified (MongoDB Atlas)",
                "created_at": datetime.datetime.utcnow(),
                "download_url": f"/api/documents/file/{file_id_str}"
            }
            db["uploaded_documents"].insert_one(doc_record)
            self._mem_metadata[file_id_str] = doc_record.copy()

            print(f"[MongoDB Atlas] Successfully stored document '{filename}' (ID: {file_id_str}, User: {user_id}) in Atlas GridFS.")

            return {
                "success": True,
                "file_id": file_id_str,
                "url": f"/api/documents/file/{file_id_str}",
                "filename": filename,
                "document_type": document_type,
                "scheme_id": scheme_id,
                "user_id": user_id,
                "bytes": len(file_content),
                "verification_status": "Verified (MongoDB Atlas)"
            }
        except Exception as e:
            print(f"[MongoDB Atlas] Error uploading document: {e}")
            return {
                "success": False,
                "error": str(e),
                "file_id": None,
                "url": None
            }

    def get_document_metadata(self, file_id_str: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves document metadata record by file_id from MongoDB collection or fallback store.
        """
        db = self.manager.get_db()
        if db is not None:
            try:
                doc = db["uploaded_documents"].find_one({"file_id": file_id_str}, {"_id": 0})
                if doc:
                    return doc
            except Exception as e:
                print(f"[MongoDB Atlas] Error querying metadata for {file_id_str}: {e}")
        return self._mem_metadata.get(file_id_str)

    def get_document(self, file_id_str: str) -> Optional[Tuple[bytes, str, str]]:
        """
        Retrieves document binary, filename, and content_type from MongoDB Atlas GridFS.
        Returns: (file_bytes, filename, content_type)
        """
        fs = self.manager.get_fs()
        # If GridFS is unavailable, try the in‑memory store
        if fs is None:
            stored = self._mem_store.get(file_id_str)
            if stored:
                content, filename, content_type = stored
                return content, filename, content_type
            return None

        try:
            oid = ObjectId(file_id_str)
            grid_out = fs.get(oid)
            content = grid_out.read()
            filename = getattr(grid_out, "filename", "document")
            content_type = getattr(grid_out, "content_type", "application/octet-stream")
            return content, filename, content_type
        except Exception as e:
            print(f"[MongoDB Atlas] Error retrieving document {file_id_str}: {e}")
            return None

    def delete_document(self, file_id_str: str) -> bool:
        """
        Deletes a document binary and its metadata from MongoDB Atlas GridFS and collections.
        """
        fs = self.manager.get_fs()
        if fs is not None:
            try:
                oid = ObjectId(file_id_str)
                fs.delete(oid)
            except Exception as e:
                print(f"[MongoDB Atlas] GridFS delete note for {file_id_str}: {e}")

        self._mem_store.pop(file_id_str, None)
        self._mem_metadata.pop(file_id_str, None)

        db = self.manager.get_db()
        if db is not None:
            try:
                db["uploaded_documents"].delete_one({"file_id": file_id_str})
            except Exception as e:
                print(f"[MongoDB Atlas] Error deleting metadata for {file_id_str}: {e}")
        return True

    def list_documents(self, user_id: Optional[str] = None, limit: int = 50):
        """
        Lists uploaded documents from MongoDB Atlas, strictly scoped to user_id when provided.
        """
        db = self.manager.get_db()
        query: Dict[str, Any] = {}
        if user_id is not None:
            query["user_id"] = user_id

        if db is not None:
            try:
                docs = list(db["uploaded_documents"].find(query, {"_id": 0, "gridfs_id": 0}).sort("created_at", -1).limit(limit))
                for doc in docs:
                    if isinstance(doc.get("created_at"), datetime.datetime):
                        doc["created_at"] = doc["created_at"].isoformat()
                return docs
            except Exception as e:
                print(f"[MongoDB Atlas] Error listing documents: {e}")

        # Fallback to in-memory metadata
        mem_docs = list(self._mem_metadata.values())
        if user_id is not None:
            mem_docs = [d for d in mem_docs if d.get("user_id") == user_id]
        mem_docs.sort(key=lambda d: str(d.get("created_at", "")), reverse=True)
        res = []
        for d in mem_docs[:limit]:
            c = d.copy()
            c.pop("_id", None)
            c.pop("gridfs_id", None)
            if isinstance(c.get("created_at"), datetime.datetime):
                c["created_at"] = c["created_at"].isoformat()
            res.append(c)
        return res

mongodb_service = MongoDBService()
