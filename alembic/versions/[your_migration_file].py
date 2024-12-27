"""add last_login column

Revision ID: [some_id]
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('users', 'last_login') 