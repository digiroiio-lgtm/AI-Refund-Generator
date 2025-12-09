export type EligibilityRegulation = 'EU261 (demo)';

export interface CheckFlightRequest {
  flightNumber: string;
  flightDate: string; // ISO date string
}

export interface CheckFlightResponse {
  scanId: string;
  flightNumber: string;
  flightDate: string;
  eligible: boolean;
  compensationAmount: number;
  regulation: EligibilityRegulation;
  confidence: number;
  delayMinutes: number;
}

export interface CheckoutSessionRequest {
  scanId: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface GenerateLetterRequest {
  scanId: string;
  passengerName: string;
  passengerEmail: string;
}

export interface GenerateLetterResponse {
  claimLetter: string;
}

export interface PurchaseDetailResponse {
  purchaseId: string;
  status: 'pending' | 'paid';
  stripeSessionId: string;
  customerEmail?: string;
  scan: {
    id: string;
    flightNumber: string;
    flightDate: string;
    eligible: boolean;
    compensationAmount: number;
    regulation: string;
    confidence: number;
  };
  claimLetter?: string;
}
