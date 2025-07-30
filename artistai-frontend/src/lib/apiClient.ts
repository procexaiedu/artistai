import axios from 'axios';
import { createClient } from './supabase';

// Cliente de API pré-configurado para o backend FastAPI
const getApiBaseUrl = () => {
  // Em produção, usar a variável de ambiente
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;
  }
  
  // Em desenvolvimento, usar localhost
  return 'http://localhost:8000/api/v1';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para operações WhatsApp
});

// Interceptor para adicionar token JWT automaticamente
apiClient.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tipos TypeScript para os dados da API
export interface Artist {
  id: string;
  name: string;
  photo_url?: string;
  base_fee: number;
  min_fee: number;
  down_payment_percentage: number;
  base_city?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ArtistCreate {
  name: string;
  photo_url?: string;
  base_fee: number;
  min_fee: number;
  down_payment_percentage: number;
  base_city?: string;
  status?: string;
}

export interface ArtistUpdate {
  name?: string;
  photo_url?: string;
  base_fee?: number;
  min_fee?: number;
  down_payment_percentage?: number;
  base_city?: string;
  status?: string;
}

// Tipos para Pipeline Stages
export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStageCreate {
  name: string;
  order: number;
}

export interface PipelineStageUpdate {
  name?: string;
  order?: number;
}

// Tipos para Notes
export interface Note {
  id: string;
  contractor_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  contractor_id: string;
  content: string;
}

export interface NoteUpdate {
  content?: string;
}

// Tipos para Contratantes
export interface Contractor {
  id: string;
  name: string;
  cpf_cnpj?: string;
  email?: string;
  phone: string;
  stage_id?: string;
  location?: string;
  specialties?: string[];
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractorCreate {
  name: string;
  cpf_cnpj?: string;
  email?: string;
  phone: string;
  stage_id?: string;
  location?: string;
  specialties?: string[];
  bio?: string;
}

export interface ContractorUpdate {
  name?: string;
  cpf_cnpj?: string;
  email?: string;
  phone?: string;
  stage_id?: string;
  location?: string;
  specialties?: string[];
  bio?: string;
}

export interface ContractorWithDetails extends Contractor {
  stage?: PipelineStage;
  notes?: Note[];
}

// Tipos para Eventos
export interface Event {
  id: string;
  title: string;
  event_date: string;
  event_location?: string;
  agreed_fee: number;
  status: string;
  artist_id: string;
  contractor_id: string;
  created_at: string;
  artist: Artist;
  contractor: Contractor;
}

export interface EventCreate {
  title: string;
  event_date: string;
  event_location?: string;
  agreed_fee: number;
  status?: string;
  artist_id: string;
  contractor_id: string;
}

export interface EventUpdate {
  title?: string;
  event_date?: string;
  event_location?: string;
  agreed_fee?: number;
  status?: string;
  artist_id?: string;
  contractor_id?: string;
}

// Funções da API para artistas
export const artistsApi = {
  // Listar artistas
  getArtists: async (skip = 0, limit = 100): Promise<Artist[]> => {
    const response = await apiClient.get(`/artists?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar artista por ID
  getArtist: async (artistId: string): Promise<Artist> => {
    const response = await apiClient.get(`/artists/${artistId}`);
    return response.data;
  },

  // Criar novo artista
  createArtist: async (artist: ArtistCreate): Promise<Artist> => {
    const response = await apiClient.post('/artists/', artist);
    return response.data;
  },

  // Atualizar artista
  updateArtist: async (artistId: string, artist: ArtistUpdate): Promise<Artist> => {
    const response = await apiClient.patch(`/artists/${artistId}`, artist);
    return response.data;
  },

  // Deletar artista
  deleteArtist: async (artistId: string): Promise<Artist> => {
    const response = await apiClient.delete(`/artists/${artistId}`);
    return response.data;
  },
};

// Funções da API para contratantes
export const contractorsApi = {
  // Listar contratantes
  getContractors: async (skip = 0, limit = 100): Promise<Contractor[]> => {
    const response = await apiClient.get(`/contractors?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar contratante por ID
  getContractor: async (contractorId: string): Promise<Contractor> => {
    const response = await apiClient.get(`/contractors/${contractorId}`);
    return response.data;
  },

  // Criar novo contratante
  createContractor: async (contractor: ContractorCreate): Promise<Contractor> => {
    const response = await apiClient.post('/contractors/', contractor);
    return response.data;
  },

  // Atualizar contratante
  updateContractor: async (contractorId: string, contractor: ContractorUpdate): Promise<Contractor> => {
    const response = await apiClient.patch(`/contractors/${contractorId}`, contractor);
    return response.data;
  },

  // Deletar contratante
  deleteContractor: async (contractorId: string): Promise<Contractor> => {
    const response = await apiClient.delete(`/contractors/${contractorId}`);
    return response.data;
  },
};

// Funções da API para eventos
export const eventsApi = {
  // Listar eventos com filtros de data
  getEvents: async (skip = 0, limit = 100, startDate?: string, endDate?: string): Promise<Event[]> => {
    let url = `/events?skip=${skip}&limit=${limit}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Buscar evento por ID
  getEvent: async (eventId: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },

  // Criar novo evento
  createEvent: async (event: EventCreate): Promise<Event> => {
    const response = await apiClient.post('/events/', event);
    return response.data;
  },

  // Atualizar evento
  updateEvent: async (eventId: string, event: EventUpdate): Promise<Event> => {
    const response = await apiClient.patch(`/events/${eventId}`, event);
    return response.data;
  },

  // Deletar evento
  deleteEvent: async (eventId: string): Promise<Event> => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
  },

  // Buscar eventos por artista
  getEventsByArtist: async (artistId: string): Promise<Event[]> => {
    const response = await apiClient.get(`/events/by-artist/${artistId}`);
    return response.data;
  },

  // Buscar eventos por contratante
  getEventsByContractor: async (contractorId: string): Promise<Event[]> => {
    const response = await apiClient.get(`/events/by-contractor/${contractorId}`);
    return response.data;
  },
};

// Interfaces para Conversas
export interface Conversation {
  id: string;
  user_id: string;
  contractor_id: string;
  channel: string;
  status: string;
  last_message_at?: string;
  created_at: string;
  contractor: Contractor;
}

export interface Message {
  id: string;
  user_id: string;
  conversation_id: string;
  sender_type: string;
  content_type: string;
  content: string;
  whatsapp_message_id?: string;
  timestamp: string;
}

export interface MessageCreate {
  conversation_id: string;
  sender_type: string;
  content_type?: string;
  content: string;
  timestamp?: string;
}

// Funções para Conversas
export const conversationAPI = {
  // Listar conversas
  getConversations: async (skip = 0, limit = 100): Promise<Conversation[]> => {
    const response = await apiClient.get(`/conversations/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar mensagens de uma conversa
  getConversationMessages: async (conversationId: string, skip = 0, limit = 100): Promise<Message[]> => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Enviar mensagem
  sendMessage: async (conversationId: string, messageData: MessageCreate): Promise<Message> => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, messageData);
    return response.data;
  },
};

// Interfaces para WhatsApp
export interface WhatsAppStatus {
  instance_name: string;
  status: string;
  connected: boolean;
}

export interface WhatsAppConnectionResponse {
  success: boolean;
  message: string;
  qr_code?: string;
  instance_name?: string;
  already_connected?: boolean;
}

// Funções da API para WhatsApp
export const whatsappApi = {
  // Verificar status da conexão WhatsApp
  getStatus: async (): Promise<WhatsAppStatus> => {
    const response = await apiClient.get('/whatsapp/status');
    return response.data;
  },

  // Conectar WhatsApp
  connect: async (): Promise<WhatsAppConnectionResponse> => {
    const response = await apiClient.post('/whatsapp/connect');
    return response.data;
  },

  // Forçar reconexão do WhatsApp
  reconnect: async (): Promise<WhatsAppConnectionResponse> => {
    const response = await apiClient.post('/whatsapp/reconnect');
    return response.data;
  },

  // Desconectar WhatsApp
  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/whatsapp/disconnect');
    return response.data;
  },
};

// Funções da API para Pipeline Stages
export const stagesApi = {
  // Listar stages
  getStages: async (skip = 0, limit = 100): Promise<PipelineStage[]> => {
    const response = await apiClient.get(`/stages?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar stage por ID
  getStage: async (stageId: string): Promise<PipelineStage> => {
    const response = await apiClient.get(`/stages/${stageId}`);
    return response.data;
  },

  // Criar novo stage
  createStage: async (stage: PipelineStageCreate): Promise<PipelineStage> => {
    const response = await apiClient.post('/stages/', stage);
    return response.data;
  },

  // Atualizar stage
  updateStage: async (stageId: string, stage: PipelineStageUpdate): Promise<PipelineStage> => {
    const response = await apiClient.patch(`/stages/${stageId}`, stage);
    return response.data;
  },

  // Deletar stage
  deleteStage: async (stageId: string): Promise<void> => {
    await apiClient.delete(`/stages/${stageId}`);
  },

  // Reordenar stages
  reorderStages: async (stageIds: string[]): Promise<PipelineStage[]> => {
    const response = await apiClient.post('/stages/reorder', { stage_ids: stageIds });
    return response.data;
  },
};

// Funções da API para Notes
export const notesApi = {
  // Listar notes de um contractor
  getNotesByContractor: async (contractorId: string, skip = 0, limit = 100): Promise<Note[]> => {
    const response = await apiClient.get(`/contractors/${contractorId}/notes?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Listar todas as notes do usuário
  getNotes: async (skip = 0, limit = 100): Promise<Note[]> => {
    const response = await apiClient.get(`/notes?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar note por ID
  getNote: async (noteId: string): Promise<Note> => {
    const response = await apiClient.get(`/notes/${noteId}`);
    return response.data;
  },

  // Criar nova note
  createNote: async (note: NoteCreate): Promise<Note> => {
    const response = await apiClient.post('/notes/', note);
    return response.data;
  },

  // Atualizar note
  updateNote: async (noteId: string, note: NoteUpdate): Promise<Note> => {
    const response = await apiClient.patch(`/notes/${noteId}`, note);
    return response.data;
  },

  // Deletar note
  deleteNote: async (noteId: string): Promise<void> => {
    await apiClient.delete(`/notes/${noteId}`);
  },
};

// Tipos para o módulo financeiro
export interface FinancialAccount {
  id: string;
  name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  is_active: boolean;
  description?: string;
  bank_name?: string;
  account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialAccountCreate {
  name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance?: number;
  currency?: string;
  is_active?: boolean;
  description?: string;
  bank_name?: string;
  account_number?: string;
}

export interface FinancialAccountUpdate {
  name?: string;
  account_type?: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance?: number;
  currency?: string;
  is_active?: boolean;
  description?: string;
  bank_name?: string;
  account_number?: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  category_type: 'income' | 'expense';
  color?: string;
  description?: string;
  is_active: boolean;
  icon?: string;
  is_tax_deductible?: boolean;
  budget_limit?: number;
  parent_category_id?: string;
  total_transactions?: number;
  total_amount?: number;
  avg_transaction?: number;
  last_transaction_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialCategoryCreate {
  name: string;
  category_type: 'income' | 'expense';
  color?: string;
  description?: string;
  is_active?: boolean;
}

export interface FinancialCategoryUpdate {
  name?: string;
  category_type?: 'income' | 'expense';
  color?: string;
  description?: string;
  is_active?: boolean;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer';
  transaction_date: string;
  account_id: string;
  category_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  tags?: string[];
  reference_number?: string;
  event_id?: string;
  contractor_id?: string;
  due_date?: string;
  is_tax_deductible?: boolean;
  tax_category?: string;
  created_at: string;
  updated_at: string;
  account: FinancialAccount;
  category?: FinancialCategory;
  account_name?: string;
  category_name?: string;
}

export interface FinancialTransactionCreate {
  description: string;
  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer';
  transaction_date: string;
  account_id: string;
  category_id?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  tags?: string[];
  reference_number?: string;
  event_id?: string;
  contractor_id?: string;
  due_date?: string;
  is_tax_deductible?: boolean;
  tax_category?: string;
}

export interface FinancialTransactionUpdate {
  description?: string;
  amount?: number;
  transaction_type?: 'income' | 'expense' | 'transfer';
  transaction_date?: string;
  account_id?: string;
  category_id?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  tags?: string[];
  reference_number?: string;
  event_id?: string;
  contractor_id?: string;
  due_date?: string;
  is_tax_deductible?: boolean;
  tax_category?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  description?: string;
  goal_type: 'savings' | 'debt_payment' | 'investment' | 'expense_reduction' | 'income_increase';
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoalCreate {
  name: string;
  description?: string;
  goal_type: 'savings' | 'debt_payment' | 'investment' | 'expense_reduction' | 'income_increase';
  target_amount: number;
  current_amount?: number;
  target_date: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface FinancialGoalUpdate {
  name?: string;
  description?: string;
  goal_type?: 'savings' | 'debt_payment' | 'investment' | 'expense_reduction' | 'income_increase';
  target_amount?: number;
  current_amount?: number;
  target_date?: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

// Interface para categoria dentro do orçamento
export interface BudgetCategory {
  id: string;
  category_name: string;
  allocated_amount: number;
  spent_amount: number;
  percentage_used: number;
}

export interface FinancialBudget {
  id: string;
  name: string;
  description?: string;
  budget_type: 'monthly' | 'quarterly' | 'yearly' | 'project';
  period_start: string;
  period_end: string;
  total_budget: number;
  spent_amount: number;
  remaining_amount: number;
  status: 'active' | 'completed' | 'exceeded' | 'draft';
  is_recurring: boolean;
  alert_threshold: number;
  notes?: string;
  categories?: BudgetCategory[];
  created_at: string;
  updated_at: string;
}

export interface FinancialBudgetCreate {
  name: string;
  description?: string;
  budget_type: 'monthly' | 'quarterly' | 'yearly' | 'project';
  period_start: string;
  period_end: string;
  total_budget: number;
  is_recurring?: boolean;
  alert_threshold?: number;
  notes?: string;
}

export interface FinancialBudgetUpdate {
  name?: string;
  description?: string;
  budget_type?: 'monthly' | 'quarterly' | 'yearly' | 'project';
  period_start?: string;
  period_end?: string;
  total_budget?: number;
  is_recurring?: boolean;
  alert_threshold?: number;
  notes?: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_income: number;
  total_balance: number;
  pending_transactions: number;
  active_goals: number;
  completed_goals: number;
  active_budgets: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_type: string;
  total_amount: number;
  transaction_count: number;
  percentage_of_total: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}

export interface FinancialAnalytics {
  summary: FinancialSummary;
  categories: CategorySummary[];
  monthly_trends: MonthlyTrend[];
  top_expenses: FinancialTransaction[];
  recent_transactions: FinancialTransaction[];
}

export interface AccountDistribution {
  account_name: string;
  account_type: string;
  balance: number;
  percentage: number;
}

export interface GoalProgress {
  goal_name: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  days_remaining: number;
}

// Funções da API para contas financeiras
export const financialAccountsApi = {
  // Listar contas
  getAccounts: async (skip = 0, limit = 100): Promise<FinancialAccount[]> => {
    const response = await apiClient.get(`/financial/accounts?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar conta por ID
  getAccount: async (accountId: string): Promise<FinancialAccount> => {
    const response = await apiClient.get(`/financial/accounts/${accountId}`);
    return response.data;
  },

  // Criar nova conta
  createAccount: async (account: FinancialAccountCreate): Promise<FinancialAccount> => {
    const response = await apiClient.post('/financial/accounts/', account);
    return response.data;
  },

  // Atualizar conta
  updateAccount: async (accountId: string, account: FinancialAccountUpdate): Promise<FinancialAccount> => {
    const response = await apiClient.patch(`/financial/accounts/${accountId}`, account);
    return response.data;
  },

  // Deletar conta
  deleteAccount: async (accountId: string): Promise<void> => {
    await apiClient.delete(`/financial/accounts/${accountId}`);
  },
};

// Funções da API para categorias financeiras
export const financialCategoriesApi = {
  // Listar categorias
  getCategories: async (skip = 0, limit = 100): Promise<FinancialCategory[]> => {
    const response = await apiClient.get(`/financial/categories?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar categoria por ID
  getCategory: async (categoryId: string): Promise<FinancialCategory> => {
    const response = await apiClient.get(`/financial/categories/${categoryId}`);
    return response.data;
  },

  // Criar nova categoria
  createCategory: async (category: FinancialCategoryCreate): Promise<FinancialCategory> => {
    const response = await apiClient.post('/financial/categories/', category);
    return response.data;
  },

  // Atualizar categoria
  updateCategory: async (categoryId: string, category: FinancialCategoryUpdate): Promise<FinancialCategory> => {
    const response = await apiClient.patch(`/financial/categories/${categoryId}`, category);
    return response.data;
  },

  // Deletar categoria
  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/financial/categories/${categoryId}`);
  },
};

// Funções da API para transações financeiras
export const financialTransactionsApi = {
  // Listar transações
  getTransactions: async (skip = 0, limit = 100, filters?: {
    account_id?: string;
    category_id?: string;
    transaction_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<FinancialTransaction[]> => {
    let url = `/financial/transactions?skip=${skip}&limit=${limit}`;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url += `&${key}=${value}`;
      });
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  // Buscar transação por ID
  getTransaction: async (transactionId: string): Promise<FinancialTransaction> => {
    const response = await apiClient.get(`/financial/transactions/${transactionId}`);
    return response.data;
  },

  // Criar nova transação
  createTransaction: async (transaction: FinancialTransactionCreate): Promise<FinancialTransaction> => {
    const response = await apiClient.post('/financial/transactions/', transaction);
    return response.data;
  },

  // Atualizar transação
  updateTransaction: async (transactionId: string, transaction: FinancialTransactionUpdate): Promise<FinancialTransaction> => {
    const response = await apiClient.patch(`/financial/transactions/${transactionId}`, transaction);
    return response.data;
  },

  // Deletar transação
  deleteTransaction: async (transactionId: string): Promise<void> => {
    await apiClient.delete(`/financial/transactions/${transactionId}`);
  },
};

// Funções da API para metas financeiras
export const financialGoalsApi = {
  // Listar metas
  getGoals: async (skip = 0, limit = 100): Promise<FinancialGoal[]> => {
    const response = await apiClient.get(`/financial/goals?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar meta por ID
  getGoal: async (goalId: string): Promise<FinancialGoal> => {
    const response = await apiClient.get(`/financial/goals/${goalId}`);
    return response.data;
  },

  // Criar nova meta
  createGoal: async (goal: FinancialGoalCreate): Promise<FinancialGoal> => {
    const response = await apiClient.post('/financial/goals/', goal);
    return response.data;
  },

  // Atualizar meta
  updateGoal: async (goalId: string, goal: FinancialGoalUpdate): Promise<FinancialGoal> => {
    const response = await apiClient.patch(`/financial/goals/${goalId}`, goal);
    return response.data;
  },

  // Deletar meta
  deleteGoal: async (goalId: string): Promise<void> => {
    await apiClient.delete(`/financial/goals/${goalId}`);
  },
};

// Funções da API para orçamentos financeiros
export const financialBudgetsApi = {
  // Listar orçamentos
  getBudgets: async (skip = 0, limit = 100): Promise<FinancialBudget[]> => {
    const response = await apiClient.get(`/financial/budgets?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Buscar orçamento por ID
  getBudget: async (budgetId: string): Promise<FinancialBudget> => {
    const response = await apiClient.get(`/financial/budgets/${budgetId}`);
    return response.data;
  },

  // Criar novo orçamento
  createBudget: async (budget: FinancialBudgetCreate): Promise<FinancialBudget> => {
    const response = await apiClient.post('/financial/budgets/', budget);
    return response.data;
  },

  // Atualizar orçamento
  updateBudget: async (budgetId: string, budget: FinancialBudgetUpdate): Promise<FinancialBudget> => {
    const response = await apiClient.patch(`/financial/budgets/${budgetId}`, budget);
    return response.data;
  },

  // Deletar orçamento
  deleteBudget: async (budgetId: string): Promise<void> => {
    await apiClient.delete(`/financial/budgets/${budgetId}`);
  },
};

// Funções da API para relatórios financeiros
export const financialReportsApi = {
  // Obter resumo financeiro
  getSummary: async (): Promise<FinancialSummary> => {
    const response = await apiClient.get('/financial/analytics/summary');
    return response.data;
  },

  // Obter tendências mensais
  getMonthlyTrends: async (months?: number): Promise<MonthlyTrend[]> => {
    let url = '/financial/analytics/trends';
    if (months) url += `?months=${months}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obter resumo por categorias
  getCategorySummary: async (): Promise<CategorySummary[]> => {
    const response = await apiClient.get('/financial/analytics/categories');
    return response.data;
  },

  // Obter dashboard financeiro
  getDashboard: async (): Promise<{
    accounts: FinancialAccount[];
    recent_transactions: FinancialTransaction[];
    monthly_summary: FinancialSummary;
    active_goals: FinancialGoal[];
    budget_alerts: FinancialBudget[];
    cash_flow_prediction: MonthlyTrend[];
  }> => {
    const response = await apiClient.get('/financial/analytics/dashboard');
    return response.data;
  },
};

// Tipos para Dashboard Principal
export interface DashboardKPIs {
  active_artists_count: number;
  active_leads_count: number;
  upcoming_events_count: number;
  monthly_revenue: number;
}

export interface PipelineSummaryItem {
  stage_name: string;
  contractor_count: number;
  stage_id?: string;
}

export interface FinancialSummaryDashboard {
  monthly_income: number;
  monthly_expenses: number;
  net_income: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface UpcomingEventSummary {
  id: string;
  title: string;
  event_date: string;
  event_location?: string;
  agreed_fee: number;
  status: string;
  days_until: number;
  artist_name?: string;
  contractor_name?: string;
}

export interface ConversationsSummary {
  open_conversations: number;
  needs_attention: number;
  total_active: number;
}

export interface MainDashboard {
  kpis: DashboardKPIs;
  pipeline_summary: PipelineSummaryItem[];
  financial_summary: FinancialSummaryDashboard;
  recent_activities: RecentActivity[];
  upcoming_events: UpcomingEventSummary[];
  conversations_summary: ConversationsSummary;
}

// Tipos para gamificação
export interface UserStats {
  level: number;
  experience_points: number;
  total_points: number;
  current_streak: number;
  best_streak: number;
  ranking_position: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'sales' | 'communication' | 'events' | 'growth';
  points_reward: number;
  progress: number;
  unlocked_at?: string;
  unlocked: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  current_progress: number;
  points_reward: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: string;
  end_date: string;
}

export interface CommunicationStats {
  total_messages: number;
  messages_today: number;
  response_rate: number;
  avg_response_time: number;
  active_conversations: number;
  last_activity?: string;
}

// Funções da API para Dashboard Principal
export const dashboardApi = {
  // Obter KPIs principais
  getKPIs: async (): Promise<DashboardKPIs> => {
    const response = await apiClient.get('/dashboard/kpis');
    return response.data;
  },

  // Obter resumo do pipeline
  getPipelineSummary: async (): Promise<PipelineSummaryItem[]> => {
    const response = await apiClient.get('/dashboard/pipeline-summary');
    return response.data;
  },

  // Obter resumo financeiro
  getFinancialSummary: async (): Promise<FinancialSummaryDashboard> => {
    const response = await apiClient.get('/dashboard/financial-summary');
    return response.data;
  },

  // Obter atividades recentes
  getRecentActivities: async (): Promise<RecentActivity[]> => {
    const response = await apiClient.get('/dashboard/recent-activities');
    return response.data;
  },

  // Obter próximos eventos
  getUpcomingEvents: async (): Promise<UpcomingEventSummary[]> => {
    const response = await apiClient.get('/dashboard/upcoming-events');
    return response.data;
  },

  // Obter resumo das conversas
  getConversationsSummary: async (): Promise<ConversationsSummary> => {
    const response = await apiClient.get('/dashboard/conversations-summary');
    return response.data;
  },

  // Obter dashboard completo
  getMainDashboard: async (): Promise<MainDashboard> => {
    const response = await apiClient.get('/dashboard/');
    return response.data;
  },

  // Gamificação
  getUserStats: async (userId: string): Promise<UserStats> => {
    const response = await apiClient.get(`/dashboard/gamification/user-stats/${userId}`);
    return response.data;
  },

  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const response = await apiClient.get(`/dashboard/gamification/achievements/${userId}`);
    return response.data;
  },

  getUserChallenges: async (userId: string): Promise<Challenge[]> => {
    const response = await apiClient.get(`/dashboard/gamification/challenges/${userId}`);
    return response.data;
  },

  // Comunicação
  getCommunicationStats: async (userId: string): Promise<CommunicationStats> => {
    const response = await apiClient.get(`/dashboard/communication/stats/${userId}`);
    return response.data;
  },

  getRecentMessages: async (userId: string, limit: number = 20): Promise<any[]> => {
    const response = await apiClient.get(`/dashboard/communication/messages/${userId}?limit=${limit}`);
    return response.data.messages;
  },
};

export default apiClient;