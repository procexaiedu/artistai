"""create whatsapp instances table only

Revision ID: e5f15a3ad0e2
Revises: 6db8939f77d1
Create Date: 2025-07-25 19:50:09.799093

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f15a3ad0e2'
down_revision: Union[str, Sequence[str], None] = '6db8939f77d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create whatsapp_instances table (assuming whatsapp_status enum already exists)
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
    
    # Create indexes for faster queries
    op.create_index('ix_whatsapp_instances_user_id', 'whatsapp_instances', ['user_id'])
    op.create_index('ix_whatsapp_instances_status', 'whatsapp_instances', ['status'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index('ix_whatsapp_instances_status', 'whatsapp_instances')
    op.drop_index('ix_whatsapp_instances_user_id', 'whatsapp_instances')
    
    # Drop table
    op.drop_table('whatsapp_instances')
