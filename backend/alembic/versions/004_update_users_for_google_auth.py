"""Update users table for Google auth

Revision ID: 004
Revises: 003
Create Date: 2024-12-29 06:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop is_superuser column as it's no longer used
    op.drop_column('users', 'is_superuser')
    
    # Set default value for is_active and make it non-nullable
    op.execute("""
        UPDATE users SET is_active = true WHERE is_active IS NULL;
        ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
        ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;
    """)
    
    # Make hashed_password nullable for Google auth users
    op.execute('ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL')
    
    # Make username nullable (incorporating changes from remove_username_field migration)
    op.execute("""
        ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
        DROP INDEX IF EXISTS ix_users_username;
        CREATE UNIQUE INDEX ix_users_username ON users (username) WHERE username IS NOT NULL;
    """)


def downgrade() -> None:
    # Make username required again
    op.execute("""
        UPDATE users SET username = email WHERE username IS NULL;
        ALTER TABLE users ALTER COLUMN username SET NOT NULL;
        DROP INDEX IF EXISTS ix_users_username;
        CREATE UNIQUE INDEX ix_users_username ON users (username);
    """)
    
    # Make hashed_password required again
    op.execute("""
        UPDATE users SET hashed_password = '' WHERE hashed_password IS NULL;
        ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL;
    """)
    
    # Remove default value from is_active and make it nullable
    op.execute("""
        ALTER TABLE users ALTER COLUMN is_active DROP DEFAULT;
        ALTER TABLE users ALTER COLUMN is_active DROP NOT NULL;
    """)
    
    # Restore is_superuser column
    op.add_column('users', sa.Column('is_superuser', sa.Boolean(), nullable=True)) 