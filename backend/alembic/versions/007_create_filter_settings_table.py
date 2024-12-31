"""Create filter settings table

Revision ID: 007
Revises: 006
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if table exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'filter_settings' not in tables:
        op.create_table('filter_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('year_range', sa.String(20), nullable=True),
            sa.Column('rating_range', sa.String(20), nullable=True),
            sa.Column('popularity_range', sa.String(20), nullable=True),
            sa.Column('genres', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_filter_settings_id'), 'filter_settings', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_filter_settings_id'), table_name='filter_settings')
    op.drop_table('filter_settings') 