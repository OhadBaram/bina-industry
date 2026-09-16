import type { LeadInput, LeadAnalysis } from './leadConfig';

const LEADS_KEY = 'b2b_leads_history';

export interface StoredLead {
  id: string;
  lead: LeadInput;
  analysis: LeadAnalysis;
  receivedAt: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadStoredLeads(): StoredLead[] {
  return readJson<StoredLead[]>(LEADS_KEY, []);
}

export function appendStoredLead(lead: LeadInput, analysis: LeadAnalysis): StoredLead {
  const entry: StoredLead = {
    id: `lead_${Date.now()}`,
    lead,
    analysis,
    receivedAt: lead.created_at || new Date().toISOString(),
  };
  const existing = loadStoredLeads();
  const updated = [entry, ...existing].slice(0, 200);
  localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
  return entry;
}
