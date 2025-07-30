from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from datetime import date, datetime, timedelta
import uuid

from app.models import (
    FinancialAccount, FinancialCategory, FinancialTransaction, 
    FinancialGoal, FinancialBudget
)
from app.schemas import (
    FinancialAccountCreate, FinancialAccountUpdate,
    FinancialCategoryCreate, FinancialCategoryUpdate,
    FinancialTransactionCreate, FinancialTransactionUpdate,
    FinancialGoalCreate, FinancialGoalUpdate,
    FinancialBudgetCreate, FinancialBudgetUpdate,
    FinancialSummary, CategorySummary, MonthlyTrend
)


# CRUD para Financial Accounts
def create_financial_account(db: Session, account: FinancialAccountCreate, user_id: str) -> FinancialAccount:
    db_account = FinancialAccount(
        **account.dict(),
        user_id=user_id,
        id=uuid.uuid4()
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


def get_financial_accounts(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[FinancialAccount]:
    return db.query(FinancialAccount).filter(
        FinancialAccount.user_id == user_id
    ).offset(skip).limit(limit).all()


def get_financial_account(db: Session, account_id: uuid.UUID, user_id: str) -> Optional[FinancialAccount]:
    return db.query(FinancialAccount).filter(
        and_(FinancialAccount.id == account_id, FinancialAccount.user_id == user_id)
    ).first()


def update_financial_account(db: Session, account_id: uuid.UUID, account: FinancialAccountUpdate, user_id: str) -> Optional[FinancialAccount]:
    db_account = get_financial_account(db, account_id, user_id)
    if db_account:
        update_data = account.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_account, field, value)
        db_account.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_account)
    return db_account


def delete_financial_account(db: Session, account_id: uuid.UUID, user_id: str) -> bool:
    db_account = get_financial_account(db, account_id, user_id)
    if db_account:
        db.delete(db_account)
        db.commit()
        return True
    return False


# CRUD para Financial Categories
def create_financial_category(db: Session, category: FinancialCategoryCreate, user_id: str) -> FinancialCategory:
    db_category = FinancialCategory(
        **category.dict(),
        user_id=user_id,
        id=uuid.uuid4()
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_financial_categories(db: Session, user_id: str, category_type: Optional[str] = None) -> List[FinancialCategory]:
    query = db.query(FinancialCategory).filter(FinancialCategory.user_id == user_id)
    if category_type:
        query = query.filter(FinancialCategory.category_type == category_type)
    return query.all()


def get_financial_category(db: Session, category_id: uuid.UUID, user_id: str) -> Optional[FinancialCategory]:
    return db.query(FinancialCategory).filter(
        and_(FinancialCategory.id == category_id, FinancialCategory.user_id == user_id)
    ).first()


def update_financial_category(db: Session, category_id: uuid.UUID, category: FinancialCategoryUpdate, user_id: str) -> Optional[FinancialCategory]:
    db_category = get_financial_category(db, category_id, user_id)
    if db_category:
        update_data = category.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        db.commit()
        db.refresh(db_category)
    return db_category


def delete_financial_category(db: Session, category_id: uuid.UUID, user_id: str) -> bool:
    db_category = get_financial_category(db, category_id, user_id)
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False


# CRUD para Financial Transactions
def create_financial_transaction(db: Session, transaction: FinancialTransactionCreate, user_id: str) -> FinancialTransaction:
    db_transaction = FinancialTransaction(
        **transaction.dict(),
        user_id=user_id,
        id=uuid.uuid4()
    )
    db.add(db_transaction)
    
    # Atualizar saldo da conta
    account = get_financial_account(db, transaction.account_id, user_id)
    if account:
        if transaction.transaction_type == 'income':
            account.balance += transaction.amount
        else:
            account.balance -= transaction.amount
        account.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_financial_transactions(db: Session, user_id: str, skip: int = 0, limit: int = 100, 
                             account_id: Optional[uuid.UUID] = None,
                             category_id: Optional[uuid.UUID] = None,
                             transaction_type: Optional[str] = None,
                             start_date: Optional[date] = None,
                             end_date: Optional[date] = None) -> List[FinancialTransaction]:
    query = db.query(FinancialTransaction).filter(FinancialTransaction.user_id == user_id)
    
    if account_id:
        query = query.filter(FinancialTransaction.account_id == account_id)
    if category_id:
        query = query.filter(FinancialTransaction.category_id == category_id)
    if transaction_type:
        query = query.filter(FinancialTransaction.transaction_type == transaction_type)
    if start_date:
        query = query.filter(FinancialTransaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(FinancialTransaction.transaction_date <= end_date)
    
    return query.order_by(FinancialTransaction.transaction_date.desc()).offset(skip).limit(limit).all()


def get_financial_transaction(db: Session, transaction_id: uuid.UUID, user_id: str) -> Optional[FinancialTransaction]:
    return db.query(FinancialTransaction).filter(
        and_(FinancialTransaction.id == transaction_id, FinancialTransaction.user_id == user_id)
    ).first()


def update_financial_transaction(db: Session, transaction_id: uuid.UUID, transaction: FinancialTransactionUpdate, user_id: str) -> Optional[FinancialTransaction]:
    db_transaction = get_financial_transaction(db, transaction_id, user_id)
    if db_transaction:
        # Reverter o impacto no saldo da conta anterior
        old_account = get_financial_account(db, db_transaction.account_id, user_id)
        if old_account:
            if db_transaction.transaction_type == 'income':
                old_account.balance -= db_transaction.amount
            else:
                old_account.balance += db_transaction.amount
        
        # Aplicar atualizações
        update_data = transaction.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_transaction, field, value)
        db_transaction.updated_at = datetime.utcnow()
        
        # Aplicar novo impacto no saldo
        new_account = get_financial_account(db, db_transaction.account_id, user_id)
        if new_account:
            if db_transaction.transaction_type == 'income':
                new_account.balance += db_transaction.amount
            else:
                new_account.balance -= db_transaction.amount
            new_account.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_transaction)
    return db_transaction


