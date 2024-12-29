"""Fix id generation

Revision ID: 005
Revises: 004
Create Date: 2024-12-29 06:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure UUID extension exists and set default UUID generation
    op.execute("""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
    """)


def downgrade() -> None:
    # Remove the default value
    op.execute("ALTER TABLE users ALTER COLUMN id DROP DEFAULT;") 