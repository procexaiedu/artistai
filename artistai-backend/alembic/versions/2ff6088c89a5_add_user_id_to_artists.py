"""add_user_id_to_artists

Revision ID: 2ff6088c89a5
Revises: xxxxxxxxxxxx
Create Date: 2025-07-18 21:48:48.778124

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ff6088c89a5'
down_revision: Union[str, Sequence[str], None] = 'xxxxxxxxxxxx'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar coluna user_id à tabela artists
    op.add_column('artists', sa.Column('user_id', sa.String(255), nullable=False, server_default=''))


def downgrade() -> None:
    """Downgrade schema."""
    # Remover coluna user_id da tabela artists
    op.drop_column('artists', 'user_id')
