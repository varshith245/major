import { 
  Scheme, 
  AuthResponse, 
  ComparisonResult, 
  DocumentChecklistResult 
} from './types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('egov_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('egov_auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('egov_auth_token');
  localStorage.removeItem('egov_user');
}

export async function fetchSchemes(): Promise<Scheme[]> {
  const token = getAuthToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE_URL}/schemes`, { headers });
  if (!res.ok) throw new Error('Failed to fetch schemes');
  const data = await res.json();
  
  // Normalize backend schema to Scheme interface
  return (data || []).map((s: any) => ({
    id: s.scheme_id || s.id,
    scheme_code: s.short_name || s.scheme_code || s.scheme_id,
    name: s.scheme_name || s.name,
    department: s.ministry || s.department || 'Government Department',
    category: s.category || 'General',
    level: s.level || (s.scheme_id?.startsWith('KA') ? 'Karnataka' : 'Central'),
    target_audience: s.state || 'Citizen',
    description: s.description || '',
    benefits: s.key_benefits || s.benefits || `Financial assistance: ₹${Number(s.benefit_amount || 0).toLocaleString()}`,
    eligibility_criteria: typeof s.eligibility_criteria === 'string' ? s.eligibility_criteria : 'Official criteria verified',
    required_documents: s.required_documents || ['Aadhaar Card', 'Bank Passbook', 'Income Certificate'],
    portal_url: s.application_link || s.portal_url || 'https://www.india.gov.in',
    helpline: s.grievance_contact || s.helpline || '1800-11-0001',
    is_active: true
  }));
}

export async function fetchSchemeById(id: string): Promise<Scheme> {
  const token = getAuthToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE_URL}/schemes/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch scheme details');
  const s = await res.json();
  return {
    id: s.scheme_id || s.id,
    scheme_code: s.short_name || s.scheme_code || s.scheme_id,
    name: s.scheme_name || s.name,
    department: s.ministry || s.department || 'Government Department',
    category: s.category || 'General',
    level: s.level || (s.scheme_id?.startsWith('KA') ? 'Karnataka' : 'Central'),
    target_audience: s.state || 'Citizen',
    description: s.description || '',
    benefits: s.key_benefits || s.benefits || `Financial assistance: ₹${Number(s.benefit_amount || 0).toLocaleString()}`,
    eligibility_criteria: typeof s.eligibility_criteria === 'string' ? s.eligibility_criteria : 'Official criteria verified',
    required_documents: s.required_documents || ['Aadhaar Card', 'Bank Passbook'],
    portal_url: s.application_link || s.portal_url || 'https://www.india.gov.in',
    helpline: s.grievance_contact || s.helpline || '1800-11-0001',
    is_active: true
  };
}

export async function searchSchemes(query: string, category?: string): Promise<Scheme[]> {
  const schemes = await fetchSchemes();
  return schemes.filter(s => {
    const matchQ = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
    const matchC = !category || category === 'All' || s.category.toLowerCase().includes(category.toLowerCase());
    return matchQ && matchC;
  });
}

export async function sendChatMessageApi(
  message: string, 
  language: string = 'en', 
  conversationHistory: { role: string; content: string }[] = []
): Promise<any> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: message,
      message,
      language
    })
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to send message' }));
    throw new Error(err.detail || 'Failed to send AI chat query');
  }
  
  const data = await res.json();
  return {
    response: data.response_text || data.response || data.answer,
    matched_schemes: (data.matched_schemes || []).map((s: any) => ({
      id: s.scheme_id,
      scheme_code: s.short_name || s.scheme_id,
      name: s.scheme_name,
      department: s.ministry || s.category || 'Government',
      category: s.category,
      level: s.level || 'Central',
      target_audience: 'Citizen',
      description: s.description || s.key_benefits,
      benefits: s.key_benefits,
      eligibility_criteria: 'Criteria matched',
      required_documents: s.required_documents || ['Aadhaar Card'],
      portal_url: s.application_link || 'https://www.india.gov.in',
      helpline: '1800-11-0001',
      is_active: true
    })),
    suggested_actions: data.suggested_actions || ['PM-KISAN benefits', 'Karnataka Yuva Nidhi', 'Check Eligibility']
  };
}

export async function checkEligibilityApi(profile: Record<string, any>): Promise<any> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const formattedProfile = {
    age: Number(profile.age) || 30,
    gender: profile.gender === 'All' ? 'Any' : (profile.gender || 'Any'),
    state: profile.state || 'Karnataka',
    occupation: profile.occupation || 'Farmer',
    annual_income: Number(profile.annual_income) || 150000.0,
    owns_land: Boolean(Number(profile.land_holding_acres || profile.landholding_acres) > 0),
    landholding_acres: Number(profile.land_holding_acres || profile.landholding_acres) || 0.0,
    caste_category: profile.caste_category || 'General',
    is_govt_employee: Boolean(profile.is_govt_employee),
    is_income_tax_payer: Boolean(profile.is_income_tax_payer),
    owns_pucca_house: Boolean(profile.owns_pucca_house),
    is_bpl_cardholder: Boolean(profile.is_bpl_cardholder),
    is_head_of_family: profile.is_head_of_family !== undefined ? Boolean(profile.is_head_of_family) : true,
    education_qualification: profile.is_student ? 'Graduate' : (profile.education_qualification || 'None'),
    graduation_year: profile.graduation_year || null,
    is_employed: profile.is_employed !== undefined ? Boolean(profile.is_employed) : !profile.is_student
  };

  const res = await fetch(`${API_BASE_URL}/eligibility/evaluate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(formattedProfile)
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Eligibility evaluation failed' }));
    throw new Error(err.detail || 'Eligibility evaluation failed');
  }
  return res.json();
}

