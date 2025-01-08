"""Update filter settings add new filters

Revision ID: 013
Revises: 012
Create Date: 2024-01-03 19:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '013'
down_revision = '012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Get current columns
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('filter_settings')]
    
    # Drop old range columns
    if 'year_range' in columns:
        op.drop_column('filter_settings', 'year_range')
    if 'rating_range' in columns:
        op.drop_column('filter_settings', 'rating_range')
    if 'popularity_range' in columns:
        op.drop_column('filter_settings', 'popularity_range')
    
    # Add new range columns
    if 'release_date_gte' not in columns:
        op.add_column('filter_settings',
            sa.Column('release_date_gte', sa.DateTime(timezone=True), nullable=True)
        )
    if 'release_date_lte' not in columns:
        op.add_column('filter_settings',
            sa.Column('release_date_lte', sa.DateTime(timezone=True), nullable=True)
        )
    if 'rating_gte' not in columns:
        op.add_column('filter_settings',
            sa.Column('rating_gte', sa.Float(), nullable=True)
        )
    if 'rating_lte' not in columns:
        op.add_column('filter_settings',
            sa.Column('rating_lte', sa.Float(), nullable=True)
        )
    if 'popularity_gte' not in columns:
        op.add_column('filter_settings',
            sa.Column('popularity_gte', sa.Float(), nullable=True)
        )
    if 'popularity_lte' not in columns:
        op.add_column('filter_settings',
            sa.Column('popularity_lte', sa.Float(), nullable=True)
        )
    
    # Add vote count range columns
    if 'vote_count_gte' not in columns:
        op.add_column('filter_settings',
            sa.Column('vote_count_gte', sa.Integer(), nullable=True)
        )
    if 'vote_count_lte' not in columns:
        op.add_column('filter_settings',
            sa.Column('vote_count_lte', sa.Integer(), nullable=True)
        )
    
    # Add runtime range columns
    if 'runtime_gte' not in columns:
        op.add_column('filter_settings',
            sa.Column('runtime_gte', sa.Integer(), nullable=True)
        )
    if 'runtime_lte' not in columns:
        op.add_column('filter_settings',
            sa.Column('runtime_lte', sa.Integer(), nullable=True)
        )
    
    # Add language columns
    if 'original_language' not in columns:
        op.add_column('filter_settings',
            sa.Column('original_language', sa.String(10), nullable=True)
        )
    if 'spoken_languages' not in columns:
        op.add_column('filter_settings',
            sa.Column('spoken_languages', sa.Text(), nullable=True)
        )
    
    # Add release type column
    if 'release_types' not in columns:
        op.add_column('filter_settings',
            sa.Column('release_types', sa.Text(), nullable=True)
        )
    
    # Add watch provider columns
    if 'watch_providers' not in columns:
        op.add_column('filter_settings',
            sa.Column('watch_providers', sa.Text(), nullable=True)
        )
    if 'watch_region' not in columns:
        op.add_column('filter_settings',
            sa.Column('watch_region', sa.String(2), nullable=True)
        )
    if 'watch_monetization_types' not in columns:
        op.add_column('filter_settings',
            sa.Column('watch_monetization_types', sa.Text(), nullable=True)
        )
    
    # Add company and country columns
    if 'companies' not in columns:
        op.add_column('filter_settings',
            sa.Column('companies', sa.Text(), nullable=True)
        )
    if 'origin_countries' not in columns:
        op.add_column('filter_settings',
            sa.Column('origin_countries', sa.Text(), nullable=True)
        )
    
    # Add cast and crew columns
    if 'cast' not in columns:
        op.add_column('filter_settings',
            sa.Column('cast', sa.Text(), nullable=True)
        )
    if 'crew' not in columns:
        op.add_column('filter_settings',
            sa.Column('crew', sa.Text(), nullable=True)
        )
    
    # Add keyword columns
    if 'include_keywords' not in columns:
        op.add_column('filter_settings',
            sa.Column('include_keywords', sa.Text(), nullable=True)
        )
    if 'exclude_keywords' not in columns:
        op.add_column('filter_settings',
            sa.Column('exclude_keywords', sa.Text(), nullable=True)
        )
    
    # Add sort option column
    if 'sort_by' not in columns:
        op.add_column('filter_settings',
            sa.Column('sort_by', sa.String(50), nullable=True)
        )


def downgrade() -> None:
    # Drop all new columns
    op.drop_column('filter_settings', 'sort_by')
    op.drop_column('filter_settings', 'exclude_keywords')
    op.drop_column('filter_settings', 'include_keywords')
    op.drop_column('filter_settings', 'crew')
    op.drop_column('filter_settings', 'cast')
    op.drop_column('filter_settings', 'origin_countries')
    op.drop_column('filter_settings', 'companies')
    op.drop_column('filter_settings', 'watch_monetization_types')
    op.drop_column('filter_settings', 'watch_region')
    op.drop_column('filter_settings', 'watch_providers')
    op.drop_column('filter_settings', 'release_types')
    op.drop_column('filter_settings', 'spoken_languages')
    op.drop_column('filter_settings', 'original_language')
    op.drop_column('filter_settings', 'runtime_lte')
    op.drop_column('filter_settings', 'runtime_gte')
    op.drop_column('filter_settings', 'vote_count_lte')
    op.drop_column('filter_settings', 'vote_count_gte')
    op.drop_column('filter_settings', 'popularity_lte')
    op.drop_column('filter_settings', 'popularity_gte')
    op.drop_column('filter_settings', 'rating_lte')
    op.drop_column('filter_settings', 'rating_gte')
    op.drop_column('filter_settings', 'release_date_lte')
    op.drop_column('filter_settings', 'release_date_gte')
    
    # Recreate old range columns
    op.add_column('filter_settings',
        sa.Column('year_range', sa.String(20), nullable=True)
    )
    op.add_column('filter_settings',
        sa.Column('rating_range', sa.String(20), nullable=True)
    )
    op.add_column('filter_settings',
        sa.Column('popularity_range', sa.String(20), nullable=True)
    ) 