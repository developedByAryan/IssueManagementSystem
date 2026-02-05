import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Boolean, Enum, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from infrastructure.database.base import Base


class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    DEPARTMENT_STAFF = "DEPARTMENT_STAFF"
    USER = "USER"


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    username = Column(String(200), nullable=False, unique=True, index=True)
    email = Column(String(200), nullable=False, unique=True, index=True)
    hashed_password = Column(String(400), nullable=False)
    full_name = Column(String(200), nullable=False)

    role = Column(Enum(UserRole, name="userrole"), nullable=False, server_default="USER")
    is_active = Column(Boolean, nullable=False, server_default=text("true"))

    # optional if you keep departments
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    department = relationship("Department", back_populates="users")

    reported_issues = relationship(
        "Issue",
        foreign_keys="Issue.reported_by",
        back_populates="reporter",
    )

    assigned_issues = relationship(
        "Issue",
        foreign_keys="Issue.assigned_to",
        back_populates="assignee",
    )

    comments = relationship("IssueComment", back_populates="user")
