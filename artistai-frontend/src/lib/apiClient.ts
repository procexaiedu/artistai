import axios from 'axios';
import { createClient } from './supabase';

// Cliente de API pré-configurado para o backend FastAPI
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
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

// Tipos para Contratantes
export interface Contractor {
  id: string;
  name: string;
  cpf_cnpj?: string;
  email?: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface ContractorCreate {
  name: string;
  cpf_cnpj?: string;
  email?: string;
  phone: string;
}

export interface ContractorUpdate {
  name?: string;
  cpf_cnpj?: string;
  email?: string;
  phone?: string;
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

export default apiClient; 