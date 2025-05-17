
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';

// Claim interface
export interface Claim {
  id: string;
  created_at?: string;
  plate_number: string;
  vehicle_make: string;
  vehicle_age_years: number;
  claim_description: string;
  repair_amount: number;
  approval_flag: boolean;
  claim_reported_to_police_flag: boolean;
  policy_expired_flag: boolean;
  at_fault_flag: boolean;
  rejection_reason?: string;
}

// Mock data for approved claims
const approvedClaimsMockData: Claim[] = [
  {
    id: "CL-2025-001",
    created_at: "2025-04-15T10:30:00Z",
    plate_number: "MYC1234",
    vehicle_make: "Toyota Camry",
    vehicle_age_years: 3,
    claim_description: "Side mirror damaged in parking lot. Another vehicle scraped against it while parked.",
    repair_amount: 750,
    approval_flag: true,
    claim_reported_to_police_flag: true,
    policy_expired_flag: false,
    at_fault_flag: false,
  },
  {
    id: "CL-2025-003",
    created_at: "2025-03-22T14:45:00Z",
    plate_number: "MYC3456",
    vehicle_make: "Honda Civic",
    vehicle_age_years: 2,
    claim_description: "Bumper damage from minor rear-end collision while waiting at traffic light.",
    repair_amount: 1200,
    approval_flag: true,
    claim_reported_to_police_flag: true,
    policy_expired_flag: false,
    at_fault_flag: false,
  },
  {
    id: "CL-2025-005",
    created_at: "2025-02-08T09:15:00Z",
    plate_number: "MYC5678",
    vehicle_make: "Perodua Myvi",
    vehicle_age_years: 1,
    claim_description: "Windshield cracked by debris from construction truck on highway.",
    repair_amount: 650,
    approval_flag: true,
    claim_reported_to_police_flag: false,
    policy_expired_flag: false,
    at_fault_flag: false,
  }
];

// Mock data for not approved claims
const notApprovedClaimsMockData: Claim[] = [
  {
    id: "CL-2025-002",
    created_at: "2025-04-02T15:20:00Z",
    plate_number: "MYC2345",
    vehicle_make: "BMW 3 Series",
    vehicle_age_years: 5,
    claim_description: "Engine issues after driving through flooded area during heavy rain.",
    repair_amount: 4500,
    approval_flag: false,
    claim_reported_to_police_flag: false,
    policy_expired_flag: false,
    at_fault_flag: true,
    rejection_reason: "Claim rejected due to driving in unsafe conditions (flooded area) which constitutes negligence."
  },
  {
    id: "CL-2025-004",
    created_at: "2025-03-05T11:30:00Z",
    plate_number: "MYC4567",
    vehicle_make: "Mercedes-Benz C-Class",
    vehicle_age_years: 4,
    claim_description: "Front bumper and headlight damage from collision in parking garage.",
    repair_amount: 3800,
    approval_flag: false,
    claim_reported_to_police_flag: false,
    policy_expired_flag: true,
    at_fault_flag: false,
    rejection_reason: "Claim rejected because the policy was expired at the time of incident."
  },
  {
    id: "CL-2025-006",
    created_at: "2025-01-15T16:45:00Z",
    plate_number: "MYC6789",
    vehicle_make: "Proton X50",
    vehicle_age_years: 2,
    claim_description: "Water damage to interior from leaving windows open during rain.",
    repair_amount: 2200,
    approval_flag: false,
    claim_reported_to_police_flag: false,
    policy_expired_flag: false,
    at_fault_flag: true,
    rejection_reason: "Claim rejected due to negligence (leaving windows open during rain)."
  }
];

// Combined mock data
const mockClaimsData: Claim[] = [...approvedClaimsMockData, ...notApprovedClaimsMockData];

