"""Fix filter_settings table structure

Revision ID: 011
Revises: 009
Create Date: 2024-12-31 16:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '011'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Get current columns
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('filter_settings')]
    
    # Drop and recreate the table with correct structure
    op.drop_table('filter_settings')
    
    op.create_table('filter_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('search_text', sa.Text(), nullable=True),
        sa.Column('year_range', sa.String(20), nullable=True),
        sa.Column('rating_range', sa.String(20), nullable=True),
        sa.Column('popularity_range', sa.String(20), nullable=True),
        sa.Column('genres', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_filter_settings_id'), 'filter_settings', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('filter_settings') 