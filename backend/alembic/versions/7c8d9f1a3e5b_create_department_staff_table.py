"""create department_staff table and remove department_id from users

Revision ID: 7c8d9f1a3e5b
Revises: 9345c5a34ec3
Create Date: 2026-02-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '7c8d9f1a3e5b'
down_revision = '9345c5a34ec3'
branch_labels = None
depends_on = None


def upgrade():
    # Create the new department_staff table
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1) Create department_staff only if it doesn't exist
    if "department_staff" not in inspector.get_table_names():
        op.create_table(
            "department_staff",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("department_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["department_id"], ["departments.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    # 2) Create indexes only if missing
    existing_indexes = {ix["name"] for ix in inspector.get_indexes("department_staff")} \
        if "department_staff" in inspector.get_table_names() else set()

    def ensure_index(name, cols):
        if name not in existing_indexes:
            op.create_index(name, "department_staff", cols, unique=False)

    ensure_index("ix_department_staff_id", ["id"])
    ensure_index("ix_department_staff_user_id", ["user_id"])
    ensure_index("ix_department_staff_department_id", ["department_id"])

    # 3) Migrate data safely (avoid duplicates)
    # If you want "one row per staff user", ensure no existing row for that user_id.
    op.execute("""
        INSERT INTO department_staff (id, user_id, department_id, created_at, updated_at)
        SELECT gen_random_uuid(), u.id, u.department_id, u.created_at, u.updated_at
        FROM users u
        WHERE u.department_id IS NOT NULL
          AND u.role = 'DEPARTMENT_STAFF'
          AND NOT EXISTS (
              SELECT 1 FROM department_staff ds WHERE ds.user_id = u.id
          )
    """)

    # 4) Drop FK + column only if they exist
    user_cols = {c["name"] for c in inspector.get_columns("users")}
    if "department_id" in user_cols:
        fks = inspector.get_foreign_keys("users")
        fk_name = None
        for fk in fks:
            if fk.get("constrained_columns") == ["department_id"]:
                fk_name = fk.get("name")
                break

        if fk_name:
            op.drop_constraint(fk_name, "users", type_="foreignkey")

        op.drop_column("users", "department_id")


def downgrade():
    # Add department_id column back to users
    op.add_column('users', sa.Column('department_id', postgresql.UUID(as_uuid=True), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key('users_department_id_fkey', 'users', 'departments', ['department_id'], ['id'])
    
    # Migrate data back from department_staff to users
    op.execute("""
        UPDATE users u
        SET department_id = ds.department_id
        FROM department_staff ds
        WHERE u.id = ds.user_id
    """)
    
    # Drop the department_staff table
    op.drop_table('department_staff')
