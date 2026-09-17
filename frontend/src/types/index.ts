export type Language = 'en' | 'hi' | 'kn';

export interface EligibilityCriteria {
  min_age: number;
  max_age: number;
  gender: 'Male' | 'Female' | 'Transgender' | 'Any';
  occupation: string[];
  max_annual_income?: number;
  landholding_required?: boolean;
  landholding_max_acres?: number;
  caste_category?: string[];
  target_group?: string;
  exclusions?: string[];
}

export interface Scheme {
  id?: string;
  scheme_id: string;
  scheme_name: string;
  short_name: string;
  ministry: string;
  level: 'Central' | 'State' | string;
  state: string; // 'All-India' | 'Karnataka' etc.
  category: string;
  description: string;
  key_benefits: string;
  benefit_amount: number;
  eligibility_criteria: EligibilityCriteria;
  required_documents: string[];
  optional_documents: string[];
  application_link: string;
  offline_process?: string;
  grievance_contact?: string;
  processing_time_days: number;
  tags: string[];
  match_score?: number;
  match_reasons?: string[];
}

export interface UserProfile {
  age: number;
  gender: 'Male' | 'Female' | 'Transgender' | 'Other' | 'Any';
  state: string;
  occupation: string;
  annual_income: number;
  owns_land: boolean;
  landholding_acres?: number;
  caste_category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  is_govt_employee: boolean;
  is_income_tax_payer: boolean;
  owns_pucca_house: boolean;
  is_bpl_cardholder?: boolean;
  is_head_of_family?: boolean;
  education_qualification?: string;
  graduation_year?: number;
  is_employed?: boolean;
}

export interface EligibilityResult {
  scheme_id: string;
  scheme_name: string;
  short_name: string;
  category: string;
  benefit_amount: number;
  eligibility_status: 'Likely Eligible' | 'Conditionally Eligible' | 'Not Eligible';
  confidence_score: number; // 0.0 to 1.0
  is_eligible: boolean;
  reasons: string[];
  missing_criteria: string[];
  required_documents: string[];
  application_link: string;
  offline_process?: string;
}

export interface EligibilityEvaluationResponse {
  total_evaluated: number;
  eligible_count: number;
  results: EligibilityResult[];
}

export interface SimulationResponse {
  original_eligible_count: number;
  simulated_eligible_count: number;
  difference: number;
  newly_eligible_schemes: string[];
  newly_ineligible_schemes: string[];
  results: EligibilityResult[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  detected_language?: string;
  intent?: string;
  matched_schemes?: Scheme[];
  eligibility_results?: EligibilityResult[];
  suggested_actions?: string[];
  audio_url?: string;
}

export interface DocumentChecklistResponse {
  scheme_id: string;
  scheme_name: string;
  mandatory_documents: string[];
  optional_documents: string[];
  step_by_step_process: string[];
  estimated_processing_days: number;
  official_portal: string;
  helpline: string;
}

export interface DocumentVerificationCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface DocumentVerificationResult {
  success: boolean;
  verified: boolean;
  document_type: string;
  original_filename: string;
  file_id?: string;
  file_url?: string;
  readiness_score: number;
  legibility_status: 'High' | 'Medium' | 'Low' | string;
  mime_type: string;
  file_size_kb: number;
  checks: DocumentVerificationCheck[];
  extracted_info: Record<string, string>;
  message: string;
  recommendations: string[];
}

export interface UserDocument {
  file_id: string;
  user_id?: string;
  filename: string;
  content_type: string;
  document_type: string;
  scheme_id?: string;
  file_size_bytes: number;
  verification_status: string;
  created_at: string;
  download_url: string;
}

export interface DocumentUploadResult {
  success: boolean;
  message: string;
  file_id?: string;
  file_url?: string;
  document_type: string;
  user_id?: string;
  file_size_bytes?: number;
  verification_status?: string;
}


export interface ComparisonResponse {
  schemes: Scheme[];
  comparison_fields: {
    names: string[];
    short_names: string[];
    ministries: string[];
    levels: string[];
    categories: string[];
    benefit_amounts: string[];
    key_benefits: string[];
    age_criteria: string[];
    income_limits: string[];
    landholding_rules: string[];
    required_documents: string[];
    processing_times: string[];
    application_portals: string[];
  };
}

export interface User {
  id?: string;
  user_id?: string;
  email: string;
  full_name: string;
  phone?: string;
  phone_number?: string;
  role: 'user' | 'admin';
  is_active?: boolean;
  user_profile?: UserProfile;
  created_at?: string;
}

export interface AdminUserListResponse {
  total: number;
  users: User[];
}

export interface AdminStatsResponse {
  total_registered_users: number;
  admins_count: number;
  citizens_count: number;
  uploaded_documents_in_atlas: number;
  auth_security: string;
  admin_requester: string;
}

export interface AdminUserActionResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  expires_in_minutes?: number;
}

export interface ApplicationRecord {
  id: string;
  user_id?: string;
  scheme_id: string;
  scheme_name: string;
  category: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | string;
  current_stage?: string;
  stage_order?: number;
  submission_date: string;
  last_updated: string;
  reference_no: string;
  portal_url: string;
  notes?: string;
}

export type ChecklistResponse = DocumentChecklistResponse;

export interface ApplicationJourney {
  scheme_id: string;
  scheme_name: string;
  current_stage: string;
  stage_order: number;
}
export type JourneyEntry = ApplicationJourney;

export interface Notification {
  id?: string;
  user_id?: string;
  title?: string;
  message: string;
  type?: 'STATUS_UPDATE' | 'DOCUMENT_REQUEST' | 'BENEFIT_SANCTION' | 'SYSTEM' | string;
  scheme_id?: string;
  scheme_name?: string;
  application_id?: string;
  reference_no?: string;
  channels_dispatched?: string[];
  is_read?: boolean;
  action_url?: string;
  created_at?: string;
  metadata?: Record<string, any>;
}
export type NotificationItem = Notification;
export type AppNotification = Notification;

export interface NotificationUnreadCountResponse {
  unread_count: number;
}

export interface NotificationMarkReadResponse {
  success: boolean;
  message: string;
  updated_count?: number;
}

export interface ChatResponse {
  query: string;
  detected_language: string;
  intent: string;
  confidence: number;
  answer: string;
  audio_url?: string;
  matched_schemes: Scheme[];
  eligibility_results?: EligibilityResult[];
  suggested_actions: string[];
}

