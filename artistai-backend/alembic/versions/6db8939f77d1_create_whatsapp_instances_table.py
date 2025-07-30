"""create whatsapp instances table

Revision ID: 6db8939f77d1
Revises: a1b2c3d4e5f6
Create Date: 2025-07-25 19:43:39.807684

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6db8939f77d1'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum for status if it doesn't exist
    connection = op.get_bind()
    result = connection.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = 'whatsapp_status'")
    ).fetchone()
    
    if not result:
        status_enum = sa.Enum('pending', 'connected', 'disconnected', name='whatsapp_status')
        status_enum.create(connection)
    
    # Create whatsapp_instances table
    op.create_table(
        'whatsapp_instances',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('instance_name', sa.VARCHAR(255), nullable=False),
        sa.Column('api_key', sa.VARCHAR(500), nullable=True),
        sa.Column('status', sa.Enum('pending', 'connected', 'disconnected', name='whatsapp_status'), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('instance_name'),
        sa.UniqueConstraint('user_id'),  # One instance per user
        sa.ForeignKeyConstraint(['user_id'], ['auth.users.id'], ondelete='CASCADE')
    )
    
    # Create index for faster queries
    op.create_index('ix_whatsapp_instances_user_id', 'whatsapp_instances', ['user_id'])
    op.create_index('ix_whatsapp_instances_status', 'whatsapp_instances', ['status'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index('ix_whatsapp_instances_status', 'whatsapp_instances')
    op.drop_index('ix_whatsapp_instances_user_id', 'whatsapp_instances')
    
    # Drop table
    op.drop_table('whatsapp_instances')
    
    # Drop enum if it exists
    connection = op.get_bind()
    result = connection.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = 'whatsapp_status'")
    ).fetchone()
    
    if result:
        sa.Enum(name='whatsapp_status').drop(connection)
