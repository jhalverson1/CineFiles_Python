"""Add search_text to filter_settings

Revision ID: 008
Revises: 007
Create Date: 2024-03-19 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if column exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('filter_settings')]
    
    if 'search_text' not in columns:
        # Add search_text column to filter_settings table
        op.add_column('filter_settings',
            sa.Column('search_text', sa.Text(), nullable=True)
        )


def downgrade() -> None:
    # Remove search_text column from filter_settings table
    op.drop_column('filter_settings', 'search_text') 