// Claims service with Supabase integration and fallback to mock data
export const claimsService = {
  // Get all claims
  getAllClaims: async () => {
    try {
      // First try to fetch from Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('claims')
          .select('*');
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          return {
            results: data as Claim[],
            source: 'supabase'
          };
        }
      }
      
      // If Supabase failed or returned no data, use mock data
      return {
        results: mockClaimsData,
        source: 'mock'
      };
    } catch (error) {
      console.error("Error in getAllClaims:", error);
      // Always fallback to mock data on error
      return {
        results: mockClaimsData, 
        source: 'mock (fallback)'
      };
    }
  },
  
  // Get claim by ID
  getClaimById: async (claimId: string) => {
    if (!claimId) {
      throw new Error("Claim ID is required");
    }
    
    try {
      // First try to fetch from Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('claims')
          .select('*')
          .eq('id', claimId)
          .single();
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data) {
          return {
            result: data as Claim,
            source: 'supabase'
          };
        }
      }
      
      // If Supabase failed or returned no data, use mock data
      const mockClaim = mockClaimsData.find(claim => claim.id === claimId);
      
      if (!mockClaim) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      return {
        result: mockClaim,
        source: 'mock'
      };
    } catch (error) {
      console.error("Error in getClaimById:", error);
      
      // Try to find in mock data as fallback
      const mockClaim = mockClaimsData.find(claim => claim.id === claimId);
      
      if (!mockClaim) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      return {
        result: mockClaim,
        source: 'mock (fallback)'
      };
    }
  },
  
  // Create a new claim
  createClaim: async (claimData: Omit<Claim, 'id'>) => {
    try {
      // First try to create in Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('claims')
          .insert(claimData)
          .select();
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          return {
            result: data[0] as Claim,
            source: 'supabase'
          };
        }
      }
      
      // If Supabase failed, create mock claim
      const mockClaimId = `CL-${Math.floor(Math.random() * 9000) + 1000}`;
      const mockClaim: Claim = {
        id: mockClaimId,
        created_at: new Date().toISOString(),
        ...claimData
      };
      
      // In a real app, we would add this to our mock data array
      // mockClaimsData.push(mockClaim);
      
      return {
        result: mockClaim,
        source: 'mock'
      };
    } catch (error) {
      console.error("Error in createClaim:", error);
      
      // Create mock claim as fallback
      const mockClaimId = `CL-${Math.floor(Math.random() * 9000) + 1000}`;
      const mockClaim: Claim = {
        id: mockClaimId,
        created_at: new Date().toISOString(),
        ...claimData
      };
      
      return {
        result: mockClaim,
        source: 'mock (fallback)'
      };
    }
  },
  
  // Get chat responses specific to claims
  getClaimChatResponse: async (claimId: string, messageText: string) => {
    try {
      // Find the claim in our mock data first
      const claim = mockClaimsData.find(c => c.id === claimId);
      
      if (!claim) {
        return {
          message: "I don't have information about this claim. Please provide a valid claim ID.",
          source: 'mock'
        };
      }
      
      // Create responses based on claim status
      if (claim.approval_flag) {
        // For approved claims
        return {
          message: `Your claim ${claimId} for ${claim.vehicle_make} has been approved for RM ${claim.repair_amount}. Repairs can be done at any of our partner workshops. The claim was processed because you reported the incident promptly and all documentation was in order. Payment will be processed within 5 business days.`,
          source: 'mock'
        };
      } else {
        // For rejected claims
        return {
          message: claim.rejection_reason || 
                  `Your claim ${claimId} was not approved. ${claim.policy_expired_flag ? 
                  "Your policy had expired at the time of the incident." : 
                  claim.at_fault_flag ? 
                  "The incident was determined to be due to driver negligence." : 
                  "There were missing or incomplete documents provided."}`,
          source: 'mock'
        };
      }
    } catch (error) {
      console.error("Error in getClaimChatResponse:", error);
      return {
        message: "Sorry, I'm having trouble retrieving information about this claim right now. Please try again later.",
        source: 'error'
      };
    }
  }
};
