
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
  id: string | number;
  ic_number: string;
  plate_number: string;
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

  // Fallback function to get claims from FastAPI
  fallbackToFastAPI: async (page = 1, search?: string): Promise<PaginatedResponse> => {
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

  // Get all claims - now using dummy data for Dashboard
  getAllClaims: async (page = 1): Promise<PaginatedResponse> => {
    try {
      console.log("Using dummy data for claims...");
      
      // Dummy data for claims
      const dummyData: Claim[] = [
        {
          id: "1",
          ic_number: "IC12345678",
          plate_number: "ABC1234",
          vehicle_make: "Toyota Camry",
          vehicle_age_years: 5,
          claim_description: "Front bumper damage due to collision with another vehicle at traffic light. The other driver ran a red light and crashed into my car.",
          repair_amount: 3500,
          approval_flag: true,
          claim_reported_to_police_flag: true,
          policy_expired_flag: false,
          at_fault_flag: false,
          age: 35,
          months_as_customer: 24,
          deductible_amount: 500,
          market_value: 42000,
          damage_severity_score: 7,
          time_to_report_days: 1,
          license_type_missing_flag: false,
          num_third_parties: 1,
          num_witnesses: 2,
          coverage_amount: 50000,
          customer_background: "Long-term customer with clean driving record",
          created_at: "2025-04-10T09:00:00Z"
        },
        {
          id: "2",
          ic_number: "IC98765432",
          plate_number: "XYZ9876",
          vehicle_make: "Honda Civic",
          vehicle_age_years: 2,
          claim_description: "Side mirror broken and door dented while parked at shopping mall. Appears to be hit-and-run incident.",
          repair_amount: 1200,
          approval_flag: false,
          claim_reported_to_police_flag: false,
          policy_expired_flag: false,
          at_fault_flag: false,
          age: 28,
          months_as_customer: 14,
          deductible_amount: 300,
          market_value: 32000,
          damage_severity_score: 4,
          time_to_report_days: 3,
          license_type_missing_flag: false,
          num_third_parties: 0,
          num_witnesses: 0,
          coverage_amount: 35000,
          customer_background: "No previous claims history",
          created_at: "2025-05-02T14:30:00Z"
        },
        {
          id: "3",
          ic_number: "IC45678901",
          plate_number: "DEF4567",
          vehicle_make: "BMW 3 Series",
          vehicle_age_years: 1,
          claim_description: "Windshield cracked due to falling tree branch during heavy storm. Need full replacement of front windshield.",
          repair_amount: 2800,
          approval_flag: true,
          claim_reported_to_police_flag: false,
          policy_expired_flag: false,
          at_fault_flag: false,
          age: 45,
          months_as_customer: 36,
          deductible_amount: 1000,
          market_value: 85000,
          damage_severity_score: 5,
          time_to_report_days: 1,
          license_type_missing_flag: false,
          num_third_parties: 0,
          num_witnesses: 0,
          coverage_amount: 100000,
          customer_background: "Premium policy holder with multiple vehicles insured",
          created_at: "2025-05-10T11:15:00Z"
        },
        {
          id: "4",
          ic_number: "IC56789012",
          plate_number: "GHI7890",
          vehicle_make: "Mercedes C-Class",
          vehicle_age_years: 3,
          claim_description: "Rear bumper and tail light damaged in parking lot collision. Other driver admitted fault and provided contact details.",
          repair_amount: 4200,
          approval_flag: false,
          claim_reported_to_police_flag: true,
          policy_expired_flag: true, // Policy expired
          at_fault_flag: false,
          age: 52,
          months_as_customer: 18,
          deductible_amount: 750,
          market_value: 65000,
          damage_severity_score: 6,
          time_to_report_days: 2,
          license_type_missing_flag: false,
          num_third_parties: 1,
          num_witnesses: 0,
          coverage_amount: 75000,
          customer_background: "Recently renewed policy after expiration",
          created_at: "2025-05-12T16:45:00Z"
        },
        {
          id: "5",
          ic_number: "IC34567890",
          plate_number: "JKL2345",
          vehicle_make: "Audi A4",
          vehicle_age_years: 4,
          claim_description: "Engine failure while driving on highway. Vehicle had to be towed to service center. Mechanical inspection shows major internal damage.",
          repair_amount: 8500,
          approval_flag: false,
          claim_reported_to_police_flag: false,
          policy_expired_flag: false,
          at_fault_flag: true, // At fault claim
          age: 33,
          months_as_customer: 24,
          deductible_amount: 1000,
          market_value: 60000,
          damage_severity_score: 9,
          time_to_report_days: 1,
          license_type_missing_flag: false,
          num_third_parties: 0,
          num_witnesses: 1,
          coverage_amount: 70000,
          customer_background: "Previous minor claims for cosmetic damage",
          created_at: "2025-05-15T08:20:00Z"
        }
      ];
      
      // Simple pagination
      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedClaims = dummyData.slice(startIndex, endIndex);
      
      return {
        count: dummyData.length,
        next: endIndex < dummyData.length ? `/claims?page=${page + 1}` : null,
        previous: page > 1 ? `/claims?page=${page - 1}` : null,
        results: paginatedClaims
      };
    } catch (error) {
      console.error('Error fetching dummy claims:', error);
      return this.fallbackToFastAPI(page);
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

  // Get claim by ID - now using dummy data
  getClaimById: async (id: number | string): Promise<Claim> => {
    try {
      // First, try to find in our dummy data
      const dummyClaims = (await this.getAllClaims()).results;
      const claim = dummyClaims.find(c => c.id.toString() === id.toString());
      
      if (claim) {
        return claim;
      }
      
      // If not found in dummy data, try FastAPI
      return this.fallbackGetClaimById(id);
    } catch (error) {
      console.error(`Error fetching claim #${id}:`, error);
      return this.fallbackGetClaimById(id);
    }
  },
  
  // Fallback function to create claim in FastAPI
  fallbackCreateClaim: async (claim: Omit<Claim, 'id'>): Promise<Claim> => {
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
  
  // Create a new claim - mock implementation
  createClaim: async (claim: Omit<Claim, 'id'>): Promise<Claim> => {
    try {
      console.log('Creating new claim:', claim);
      
      // Generate a random ID for the dummy claim
      const newId = Math.floor(Math.random() * 10000).toString();
      const newClaim = { 
        ...claim, 
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // In a real app, you'd insert into Supabase here
      console.log('Created new claim with ID:', newId);
      return newClaim;
    } catch (error) {
      console.error('Error creating claim:', error);
      return this.fallbackCreateClaim(claim);
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
