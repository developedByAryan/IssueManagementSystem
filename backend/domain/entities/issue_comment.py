from sqlalchemy import Column, Text, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from infrastructure.database.base import Base


class IssueComment(Base):
    __tablename__ = "issue_comments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    content = Column(Text, nullable=False)

    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate= datetime.now(timezone.utc) ,nullable=True)

    # relationships
    issue = relationship("Issue", back_populates="comments")
    user = relationship("User", back_populates="comments")
