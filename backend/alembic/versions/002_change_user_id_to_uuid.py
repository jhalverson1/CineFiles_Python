"""change user id to uuid

Revision ID: 002
Revises: 9d8f4991573b
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic
revision = '002'
down_revision = '9d8f4991573b'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Ensure UUID extension is created
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Check if the id column is already UUID type
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    users_columns = {col['name']: col['type'] for col in inspector.get_columns('users')}
    
    if not isinstance(users_columns.get('id'), UUID):
        # Create a new temporary id column with UUID
        op.add_column('users', sa.Column('uuid_id', UUID(), nullable=True))
        
        # Generate UUIDs for existing rows
        op.execute("UPDATE users SET uuid_id = uuid_generate_v4()")
        
        # Drop the old primary key constraint and index
        op.drop_constraint('users_pkey', 'users')
        op.drop_index('ix_users_id')
        
        # Drop the old id column
        op.drop_column('users', 'id')
        
        # Rename uuid_id to id
        op.alter_column('users', 'uuid_id', new_column_name='id')
        
        # Make the new id column not nullable and primary key
        op.alter_column('users', 'id', nullable=False)
        op.create_primary_key('users_pkey', 'users', ['id'])
        op.create_index('ix_users_id', 'users', ['id'], unique=False)

def downgrade() -> None:
    pass 