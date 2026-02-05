import enum

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from infrastructure.database.base import Base


class IssueStatus(enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class IssuePriority(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Issue(Base):
    __tablename__ = "issues"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    status = Column(Enum(IssueStatus, name="issuestatus"), nullable=False, server_default="OPEN")
    priority = Column(Enum(IssuePriority, name="issuepriority"), nullable=False, server_default="LOW")

    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False, index=True)

    # matches your dump idea: reported_by required, assigned_to optional
    reported_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    department = relationship("Department", back_populates="issues")

    reporter = relationship(
        "User",
        foreign_keys=[reported_by],
        back_populates="reported_issues",
    )

    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="assigned_issues",
    )

    comments = relationship("IssueComment", back_populates="issue", cascade="all, delete-orphan")
