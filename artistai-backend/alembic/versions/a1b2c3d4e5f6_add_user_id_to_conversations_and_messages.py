"""add_user_id_to_conversations_and_messages

Revision ID: a1b2c3d4e5f6
Revises: 81593d69f2b5
Create Date: 2025-01-20 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '81593d69f2b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar coluna user_id à tabela conversations
    op.add_column('conversations', sa.Column('user_id', sa.String(255), nullable=False, server_default=''))
    
    # Adicionar coluna user_id à tabela messages
    op.add_column('messages', sa.Column('user_id', sa.String(255), nullable=False, server_default=''))


def downgrade() -> None:
    """Downgrade schema."""
    # Remover coluna user_id da tabela messages
    op.drop_column('messages', 'user_id')
    
    # Remover coluna user_id da tabela conversations
    op.drop_column('conversations', 'user_id')