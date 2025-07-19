"""add_user_id_to_contractors

Revision ID: 68e929ba7ecf
Revises: 2ff6088c89a5
Create Date: 2025-07-19 00:12:27.201805

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '68e929ba7ecf'
down_revision: Union[str, Sequence[str], None] = '2ff6088c89a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar coluna user_id à tabela contractors
    op.add_column('contractors', sa.Column('user_id', sa.String(255), nullable=False, server_default=''))


def downgrade() -> None:
    """Downgrade schema."""
    # Remover coluna user_id da tabela contractors
    op.drop_column('contractors', 'user_id')