export async function simulateEligibilityApi(baseProfile: Record<string, any>, modifiedFields: Record<string, any>): Promise<any> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const formattedBase = {
    age: Number(baseProfile.age) || 30,
    gender: baseProfile.gender === 'All' ? 'Any' : (baseProfile.gender || 'Any'),
    state: baseProfile.state || 'Karnataka',
    occupation: baseProfile.occupation || 'Farmer',
    annual_income: Number(baseProfile.annual_income) || 150000.0,
    owns_land: Boolean(Number(baseProfile.land_holding_acres || baseProfile.landholding_acres) > 0),
    landholding_acres: Number(baseProfile.land_holding_acres || baseProfile.landholding_acres) || 0.0,
    caste_category: baseProfile.caste_category || 'General',
    is_govt_employee: Boolean(baseProfile.is_govt_employee),
    is_income_tax_payer: Boolean(baseProfile.is_income_tax_payer),
    owns_pucca_house: Boolean(baseProfile.owns_pucca_house),
    is_bpl_cardholder: Boolean(baseProfile.is_bpl_cardholder),
    is_head_of_family: true,
    education_qualification: 'None',
    is_employed: true
  };

  const res = await fetch(`${API_BASE_URL}/eligibility/simulate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_profile: formattedBase,
      modified_fields: modifiedFields
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Simulation failed' }));
    throw new Error(err.detail || 'Eligibility simulation failed');
  }
  return res.json();
}

export async function checkSpecificSchemeEligibilityApi(schemeId: string, profile: Record<string, any>): Promise<any> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const formattedProfile = {
    age: Number(profile.age) || 30,
    gender: profile.gender === 'All' ? 'Any' : (profile.gender || 'Any'),
    state: profile.state || 'Karnataka',
    occupation: profile.occupation || 'Farmer',
    annual_income: Number(profile.annual_income) || 150000.0,
    owns_land: Boolean(Number(profile.land_holding_acres || profile.landholding_acres) > 0),
    landholding_acres: Number(profile.land_holding_acres || profile.landholding_acres) || 0.0,
    caste_category: profile.caste_category || 'General',
    is_govt_employee: Boolean(profile.is_govt_employee),
    is_income_tax_payer: Boolean(profile.is_income_tax_payer),
    owns_pucca_house: Boolean(profile.owns_pucca_house),
    is_bpl_cardholder: Boolean(profile.is_bpl_cardholder),
    is_head_of_family: true,
    education_qualification: profile.is_student ? 'Graduate' : 'None',
    is_employed: !profile.is_student
  };

  const res = await fetch(`${API_BASE_URL}/eligibility/check-scheme/${schemeId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(formattedProfile)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Scheme check failed' }));
    throw new Error(err.detail || 'Specific scheme check failed');
  }
  return res.json();
}

