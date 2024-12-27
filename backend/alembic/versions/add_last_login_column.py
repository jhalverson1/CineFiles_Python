"""Add last_login column to users table

Revision ID: 9d8f4991573b
Revises: 808f4991573a
Create Date: 2024-12-25 22:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9d8f4991573b'
down_revision = '808f4991573a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if column exists first
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'last_login' not in columns:
        op.add_column('users',
            sa.Column('last_login', sa.DateTime(timezone=True), nullable=True)
        )


def downgrade() -> None:
    # Check if column exists before dropping
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'last_login' in columns:
        op.drop_column('users', 'last_login') 