def delete_financial_transaction(db: Session, transaction_id: uuid.UUID, user_id: str) -> bool:
    db_transaction = get_financial_transaction(db, transaction_id, user_id)
    if db_transaction:
        # Reverter o impacto no saldo da conta
        account = get_financial_account(db, db_transaction.account_id, user_id)
        if account:
            if db_transaction.transaction_type == 'income':
                account.balance -= db_transaction.amount
            else:
                account.balance += db_transaction.amount
            account.updated_at = datetime.utcnow()
        
        db.delete(db_transaction)
        db.commit()
        return True
    return False


# CRUD para Financial Goals
def create_financial_goal(db: Session, goal: FinancialGoalCreate, user_id: str) -> FinancialGoal:
    db_goal = FinancialGoal(
        **goal.dict(),
        user_id=user_id,
        id=uuid.uuid4()
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def get_financial_goals(db: Session, user_id: str, is_active: Optional[bool] = None) -> List[FinancialGoal]:
    query = db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id)
    if is_active is not None:
        query = query.filter(FinancialGoal.is_active == is_active)
    return query.all()


def get_financial_goal(db: Session, goal_id: uuid.UUID, user_id: str) -> Optional[FinancialGoal]:
    return db.query(FinancialGoal).filter(
        and_(FinancialGoal.id == goal_id, FinancialGoal.user_id == user_id)
    ).first()


def update_financial_goal(db: Session, goal_id: uuid.UUID, goal: FinancialGoalUpdate, user_id: str) -> Optional[FinancialGoal]:
    db_goal = get_financial_goal(db, goal_id, user_id)
    if db_goal:
        update_data = goal.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_goal, field, value)
        db_goal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_goal)
    return db_goal


def delete_financial_goal(db: Session, goal_id: uuid.UUID, user_id: str) -> bool:
    db_goal = get_financial_goal(db, goal_id, user_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False


# CRUD para Financial Budgets
def create_financial_budget(db: Session, budget: FinancialBudgetCreate, user_id: str) -> FinancialBudget:
    db_budget = FinancialBudget(
        **budget.dict(),
        user_id=user_id,
        id=uuid.uuid4()
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def get_financial_budgets(db: Session, user_id: str, is_active: Optional[bool] = None) -> List[FinancialBudget]:
    query = db.query(FinancialBudget).filter(FinancialBudget.user_id == user_id)
    if is_active is not None:
        query = query.filter(FinancialBudget.is_active == is_active)
    return query.all()


def get_financial_budget(db: Session, budget_id: uuid.UUID, user_id: str) -> Optional[FinancialBudget]:
    return db.query(FinancialBudget).filter(
        and_(FinancialBudget.id == budget_id, FinancialBudget.user_id == user_id)
    ).first()


def update_financial_budget(db: Session, budget_id: uuid.UUID, budget: FinancialBudgetUpdate, user_id: str) -> Optional[FinancialBudget]:
    db_budget = get_financial_budget(db, budget_id, user_id)
    if db_budget:
        update_data = budget.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_budget, field, value)
        db_budget.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_budget)
    return db_budget


def delete_financial_budget(db: Session, budget_id: uuid.UUID, user_id: str) -> bool:
    db_budget = get_financial_budget(db, budget_id, user_id)
    if db_budget:
        db.delete(db_budget)
        db.commit()
        return True
    return False


