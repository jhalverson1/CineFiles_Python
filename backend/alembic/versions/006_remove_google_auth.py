"""Remove Google auth support

Revision ID: 006
Revises: 005
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make username required
    op.execute("""
        UPDATE users SET username = email WHERE username IS NULL;
        ALTER TABLE users ALTER COLUMN username SET NOT NULL;
        DROP INDEX IF EXISTS ix_users_username;
        CREATE UNIQUE INDEX ix_users_username ON users (username);
    """)
    
    # Make hashed_password required
    op.execute("""
        DELETE FROM users WHERE hashed_password IS NULL;
        ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL;
    """)


def downgrade() -> None:
    # Make username nullable again
    op.execute("""
        ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
        DROP INDEX IF EXISTS ix_users_username;
        CREATE UNIQUE INDEX ix_users_username ON users (username) WHERE username IS NOT NULL;
    """)
    
    # Make hashed_password nullable again
    op.execute('ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL') 