export async function compareSchemesApi(
  schemeIdsOrId1: string | string[], 
  schemeId2?: string, 
  language: string = 'en'
): Promise<any> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const scheme_ids = Array.isArray(schemeIdsOrId1) 
    ? schemeIdsOrId1 
    : [schemeIdsOrId1, schemeId2].filter(Boolean) as string[];

  const res = await fetch(`${API_BASE_URL}/comparison/compare`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ scheme_ids })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Comparison failed' }));
    throw new Error(err.detail || 'Scheme comparison failed');
  }

  const data = await res.json();
  const schemesList: Scheme[] = (data.schemes || []).map((s: any) => ({
    id: s.scheme_id,
    scheme_code: s.short_name || s.scheme_id,
    name: s.scheme_name,
    department: s.ministry || 'Government Ministry',
    category: s.category || 'General',
    level: s.level || (s.scheme_id?.startsWith('KA') ? 'Karnataka' : 'Central'),
    target_audience: s.state || 'Citizen',
    description: s.description || '',
    benefits: s.key_benefits || (s.benefit_amount > 0 ? `₹${s.benefit_amount.toLocaleString()}` : 'Subsidy / Welfare'),
    eligibility_criteria: typeof s.eligibility_criteria === 'string' ? s.eligibility_criteria : 'Verified eligibility rules',
    required_documents: s.required_documents || ['Aadhaar Card'],
    portal_url: s.application_link || 'https://www.india.gov.in',
    helpline: s.grievance_contact || '1800-11-0001',
    is_active: true
  }));

  return {
    schemes: schemesList,
    comparison_fields: data.comparison_fields || {},
    comparison_table: [
      { criteria: 'Scheme Short Code', values: schemesList.map(s => s.scheme_code) },
      { criteria: 'Ministry / Department', values: schemesList.map(s => s.department) },
      { criteria: 'Government Level', values: schemesList.map(s => s.level) },
      { criteria: 'Category / Sector', values: schemesList.map(s => s.category) },
      { criteria: 'Financial Payout / Subsidy', values: schemesList.map(s => s.benefits) },
      { criteria: 'Eligibility Overview', values: schemesList.map(s => s.description) },
      { criteria: 'Mandatory Documents', values: schemesList.map(s => s.required_documents.slice(0, 3).join(', ')) },
      { criteria: 'Helpline / Contact', values: schemesList.map(s => s.helpline) }
    ],
    verdict: `${schemesList.length} schemes compared across financial benefits, eligibility conditions, and application procedures.`
  };
}

export async function fetchDocumentChecklistApi(schemeId: string, language: string = 'en'): Promise<DocumentChecklistResult> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  
  const res = await fetch(`${API_BASE_URL}/checklist/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      scheme_id: schemeId
    })
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate checklist' }));
    throw new Error(err.detail || 'Failed to fetch document checklist');
  }
  
  const data = await res.json();
  
  return {
    scheme: {
      id: data.scheme_id,
      scheme_code: data.scheme_name,
      name: data.scheme_name,
      department: 'Government Department',
      category: 'Welfare',
      level: 'Central',
      target_audience: 'Citizen',
      description: 'Official document requirements for application.',
      benefits: 'Welfare benefits',
      eligibility_criteria: 'Verified',
      required_documents: (data.mandatory_documents || []).map((d: any) => d.document_name || d.name || String(d)),
      portal_url: 'https://www.india.gov.in',
      helpline: '1800-11-0001',
      is_active: true
    },
    mandatory_documents: (data.mandatory_documents || []).map((d: any) => ({
      name: d.document_name || d.name || String(d),
      description: d.purpose || d.description || 'Mandatory identity and proof document.',
      issuing_authority: d.issuing_authority || 'UIDAI / Revenue Department',
      validity_period: d.validity_period || 'Valid'
    })),
    optional_documents: data.optional_documents || [],
    application_steps: data.application_steps || [
      'Prepare mandatory documents with self-attested photocopies.',
      'Link your Aadhaar with your active bank account for DBT credits.',
      'Submit application online or visit your local Seva Kendra (CSC / Grama One).'
    ]
  };
}

export async function sendOtpApi(identifier: string, purpose: 'login' | 'register' = 'login'): Promise<{ message: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, purpose })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to send OTP' }));
    throw new Error(errorData.detail || 'Failed to send OTP');
  }
  return res.json();
}

export async function verifyOtpApi(identifier: string, otp_code: string, purpose: 'login' | 'register' = 'login'): Promise<{ verified: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp_code, purpose })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to verify OTP' }));
    throw new Error(errorData.detail || 'Failed to verify OTP');
  }
  return res.json();
}

export async function loginWithOtpApi(identifier: string, otp_code: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/otp/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp_code })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to login with OTP' }));
    throw new Error(errorData.detail || 'Failed to login with OTP');
  }
  return res.json();
}

export async function registerWithOtpApi(
  identifier: string,
  password: string,
  full_name: string,
  otp_code: string,
  phone?: string,
  role: 'user' | 'admin' = 'user'
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/otp/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: identifier,
      password,
      full_name,
      otp_code,
      phone,
      role
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Registration failed');
  }
  return res.json();
}