# Funções de Analytics
def get_financial_summary(db: Session, user_id: str, start_date: date, end_date: date) -> FinancialSummary:
    # Receitas no período
    income_query = db.query(func.sum(FinancialTransaction.amount)).filter(
        and_(
            FinancialTransaction.user_id == user_id,
            FinancialTransaction.transaction_type == 'income',
            FinancialTransaction.transaction_date >= start_date,
            FinancialTransaction.transaction_date <= end_date,
            FinancialTransaction.status == 'completed'
        )
    ).scalar() or 0
    
    # Despesas no período
    expenses_query = db.query(func.sum(FinancialTransaction.amount)).filter(
        and_(
            FinancialTransaction.user_id == user_id,
            FinancialTransaction.transaction_type == 'expense',
            FinancialTransaction.transaction_date >= start_date,
            FinancialTransaction.transaction_date <= end_date,
            FinancialTransaction.status == 'completed'
        )
    ).scalar() or 0
    
    # Receitas pendentes
    pending_income = db.query(func.sum(FinancialTransaction.amount)).filter(
        and_(
            FinancialTransaction.user_id == user_id,
            FinancialTransaction.transaction_type == 'income',
            FinancialTransaction.status == 'pending'
        )
    ).scalar() or 0
    
    # Despesas pendentes
    pending_expenses = db.query(func.sum(FinancialTransaction.amount)).filter(
        and_(
            FinancialTransaction.user_id == user_id,
            FinancialTransaction.transaction_type == 'expense',
            FinancialTransaction.status == 'pending'
        )
    ).scalar() or 0
    
    return FinancialSummary(
        total_income=income_query,
        total_expenses=expenses_query,
        net_income=income_query - expenses_query,
        pending_income=pending_income,
        pending_expenses=pending_expenses,
        period_start=start_date,
        period_end=end_date
    )


def get_category_summary(db: Session, user_id: str, start_date: date, end_date: date) -> List[CategorySummary]:
    # Query para obter resumo por categoria
    results = db.query(
        FinancialCategory.id,
        FinancialCategory.name,
        FinancialCategory.category_type,
        func.sum(FinancialTransaction.amount).label('total_amount'),
        func.count(FinancialTransaction.id).label('transaction_count')
    ).join(
        FinancialTransaction, FinancialCategory.id == FinancialTransaction.category_id
    ).filter(
        and_(
            FinancialTransaction.user_id == user_id,
            FinancialTransaction.transaction_date >= start_date,
            FinancialTransaction.transaction_date <= end_date,
            FinancialTransaction.status == 'completed'
        )
    ).group_by(
        FinancialCategory.id, FinancialCategory.name, FinancialCategory.category_type
    ).all()
    
    # Calcular total geral para percentuais
    total_amount = sum(result.total_amount for result in results)
    
    return [
        CategorySummary(
            category_id=result.id,
            category_name=result.name,
            category_type=result.category_type,
            total_amount=result.total_amount,
            transaction_count=result.transaction_count,
            percentage_of_total=(result.total_amount / total_amount * 100) if total_amount > 0 else 0
        )
        for result in results
    ]


def get_monthly_trends(db: Session, user_id: str, months: int = 12) -> List[MonthlyTrend]:
    start_date = datetime.now() - timedelta(days=months * 30)
    
    # Query para tendências mensais
    results = db.query(
        extract('month', FinancialTransaction.transaction_date).label('month'),
        extract('year', FinancialTransaction.transaction_date).label('year'),
        FinancialTransaction.transaction_type,
        func.sum(FinancialTransaction.amount).label('total_amount')
    ).filter(
        and_(
            FinancialTransaction.user_id == user_id,
            FinancialTransaction.transaction_date >= start_date.date(),
            FinancialTransaction.status == 'completed'
        )
    ).group_by(
        extract('month', FinancialTransaction.transaction_date),
        extract('year', FinancialTransaction.transaction_date),
        FinancialTransaction.transaction_type
    ).all()
    
    # Organizar dados por mês/ano
    monthly_data = {}
    for result in results:
        key = f"{int(result.year)}-{int(result.month):02d}"
        if key not in monthly_data:
            monthly_data[key] = {'income': 0, 'expenses': 0, 'month': int(result.month), 'year': int(result.year)}
        
        if result.transaction_type == 'income':
            monthly_data[key]['income'] = result.total_amount
        else:
            monthly_data[key]['expenses'] = result.total_amount
    
    # Converter para lista de MonthlyTrend
    trends = []
    for key, data in sorted(monthly_data.items()):
        trends.append(MonthlyTrend(
            month=f"{data['month']:02d}",
            year=data['year'],
            income=data['income'],
            expenses=data['expenses'],
            net=data['income'] - data['expenses']
        ))
    
    return trends