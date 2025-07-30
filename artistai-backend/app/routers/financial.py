from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
import uuid

from app.database import get_db
from app.dependencies import get_current_user, User
from app.crud import crud_financial
from app.schemas import (
    # Financial Accounts
    FinancialAccount, FinancialAccountCreate, FinancialAccountUpdate,
    # Financial Categories
    FinancialCategory, FinancialCategoryCreate, FinancialCategoryUpdate,
    # Financial Transactions
    FinancialTransaction, FinancialTransactionCreate, FinancialTransactionUpdate,
    # Financial Goals
    FinancialGoal, FinancialGoalCreate, FinancialGoalUpdate,
    # Financial Budgets
    FinancialBudget, FinancialBudgetCreate, FinancialBudgetUpdate,
    # Analytics
    FinancialSummary, CategorySummary, MonthlyTrend, FinancialAnalytics,
    FinancialDashboard
)

router = APIRouter()


# ==================== FINANCIAL ACCOUNTS ====================

@router.post("/accounts/", response_model=FinancialAccount)
def create_account(
    account: FinancialAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova conta financeira"""
    return crud_financial.create_financial_account(db=db, account=account, user_id=current_user.id)


@router.get("/accounts/", response_model=List[FinancialAccount])
def read_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todas as contas financeiras do usuário"""
    return crud_financial.get_financial_accounts(db=db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/accounts/{account_id}", response_model=FinancialAccount)
def read_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter uma conta financeira específica"""
    account = crud_financial.get_financial_account(db=db, account_id=account_id, user_id=current_user.id)
    if account is None:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return account


@router.put("/accounts/{account_id}", response_model=FinancialAccount)
def update_account(
    account_id: uuid.UUID,
    account: FinancialAccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar uma conta financeira"""
    updated_account = crud_financial.update_financial_account(
        db=db, account_id=account_id, account=account, user_id=current_user.id
    )
    if updated_account is None:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return updated_account


@router.delete("/accounts/{account_id}")
def delete_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar uma conta financeira"""
    success = crud_financial.delete_financial_account(db=db, account_id=account_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return {"message": "Conta deletada com sucesso"}


# ==================== FINANCIAL CATEGORIES ====================

@router.post("/categories/", response_model=FinancialCategory)
def create_category(
    category: FinancialCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova categoria financeira"""
    return crud_financial.create_financial_category(db=db, category=category, user_id=current_user.id)


@router.get("/categories/", response_model=List[FinancialCategory])
def read_categories(
    category_type: Optional[str] = Query(None, description="Filtrar por tipo de categoria (income/expense)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todas as categorias financeiras do usuário"""
    return crud_financial.get_financial_categories(db=db, user_id=current_user.id, category_type=category_type)


@router.get("/categories/{category_id}", response_model=FinancialCategory)
def read_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter uma categoria financeira específica"""
    category = crud_financial.get_financial_category(db=db, category_id=category_id, user_id=current_user.id)
    if category is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return category


@router.put("/categories/{category_id}", response_model=FinancialCategory)
def update_category(
    category_id: uuid.UUID,
    category: FinancialCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar uma categoria financeira"""
    updated_category = crud_financial.update_financial_category(
        db=db, category_id=category_id, category=category, user_id=current_user.id
    )
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return updated_category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar uma categoria financeira"""
    success = crud_financial.delete_financial_category(db=db, category_id=category_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return {"message": "Categoria deletada com sucesso"}


# ==================== FINANCIAL TRANSACTIONS ====================

@router.post("/transactions/", response_model=FinancialTransaction)
def create_transaction(
    transaction: FinancialTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova transação financeira"""
    return crud_financial.create_financial_transaction(db=db, transaction=transaction, user_id=current_user.id)


@router.get("/transactions/", response_model=List[FinancialTransaction])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    account_id: Optional[uuid.UUID] = Query(None, description="Filtrar por conta"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filtrar por categoria"),
    transaction_type: Optional[str] = Query(None, description="Filtrar por tipo (income/expense)"),
    start_date: Optional[date] = Query(None, description="Data inicial"),
    end_date: Optional[date] = Query(None, description="Data final"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todas as transações financeiras do usuário"""
    return crud_financial.get_financial_transactions(
        db=db, user_id=current_user.id, skip=skip, limit=limit,
        account_id=account_id, category_id=category_id, transaction_type=transaction_type,
        start_date=start_date, end_date=end_date
    )


@router.get("/transactions/{transaction_id}", response_model=FinancialTransaction)
def read_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter uma transação financeira específica"""
    transaction = crud_financial.get_financial_transaction(db=db, transaction_id=transaction_id, user_id=current_user.id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transaction


@router.put("/transactions/{transaction_id}", response_model=FinancialTransaction)
def update_transaction(
    transaction_id: uuid.UUID,
    transaction: FinancialTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar uma transação financeira"""
    updated_transaction = crud_financial.update_financial_transaction(
        db=db, transaction_id=transaction_id, transaction=transaction, user_id=current_user.id
    )
    if updated_transaction is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return updated_transaction


@router.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar uma transação financeira"""
    success = crud_financial.delete_financial_transaction(db=db, transaction_id=transaction_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return {"message": "Transação deletada com sucesso"}


# ==================== FINANCIAL GOALS ====================

@router.post("/goals/", response_model=FinancialGoal)
def create_goal(
    goal: FinancialGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova meta financeira"""
    return crud_financial.create_financial_goal(db=db, goal=goal, user_id=current_user.id)


@router.get("/goals/", response_model=List[FinancialGoal])
def read_goals(
    is_active: Optional[bool] = Query(None, description="Filtrar por metas ativas"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todas as metas financeiras do usuário"""
    return crud_financial.get_financial_goals(db=db, user_id=current_user.id, is_active=is_active)


@router.get("/goals/{goal_id}", response_model=FinancialGoal)
def read_goal(
    goal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter uma meta financeira específica"""
    goal = crud_financial.get_financial_goal(db=db, goal_id=goal_id, user_id=current_user.id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Meta não encontrada")
    return goal


@router.put("/goals/{goal_id}", response_model=FinancialGoal)
def update_goal(
    goal_id: uuid.UUID,
    goal: FinancialGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar uma meta financeira"""
    updated_goal = crud_financial.update_financial_goal(
        db=db, goal_id=goal_id, goal=goal, user_id=current_user.id
    )
    if updated_goal is None:
        raise HTTPException(status_code=404, detail="Meta não encontrada")
    return updated_goal


@router.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar uma meta financeira"""
    success = crud_financial.delete_financial_goal(db=db, goal_id=goal_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Meta não encontrada")
    return {"message": "Meta deletada com sucesso"}


# ==================== FINANCIAL BUDGETS ====================

@router.post("/budgets/", response_model=FinancialBudget)
def create_budget(
    budget: FinancialBudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo orçamento financeiro"""
    return crud_financial.create_financial_budget(db=db, budget=budget, user_id=current_user.id)


@router.get("/budgets/", response_model=List[FinancialBudget])
def read_budgets(
    is_active: Optional[bool] = Query(None, description="Filtrar por orçamentos ativos"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todos os orçamentos financeiros do usuário"""
    return crud_financial.get_financial_budgets(db=db, user_id=current_user.id, is_active=is_active)


@router.get("/budgets/{budget_id}", response_model=FinancialBudget)
def read_budget(
    budget_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter um orçamento financeiro específico"""
    budget = crud_financial.get_financial_budget(db=db, budget_id=budget_id, user_id=current_user.id)
    if budget is None:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return budget


@router.put("/budgets/{budget_id}", response_model=FinancialBudget)
def update_budget(
    budget_id: uuid.UUID,
    budget: FinancialBudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar um orçamento financeiro"""
    updated_budget = crud_financial.update_financial_budget(
        db=db, budget_id=budget_id, budget=budget, user_id=current_user.id
    )
    if updated_budget is None:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return updated_budget


@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar um orçamento financeiro"""
    success = crud_financial.delete_financial_budget(db=db, budget_id=budget_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return {"message": "Orçamento deletado com sucesso"}


# ==================== ANALYTICS & REPORTS ====================

@router.get("/analytics/summary", response_model=FinancialSummary)
def get_financial_summary(
    start_date: Optional[date] = Query(None, description="Data inicial (padrão: início do mês atual)"),
    end_date: Optional[date] = Query(None, description="Data final (padrão: hoje)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter resumo financeiro para um período"""
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()
    
    return crud_financial.get_financial_summary(
        db=db, user_id=current_user.id, start_date=start_date, end_date=end_date
    )


@router.get("/analytics/categories", response_model=List[CategorySummary])
def get_category_summary(
    start_date: Optional[date] = Query(None, description="Data inicial (padrão: início do mês atual)"),
    end_date: Optional[date] = Query(None, description="Data final (padrão: hoje)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter resumo por categorias para um período"""
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()
    
    return crud_financial.get_category_summary(
        db=db, user_id=current_user.id, start_date=start_date, end_date=end_date
    )


@router.get("/analytics/trends", response_model=List[MonthlyTrend])
def get_monthly_trends(
    months: int = Query(12, description="Número de meses para análise (padrão: 12)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter tendências mensais de receitas e despesas"""
    return crud_financial.get_monthly_trends(
        db=db, user_id=current_user.id, months=months
    )


@router.get("/analytics/dashboard", response_model=FinancialDashboard)
def get_financial_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter dados completos para o dashboard financeiro"""
    user_id = current_user.id
    today = date.today()
    start_of_month = today.replace(day=1)
    
    # Buscar dados necessários
    accounts = crud_financial.get_financial_accounts(db=db, user_id=user_id)
    recent_transactions = crud_financial.get_financial_transactions(
        db=db, user_id=user_id, limit=10
    )
    monthly_summary = crud_financial.get_financial_summary(
        db=db, user_id=user_id, start_date=start_of_month, end_date=today
    )
    active_goals = crud_financial.get_financial_goals(
        db=db, user_id=user_id, is_active=True
    )
    budget_alerts = crud_financial.get_financial_budgets(
        db=db, user_id=user_id, is_active=True
    )
    cash_flow_prediction = crud_financial.get_monthly_trends(
        db=db, user_id=user_id, months=6
    )
    
    return FinancialDashboard(
        accounts=accounts,
        recent_transactions=recent_transactions,
        monthly_summary=monthly_summary,
        active_goals=active_goals,
        budget_alerts=budget_alerts,
        cash_flow_prediction=cash_flow_prediction
    )