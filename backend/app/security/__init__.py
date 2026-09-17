# backend/app/security/__init__.py
"""Expose authentication and RBAC utilities.
This module re-exports the functions and classes defined in
`dependencies.py` so that other parts of the codebase can import
`get_current_user`, `get_optional_current_user`, `require_role`, and
`UserRole` directly from `backend.app.security`.
"""

from .dependencies import (
    get_current_user,
    get_optional_current_user,
    require_role,
    UserRole,
)
