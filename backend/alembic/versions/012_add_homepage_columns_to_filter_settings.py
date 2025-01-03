"""Add homepage columns to filter_settings

Revision ID: 012
Revises: 011
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '012'
down_revision = '011'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Get current columns
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('filter_settings')]
    
    # Add is_homepage_enabled column if it doesn't exist
    if 'is_homepage_enabled' not in columns:
        op.add_column('filter_settings',
            sa.Column('is_homepage_enabled', sa.Boolean(), nullable=False, server_default='false')
        )
    
    # Add homepage_display_order column if it doesn't exist
    if 'homepage_display_order' not in columns:
        op.add_column('filter_settings',
            sa.Column('homepage_display_order', sa.Integer(), nullable=True)
        )


def downgrade() -> None:
    # Remove the columns
    op.drop_column('filter_settings', 'homepage_display_order')
    op.drop_column('filter_settings', 'is_homepage_enabled') 