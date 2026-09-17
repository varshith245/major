import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..database.connection import SessionLocal
from ..database.models import AuditLogDB

class AuditService:
    def log_action(
        self,
        admin_email: str,
        admin_name: str,
        action: str,
        resource: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: str = "127.0.0.1",
        status: str = "Success"
    ) -> Dict[str, Any]:
        """
        Records an administrative action in the immutable audit log table.
        """
        db: Session = SessionLocal()
        try:
            log_entry = AuditLogDB(
                timestamp=datetime.datetime.utcnow(),
                admin_email=admin_email,
                admin_name=admin_name,
                action=action,
                resource=resource,
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                status=status
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return {
                "id": log_entry.id,
                "timestamp": log_entry.timestamp.isoformat(),
                "admin_email": log_entry.admin_email,
                "admin_name": log_entry.admin_name,
                "action": log_entry.action,
                "resource": log_entry.resource,
                "resource_id": log_entry.resource_id,
                "details": log_entry.details,
                "ip_address": log_entry.ip_address,
                "status": log_entry.status
            }
        except Exception as e:
            db.rollback()
            print(f"[AuditService] Failed to record audit log: {e}")
            return {}
        finally:
            db.close()

    def get_logs(
        self,
        limit: int = 100,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves recent audit logs with optional filters.
        """
        db: Session = SessionLocal()
        try:
            query = db.query(AuditLogDB)
            if action and action.strip() and action != "all":
                query = query.filter(AuditLogDB.action == action.strip())
            if resource and resource.strip() and resource != "all":
                query = query.filter(AuditLogDB.resource == resource.strip())
            if search and search.strip():
                term = f"%{search.strip()}%"
                query = query.filter(
                    (AuditLogDB.admin_email.ilike(term)) |
                    (AuditLogDB.admin_name.ilike(term)) |
                    (AuditLogDB.action.ilike(term)) |
                    (AuditLogDB.resource.ilike(term)) |
                    (AuditLogDB.resource_id.ilike(term))
                )
            logs = query.order_by(AuditLogDB.timestamp.desc()).limit(limit).all()
            return [
                {
                    "id": log.id,
                    "timestamp": log.timestamp.isoformat() if log.timestamp else datetime.datetime.utcnow().isoformat(),
                    "admin_email": log.admin_email,
                    "admin_name": log.admin_name,
                    "action": log.action,
                    "resource": log.resource,
                    "resource_id": log.resource_id,
                    "details": log.details or {},
                    "ip_address": log.ip_address,
                    "status": log.status
                }
                for log in logs
            ]
        finally:
            db.close()

audit_service = AuditService()
