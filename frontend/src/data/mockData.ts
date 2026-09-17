import { ApplicationRecord } from '../types';

export interface CategoryInfo {
  id: string;
  title: string;
  iconName: string;
  description: string;
  schemeCount: number;
}

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: 'Agriculture & Rural',
    title: 'Agriculture & Rural',
    iconName: 'Tractor',
    description: 'Income support, crop insurance, credit lines, and subsidies for cultivators and farm labor.',
    schemeCount: 6
  },
  {
    id: 'Healthcare & Insurance',
    title: 'Healthcare & Wellness',
    iconName: 'HeartPulse',
    description: 'Free hospitalization cover, critical illness aid, and social health insurance for families.',
    schemeCount: 5
  },
  {
    id: 'Housing & Urban Development',
    title: 'Housing & Shelter',
    iconName: 'Home',
    description: 'Subsidies and financial assistance for pucca house construction in rural and urban areas.',
    schemeCount: 3
  },
  {
    id: 'Education & Youth',
    title: 'Education & Youth',
    iconName: 'GraduationCap',
    description: 'Higher education scholarships, monthly unemployment allowances, and skill stipends.',
    schemeCount: 4
  },
  {
    id: 'Women & Child Welfare',
    title: 'Women & Child',
    iconName: 'UserCheck',
    description: 'Direct cash transfers, maternity benefits, and savings plans for the girl child.',
    schemeCount: 4
  },
  {
    id: 'Senior Citizens & Pension',
    title: 'Senior Citizens',
    iconName: 'Clock',
    description: 'Monthly old age pensions, assistive living devices, and guaranteed retirement annuities.',
    schemeCount: 3
  },
  {
    id: 'Business & Entrepreneurship',
    title: 'Business & Loans',
    iconName: 'Briefcase',
    description: 'Collateral-free enterprise credit, micro-credit for vendors, and artisan toolkit grants.',
    schemeCount: 4
  },
  {
    id: 'Social Welfare & Empowerment',
    title: 'Social Welfare',
    iconName: 'ShieldCheck',
    description: 'Food security grain allocations, free public bus transit, and targeted minority support.',
    schemeCount: 3
  }
];

export const POPULAR_SEARCHES = [
  'Farmer schemes',
  'Student scholarships',
  'Health insurance',
  'Pucca housing aid',
  'Senior citizen pension',
  'Women empowerment grant',
  'Mudra loan'
];

export const CITIZEN_STORIES = [
  {
    id: 'farmer',
    role: 'Smallholder Farmer',
    location: 'Mandya, Karnataka',
    scenario: 'Owns 2.5 acres of agricultural land, seeking crop loss security and annual income support.',
    schemesMatched: ['PM-KISAN', 'PMFBY', 'KCC'],
    benefitSummary: '₹6,000/yr direct support + subsidized crop loan at 4%'
  },
  {
    id: 'student',
    role: 'College Graduate',
    location: 'Belagavi, Karnataka',
    scenario: 'Completed graduation in 2024, currently seeking job opportunities and skill development.',
    schemesMatched: ['YUVA-NIDHI', 'NAPS', 'CSSS'],
    benefitSummary: '₹3,000/month financial aid for up to 24 months + apprentice stipend'
  },
  {
    id: 'woman-head',
    role: 'Homemaker & Family Head',
    location: 'Mysuru, Karnataka',
    scenario: 'Woman head of household with BPL card, seeking household financial independence.',
    schemesMatched: ['GRUHA-LAKSHMI', 'GRUHA-JYOTHI', 'SHAKTI-SCHEME'],
    benefitSummary: '₹2,000/mo cash transfer + zero-cost electricity up to 200 units'
  },
  {
    id: 'senior-citizen',
    role: 'Elderly Citizen',
    location: 'Dharwad, Karnataka',
    scenario: 'Age 67 with no formal pension or regular family income support.',
    schemesMatched: ['IGNOAPS', 'AB-PMJAY', 'RVY'],
    benefitSummary: 'Monthly direct pension + ₹5 Lakh annual cashless healthcare'
  }
];

export const INITIAL_APPLICATION_HISTORY: ApplicationRecord[] = [
  {
    id: 'APP-2026-8812',
    scheme_id: 'GOI-AGRI-001',
    scheme_name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Agriculture & Rural',
    status: 'Approved',
    submission_date: '12 Jan 2026',
    last_updated: '02 Feb 2026',
    reference_no: 'PMKISAN-KA-992182',
    portal_url: 'https://pmkisan.gov.in'
  },
  {
    id: 'APP-2026-9041',
    scheme_id: 'GOI-HLTH-002',
    scheme_name: 'Ayushman Bharat (AB-PMJAY)',
    category: 'Healthcare & Insurance',
    status: 'Under Review',
    submission_date: '18 Feb 2026',
    last_updated: '28 Feb 2026',
    reference_no: 'PMJAY-EKYC-40912',
    portal_url: 'https://pmjay.gov.in'
  },
  {
    id: 'APP-2026-9210',
    scheme_id: 'KAR-GUAR-001',
    scheme_name: 'Gruha Lakshmi Scheme',
    category: 'Women & Child Welfare',
    status: 'Submitted',
    submission_date: '01 Mar 2026',
    last_updated: '01 Mar 2026',
    reference_no: 'SEVA-GL-2026-0914',
    portal_url: 'https://sevasindhu.karnataka.gov.in'
  }
];
