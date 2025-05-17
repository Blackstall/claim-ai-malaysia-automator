
import axios from 'axios';
import { supabase } from "@/integrations/supabase/client";

// Define the base URL for API calls
const API_URL = 'http://localhost:8000';

// Define response types
interface RagResponse {
  answer: string;
}

// Export the Claim interface so it can be imported elsewhere
export interface Claim {
  id: number | string;
  ic_number: string;
  age: number;
  months_as_customer: number;
  vehicle_age_years: number;
  vehicle_make: string;
  policy_expired_flag: boolean;
  deductible_amount: number;
  market_value: number;
  damage_severity_score: number;
  repair_amount: number;
  at_fault_flag: boolean;
  time_to_report_days: number;
  claim_reported_to_police_flag: boolean;
  license_type_missing_flag: boolean;
  num_third_parties: number;
  num_witnesses: number;
  approval_flag: boolean;
  coverage_amount: number;
  claim_description: string;
  customer_background: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Claim[];
}

// Helper function for cookie retrieval
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Simple API client for compatibility
const apiClient = {
  post: axios.post
};

export interface ClaimsResponse {
  results: Claim[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PredictionInput {
  [key: string]: any;
}

export interface PredictionResponse {
  [key: string]: any;
}

// Define the claims service
export const claimsService = {
  // Method to query the RAG endpoint
  ragQuery: async (query: string): Promise<RagResponse> => {
    try {
      const response = await axios.post<RagResponse>(`${API_URL}/claims/api/rag/`, {
        query: query
      });
      return response.data;
    } catch (error) {
      console.error('Error calling RAG API:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  },

  // Get all claims - now using Supabase for Dashboard
  getAllClaims: async (page = 1, search?: string): Promise<PaginatedResponse> => {
    try {
      console.log("Fetching claims from Supabase...");
      
      let query = supabase.from('claims').select('*');
      
      if (search) {
        query = query.or(`ic_number.ilike.%${search}%,vehicle_make.ilike.%${search}%,claim_description.ilike.%${search}%`);
      }
      
      // Basic pagination
      const pageSize = 10;
      const from = (page - 1) * pageSize;
      const to = page * pageSize - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to FastAPI if Supabase fails
        return fallbackToFastApi(page, search);
      }
      
      // Transform to match our interface
      const results = data as unknown as Claim[];
      
      return {
        count: count || results.length,
        next: count && from + pageSize < count ? `/claims?page=${page + 1}` : null,
        previous: page > 1 ? `/claims?page=${page - 1}` : null,
        results
      };
    } catch (error) {
      console.error('Error fetching claims from Supabase:', error);
      // Fallback to FastAPI
      return fallbackToFastApi(page, search);
    }
  },
  
  // Fallback function to get claims from FastAPI
  fallbackToFastApi: async (page = 1, search?: string): Promise<PaginatedResponse> => {
    try {
      console.log("Falling back to FastAPI...");
      let url = `${API_URL}/claims/api/claims/?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await axios.get<PaginatedResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching claims from FastAPI:', error);
      throw new Error('Failed to fetch claims data from all sources');
    }
  },

  // Get claim by ID - now using Supabase for Dashboard
  getClaimById: async (id: number | string): Promise<Claim> => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to FastAPI if Supabase fails
        return fallbackGetClaimById(id);
      }
      
      if (!data) {
        throw new Error(`Claim with ID ${id} not found in Supabase`);
      }
      
      return data as unknown as Claim;
    } catch (error) {
      console.error(`Error fetching claim #${id} from Supabase:`, error);
      // Fallback to FastAPI
      return fallbackGetClaimById(id);
    }
  },
  
  // Fallback function to get claim by ID from FastAPI
  fallbackGetClaimById: async (id: number | string): Promise<Claim> => {
    try {
      console.log("Falling back to FastAPI for single claim...");
      const response = await axios.get<Claim>(`${API_URL}/claims/api/claims/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching claim #${id} from FastAPI:`, error);
      throw new Error('Failed to fetch claim data from all sources');
    }
  },

  // Create a new claim - now using Supabase for SubmitClaim
  createClaim: async (claim: Omit<Claim, 'id'>): Promise<Claim> => {
    try {
      console.log('Creating new claim in Supabase:', claim);
      
      const { data, error } = await supabase
        .from('claims')
        .insert([claim])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to FastAPI if Supabase fails
        return fallbackCreateClaim(claim as any);
      }
      
      console.log('Supabase response:', data);
      return data as unknown as Claim;
    } catch (error) {
      console.error('Error creating claim in Supabase:', error);
      // Fallback to FastAPI
      return fallbackCreateClaim(claim as any);
    }
  },
  
  // Fallback function to create claim in FastAPI
  fallbackCreateClaim: async (claim: Claim): Promise<Claim> => {
    try {
      console.log("Falling back to FastAPI for claim creation...");
      const csrfToken = getCookie('csrftoken');
      
      try {
        // First attempt: Try using our configured Axios instance with the claims endpoint
        const response = await apiClient.post('claims/api/claims/', claim, {
          headers: {
            // Include CSRF token if available
            ...(csrfToken && { 'X-CSRFToken': csrfToken }),
          },
        });
        
        console.log('API Response:', response);
        return response.data;
      } catch (primaryError) {
        console.error('First API attempt failed:', primaryError);
        
        // Second attempt: Try with direct axios without credentials (CORS fallback)
        console.log('Trying fallback without credentials...');
        const fallbackResponse = await axios.post(`${API_URL}/claims/api/claims/`, claim, {
          headers: {
            'Content-Type': 'application/json',
          },
          // Disable credentials for CORS fallback
          withCredentials: false,
        });
        
        console.log('Fallback API Response:', fallbackResponse);
        return fallbackResponse.data;
      }
    } catch (error: any) {
      console.error('All API attempts failed in createClaim:', error);
      
      // Log detailed error info to help with debugging
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        
        // If it's a Django validation error, it could have field-specific errors
        if (error.response.data && typeof error.response.data === 'object') {
          console.error('Field validation errors:', error.response.data);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw error;
    }
  },
  
  // Update a claim
  updateClaim: async (id: number, claim: Claim): Promise<Claim> => {
    const response = await axios.put(`${API_URL}/claims/api/claims/${id}/`, claim);
    return response.data;
  },
  
  // Delete a claim
  deleteClaim: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/claims/api/claims/${id}/`);
  },
  
  // Filter claims by damage score
  filterByDamageScore: async (minScore?: number, maxScore?: number): Promise<Claim[]> => {
    let url = `${API_URL}/claims/api/claims/filter_by_damage_score/`;
    if (minScore !== undefined || maxScore !== undefined) {
      url += '?';
      if (minScore !== undefined) url += `min_score=${minScore}`;
      if (minScore !== undefined && maxScore !== undefined) url += '&';
      if (maxScore !== undefined) url += `max_score=${maxScore}`;
    }
    const response = await axios.get(url);
    return response.data;
  },
  
  // Filter claims by repair amount
  filterByRepairAmount: async (minAmount?: number, maxAmount?: number): Promise<Claim[]> => {
    let url = `${API_URL}/claims/api/claims/filter_by_repair_amount/`;
    if (minAmount !== undefined || maxAmount !== undefined) {
      url += '?';
      if (minAmount !== undefined) url += `min_amount=${minAmount}`;
      if (minAmount !== undefined && maxAmount !== undefined) url += '&';
      if (maxAmount !== undefined) url += `max_amount=${maxAmount}`;
    }
    const response = await axios.get(url);
    return response.data;
  },
  
  // Search claims
  searchClaims: async (query: string): Promise<ClaimsResponse> => {
    const response = await axios.get(`${API_URL}/claims/api/claims/?search=${query}`);
    return response.data;
  },
  
  // Predict claim approval (converted from FastAPI)
  predictClaim: async (data: PredictionInput): Promise<PredictionResponse> => {
    try {
      const csrfToken = getCookie('csrftoken');
      
      const response = await apiClient.post('api/predict/', data, {
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Prediction API error:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      throw error;
    }
  },

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string; message: string }> {
    try {
      const response = await axios.get<{ status: string; timestamp: string; message: string }>(
        `${API_URL}/health`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking server health:", error);
      throw new Error("Server health check failed");
    }
  }
}; 
