"""add_crm_features

Revision ID: f9de49704bcb
Revises: e5f15a3ad0e2
Create Date: 2025-07-27 01:36:40.320896

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9de49704bcb'
down_revision: Union[str, Sequence[str], None] = 'e5f15a3ad0e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Criar tabela pipeline_stages
    op.execute("""
    CREATE TABLE pipeline_stages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    """)
    
    # Criar tabela notes
    op.execute("""
    CREATE TABLE notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    """)
    
    # Adicionar coluna stage_id à tabela contractors
    op.execute("""
    ALTER TABLE contractors 
    ADD COLUMN stage_id UUID REFERENCES pipeline_stages(id);
    """)
    
    # Criar índices para melhor performance
    op.execute("CREATE INDEX idx_pipeline_stages_user_id ON pipeline_stages(user_id);")
    op.execute("CREATE INDEX idx_pipeline_stages_order ON pipeline_stages(\"order\");")
    op.execute("CREATE INDEX idx_notes_contractor_id ON notes(contractor_id);")
    op.execute("CREATE INDEX idx_notes_user_id ON notes(user_id);")
    op.execute("CREATE INDEX idx_contractors_stage_id ON contractors(stage_id);")


def downgrade() -> None:
    """Downgrade schema."""
    # Remover índices
    op.execute("DROP INDEX IF EXISTS idx_contractors_stage_id;")
    op.execute("DROP INDEX IF EXISTS idx_notes_user_id;")
    op.execute("DROP INDEX IF EXISTS idx_notes_contractor_id;")
    op.execute("DROP INDEX IF EXISTS idx_pipeline_stages_order;")
    op.execute("DROP INDEX IF EXISTS idx_pipeline_stages_user_id;")
    
    # Remover coluna stage_id da tabela contractors
    op.execute("ALTER TABLE contractors DROP COLUMN IF EXISTS stage_id;")
    
    # Remover tabelas
    op.execute("DROP TABLE IF EXISTS notes;")
    op.execute("DROP TABLE IF EXISTS pipeline_stages;")
