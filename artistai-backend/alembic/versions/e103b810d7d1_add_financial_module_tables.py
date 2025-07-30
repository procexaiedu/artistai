"""add_financial_module_tables

Revision ID: e103b810d7d1
Revises: f9de49704bcb
Create Date: 2025-07-27 14:46:38.817496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e103b810d7d1'
down_revision: Union[str, Sequence[str], None] = 'f9de49704bcb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Criar ENUMs para o módulo financeiro usando blocos DO
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
                CREATE TYPE transaction_type_enum AS ENUM ('income', 'expense');
            END IF;
        END $$;
    """)
    
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status_enum') THEN
                CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'cancelled');
            END IF;
        END $$;
    """)
    
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_category_type_enum') THEN
                CREATE TYPE financial_category_type_enum AS ENUM ('income', 'expense');
            END IF;
        END $$;
    """)
    
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type_enum') THEN
                CREATE TYPE account_type_enum AS ENUM ('checking', 'savings', 'credit_card', 'cash', 'investment');
            END IF;
        END $$;
    """)
    
    # Criar tabela financial_accounts
    op.create_table('financial_accounts',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('account_type', postgresql.ENUM('checking', 'savings', 'credit_card', 'cash', 'investment', name='account_type_enum'), nullable=False),
        sa.Column('bank_name', sa.String(length=255), nullable=True),
        sa.Column('account_number', sa.String(length=50), nullable=True),
        sa.Column('balance', sa.Numeric(precision=15, scale=2), server_default=sa.text('0.00'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_financial_accounts_user_id', 'financial_accounts', ['user_id'])
    
    # Criar tabela financial_categories
    op.create_table('financial_categories',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category_type', postgresql.ENUM('income', 'expense', name='financial_category_type_enum'), nullable=False),
        sa.Column('color', sa.String(length=7), server_default=sa.text("'#3B82F6'"), nullable=False),
        sa.Column('icon', sa.String(length=50), server_default=sa.text("'dollar-sign'"), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_financial_categories_user_id', 'financial_categories', ['user_id'])
    op.create_index('idx_financial_categories_type', 'financial_categories', ['category_type'])
    
    # Criar tabela financial_transactions
    op.create_table('financial_transactions',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('account_id', sa.UUID(), nullable=False),
        sa.Column('category_id', sa.UUID(), nullable=True),
        sa.Column('event_id', sa.UUID(), nullable=True),
        sa.Column('contractor_id', sa.UUID(), nullable=True),
        sa.Column('transaction_type', postgresql.ENUM('income', 'expense', name='transaction_type_enum'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('reference_number', sa.String(length=100), nullable=True),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'completed', 'cancelled', name='transaction_status_enum'), server_default=sa.text("'completed'"), nullable=False),
        sa.Column('is_tax_deductible', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('tax_category', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['financial_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['financial_categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['contractor_id'], ['contractors.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_financial_transactions_user_id', 'financial_transactions', ['user_id'])
    op.create_index('idx_financial_transactions_account_id', 'financial_transactions', ['account_id'])
    op.create_index('idx_financial_transactions_category_id', 'financial_transactions', ['category_id'])
    op.create_index('idx_financial_transactions_date', 'financial_transactions', ['transaction_date'])
    op.create_index('idx_financial_transactions_type', 'financial_transactions', ['transaction_type'])
    op.create_index('idx_financial_transactions_status', 'financial_transactions', ['status'])
    
    # Criar tabela financial_goals
    op.create_table('financial_goals',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('target_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('current_amount', sa.Numeric(precision=15, scale=2), server_default=sa.text('0.00'), nullable=False),
        sa.Column('target_date', sa.Date(), nullable=True),
        sa.Column('category_id', sa.UUID(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['financial_categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_financial_goals_user_id', 'financial_goals', ['user_id'])
    
    # Criar tabela financial_budgets
    op.create_table('financial_budgets',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('category_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('budget_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('spent_amount', sa.Numeric(precision=15, scale=2), server_default=sa.text('0.00'), nullable=False),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('alert_threshold', sa.Integer(), server_default=sa.text('80'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['financial_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_financial_budgets_user_id', 'financial_budgets', ['user_id'])
    op.create_index('idx_financial_budgets_category_id', 'financial_budgets', ['category_id'])
    op.create_index('idx_financial_budgets_period', 'financial_budgets', ['period_start', 'period_end'])


def downgrade() -> None:
    """Downgrade schema."""
    # Remover tabelas
    op.drop_table('financial_budgets')
    op.drop_table('financial_goals')
    op.drop_table('financial_transactions')
    op.drop_table('financial_categories')
    op.drop_table('financial_accounts')
    
    # Remover ENUMs
    op.execute('DROP TYPE IF EXISTS account_type_enum')
    op.execute('DROP TYPE IF EXISTS financial_category_type_enum')
    op.execute('DROP TYPE IF EXISTS transaction_status_enum')
    op.execute('DROP TYPE IF EXISTS transaction_type_enum')
