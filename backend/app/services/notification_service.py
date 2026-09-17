import time
import random
import datetime
from typing import Optional, List, Dict, Any
from ..database.mongodb import mongodb_manager

_NOTIFICATIONS_COL = "notifications"

class NotificationService:
    def __init__(self):
        self._mem_notifications: Dict[str, Dict[str, Any]] = {}

    def _get_collection(self):
        db = mongodb_manager.get_db()
        if db is not None:
            try:
                return db[_NOTIFICATIONS_COL]
            except Exception:
                pass
        return None

    def dispatch_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "STATUS_UPDATE",
        scheme_id: Optional[str] = None,
        scheme_name: Optional[str] = None,
        application_id: Optional[str] = None,
        reference_no: Optional[str] = None,
        action_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Stores structured in-app notification in MongoDB Atlas and simulates
        dispatch across SMS and Email channels without paid services or PII leakage.
        """
        notif_id = f"NOTIF-{int(time.time() * 1000)}-{random.randint(1000, 9999)}"
        now_dt = datetime.datetime.utcnow()
        now_iso = now_dt.isoformat()

        doc = {
            "id": notif_id,
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "scheme_id": scheme_id,
            "scheme_name": scheme_name,
            "application_id": application_id,
            "reference_no": reference_no,
            "channels_dispatched": ["in_app", "sms_simulated", "email_simulated"],
            "is_read": False,
            "action_url": action_url or "/dashboard?tab=applications",
            "metadata": metadata or {},
            "created_at": now_dt
        }

        # Store in MongoDB if available
        col = self._get_collection()
        if col is not None:
            try:
                col.insert_one(doc.copy())
            except Exception as e:
                print(f"[Notification Service] MongoDB insert notice: {e}")

        # In-memory store for test environment reliability
        mem_copy = doc.copy()
        mem_copy["created_at"] = now_iso
        self._mem_notifications[notif_id] = mem_copy

        # Multi-Channel Simulator Logs (Strictly avoiding credential or sensitive personal data exposure)
        print(f"[Multi-Channel Dispatcher] [SMS SIMULATOR] Dispatched SMS to citizen '{user_id}': '{title}'")
        print(f"[Multi-Channel Dispatcher] [EMAIL SIMULATOR] Dispatched Email to citizen '{user_id}': '{title} - {message}'")

        return mem_copy

    def list_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Lists notifications scoped strictly to the authenticated citizen's user_id.
        """
        col = self._get_collection()
        query: Dict[str, Any] = {"user_id": user_id}
        if unread_only:
            query["is_read"] = False

        if col is not None:
            try:
                cursor = col.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
                docs = list(cursor)
                for d in docs:
                    if isinstance(d.get("created_at"), datetime.datetime):
                        d["created_at"] = d["created_at"].isoformat()
                return docs
            except Exception as e:
                print(f"[Notification Service] Query error: {e}")

        # Fallback to in-memory store
        user_docs = [
            d for d in self._mem_notifications.values()
            if d.get("user_id") == user_id and (not unread_only or not d.get("is_read"))
        ]
        user_docs.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
        return user_docs[:limit]

    def get_unread_count(self, user_id: str) -> int:
        """
        Calculates number of unread alerts for the citizen.
        """
        col = self._get_collection()
        if col is not None:
            try:
                return col.count_documents({"user_id": user_id, "is_read": False})
            except Exception:
                pass

        return sum(1 for d in self._mem_notifications.values() if d.get("user_id") == user_id and not d.get("is_read"))

    def mark_notification_as_read(self, user_id: str, notification_id: str) -> bool:
        """
        Marks a specific notification as read, validating strict user ownership.
        """
        col = self._get_collection()
        found = False

        if col is not None:
            try:
                res = col.update_one(
                    {"id": notification_id, "user_id": user_id},
                    {"$set": {"is_read": True}}
                )
                if res.matched_count > 0:
                    found = True
            except Exception as e:
                print(f"[Notification Service] Update error: {e}")

        if notification_id in self._mem_notifications:
            if self._mem_notifications[notification_id].get("user_id") == user_id:
                self._mem_notifications[notification_id]["is_read"] = True
                found = True

        return found

    def mark_all_as_read(self, user_id: str) -> int:
        """
        Marks all unread notifications for the user as read.
        """
        col = self._get_collection()
        updated_count = 0

        if col is not None:
            try:
                res = col.update_many(
                    {"user_id": user_id, "is_read": False},
                    {"$set": {"is_read": True}}
                )
                updated_count = res.modified_count
            except Exception as e:
                print(f"[Notification Service] Bulk update error: {e}")

        for d in self._mem_notifications.values():
            if d.get("user_id") == user_id and not d.get("is_read"):
                d["is_read"] = True
                updated_count += 1

        return updated_count

    def delete_notification(self, user_id: str, notification_id: str) -> bool:
        """
        Deletes a notification, enforcing strict user ownership.
        """
        col = self._get_collection()
        deleted = False

        if col is not None:
            try:
                res = col.delete_one({"id": notification_id, "user_id": user_id})
                if res.deleted_count > 0:
                    deleted = True
            except Exception as e:
                print(f"[Notification Service] Delete error: {e}")

        if notification_id in self._mem_notifications:
            if self._mem_notifications[notification_id].get("user_id") == user_id:
                self._mem_notifications.pop(notification_id, None)
                deleted = True

        return deleted

notification_service = NotificationService()
