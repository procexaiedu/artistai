"""Create agent configuration tables

Revision ID: 7a544a084814
Revises: 7e8385fcb520
Create Date: 2025-07-30 19:47:11.818645

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a544a084814'
down_revision: Union[str, Sequence[str], None] = '7e8385fcb520'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create agent_configurations table
    op.create_table(
        'agent_configurations',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('system_prompt_production', sa.Text(), nullable=True),
        sa.Column('system_prompt_laboratory', sa.Text(), nullable=True),
        sa.Column('wait_time_buffer', sa.Integer(), nullable=False, default=2),
        sa.ForeignKeyConstraint(['user_id'], ['auth.users.id'], ondelete='CASCADE'),
    )
    
    # Create prompt_versions table
    op.create_table(
        'prompt_versions',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('agent_config_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prompt_content', sa.Text(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['agent_config_id'], ['agent_configurations.id'], ondelete='CASCADE'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('prompt_versions')
    op.drop_table('agent_configurations')
