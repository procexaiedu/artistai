"""add_user_id_to_events_and_enforce_relations

Revision ID: 81593d69f2b5
Revises: 68e929ba7ecf
Create Date: 2025-07-19 00:54:35.577002

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '81593d69f2b5'
down_revision: Union[str, Sequence[str], None] = '68e929ba7ecf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar coluna user_id à tabela events
    op.add_column('events', sa.Column('user_id', sa.String(255), nullable=False, server_default=''))


def downgrade() -> None:
    """Downgrade schema."""
    # Remover coluna user_id da tabela events
    op.drop_column('events', 'user_id')
