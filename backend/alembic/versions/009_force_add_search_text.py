"""Force add search_text to filter_settings

Revision ID: 009
Revises: 008
Create Date: 2024-03-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('filter_settings')]

    if 'search_text' not in columns:
        op.add_column('filter_settings',
            sa.Column('search_text', sa.Text(), nullable=True)
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('filter_settings')]

    if 'search_text' in columns:
        op.drop_column('filter_settings', 'search_text') 