import axios from 'axios';

// Update API URL to match Django backend port (8000 by default)
const API_URL = 'http://localhost:8000/claims/api/claims/';

// Axios instance with CORS config
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
  // Try with and without this option if you experience CORS issues
  withCredentials: true,
});

// Add a function to get CSRF token if using Django's CSRF protection
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export interface Claim {
  id?: number;
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

export interface ClaimsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Claim[];
}

export interface PredictionInput {
  age: number;
  months_as_customer: number;
  vehicle_age_years: number;
  vehicle_make: string;
  policy_expired_flag: number;
  deductible_amount: number;
  market_value: number;
  damage_severity_score: number;
  repair_amount: number;
  at_fault_flag: number;
  time_to_report_days: number;
  claim_reported_to_police_flag: number;
  license_type_missing_flag: number;
  num_third_parties: number;
  num_witnesses: number;
}

export interface PredictionResponse {
  approval: {
    decision: number;
    probability: number;
  };
  coverage: {
    amount: number;
  } | null;
  anomaly: {
    score: number;
    is_anomaly: number;
  };
}

export interface RagResponse {
  answer: string;
}

export const claimsService = {
  // Get all claims with pagination
  getAllClaims: async (page = 1): Promise<ClaimsResponse> => {
    const response = await axios.get(`${API_URL}?page=${page}`);
    return response.data;
  },
  
  // Get a single claim by ID
  getClaimById: async (id: number): Promise<Claim> => {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data;
  },
  
  // Create a new claim
  createClaim: async (claim: Claim): Promise<Claim> => {
    try {
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
        const fallbackResponse = await axios.post(API_URL, claim, {
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
    const response = await axios.put(`${API_URL}${id}/`, claim);
    return response.data;
  },
  
  // Delete a claim
  deleteClaim: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${id}/`);
  },
  
  // Filter claims by damage score
  filterByDamageScore: async (minScore?: number, maxScore?: number): Promise<Claim[]> => {
    let url = `${API_URL}filter_by_damage_score/`;
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
    let url = `${API_URL}filter_by_repair_amount/`;
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
    const response = await axios.get(`${API_URL}?search=${query}`);
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
  
  // RAG query for insurance information (converted from FastAPI)
  ragQuery: async (prompt: string): Promise<RagResponse> => {
    try {
      const csrfToken = getCookie('csrftoken');
      
      const response = await apiClient.post('api/rag/', { prompt }, {
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('RAG API error:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      throw error;
    }
  }
}; 