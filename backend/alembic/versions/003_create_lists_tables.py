"""create lists tables

Revision ID: 003
Revises: 002
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    # Create lists table if it doesn't exist
    if 'lists' not in tables:
        op.create_table(
            'lists',
            sa.Column('id', UUID(), nullable=False),
            sa.Column('user_id', UUID(), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('is_default', sa.Boolean(), server_default='false'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )

    # Create list_items table if it doesn't exist
    if 'list_items' not in tables:
        op.create_table(
            'list_items',
            sa.Column('id', UUID(), nullable=False),
            sa.Column('list_id', UUID(), nullable=False),
            sa.Column('movie_id', sa.String(length=255), nullable=False),
            sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.ForeignKeyConstraint(['list_id'], ['lists.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('list_id', 'movie_id', name='uix_list_movie')
        )

def downgrade() -> None:
    op.drop_table('list_items')
    op.drop_table('lists') 