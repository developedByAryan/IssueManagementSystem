"""Add super admin

Revision ID: 35a60265380b
Revises: 9f3fdab36663
Create Date: 2026-02-08 13:20:34.227676

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35a60265380b'
down_revision: Union[str, Sequence[str], None] = '9f3fdab36663'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add SUPERADMIN to the userrole enum
    # Note: ALTER TYPE ... ADD VALUE cannot run inside a transaction block
    # So we need to use op.execute with special handling
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SUPERADMIN'")


def downgrade() -> None:
    """Downgrade schema."""
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type and all dependent columns
    # For simplicity, we'll document that downgrade is not supported
    pass
