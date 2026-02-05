from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from infrastructure.database.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    users = relationship("User", back_populates="department")
    issues = relationship("Issue", back_populates="department")
