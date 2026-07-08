export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export interface Paginated<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface Opportunity extends Record<string, unknown> {
  id: string;
  title: string;
  organization: string | null;
  opportunityType: string | null;
  city: string | null;
  country: string | null;
  status: string;
  deadline: string | null;
  completenessScore: number;
  confidence: number;
  applicationUrl: string | null;
}

export interface SourceLink extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  url: string;
  city: string | null;
  country: string | null;
  enabled: boolean;
  priority: number;
  crawlStatus: string | null;
  lastCrawledAt: string | null;
}

export interface OpportunityRequirements {
  experienceLevel: string | null;
  ageRange: string | null;
  genderPresentation: string | null;
  languages: string[];
  certifications: string[];
  other: string[];
}

export interface OpportunityCompensation {
  isPaid: boolean | null;
  min: number | null;
  max: number | null;
  currency: string | null;
  raw: string | null;
}

export function parseJsonField<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

export interface OpportunityDetail extends Opportunity {
  sourceId: string;
  rawPageId: string | null;
  description: string;
  danceStyles: string[];
  locationText: string | null;
  requirements: unknown;
  compensation: unknown;
  contactEmail: string | null;
  contactPhone: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
  missingFields: string[];
  rawUrl: string;
  canonicalKey: string;
  extractedAt: string;
  updatedAt: string;
}

export interface Dancer extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string | null;
  city: string | null;
  country: string | null;
  skillLevel: string | null;
  yearsExperience: number | null;
  danceStyles: string[];
  isActive: boolean;
}

export interface DancerDetail extends Dancer {
  phone: string | null;
  preferredTypes: string[];
  travelRadiusKm: number | null;
  minCompensation: number | null;
  currency: string | null;
  portfolioUrls: string[];
  languages: string[];
  profileDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationOpportunity {
  id: string;
  title: string;
  organization: string | null;
  opportunityType: string | null;
  city: string | null;
  country: string | null;
  status: string;
  deadline: string | null;
}

export interface RecommendationDancer {
  id: string;
  fullName: string;
  email: string | null;
  city: string | null;
  country: string | null;
  skillLevel: string | null;
}

export interface Recommendation extends Record<string, unknown> {
  id: string;
  opportunityId: string;
  dancerId: string;
  finalScore: number;
  styleScore: number | null;
  locationScore: number | null;
  typeScore: number | null;
  availabilityScore: number | null;
  experienceScore: number | null;
  compensationScore: number | null;
  reason: string | null;
  risks: string[];
  suggestedMessage: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  opportunity: RecommendationOpportunity;
  dancer?: RecommendationDancer;
}

export interface SourceLinkDetail extends SourceLink {
  sourceCode: string;
  contactType: string | null;
  fit: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

async function getList<T>(
  path: string,
  page: number,
  itemsPerPage: number,
): Promise<Paginated<T>> {
  const url = `${API_BASE_URL}/${path}?page=${page}&itemsPerPage=${itemsPerPage}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return res.json() as Promise<Paginated<T>>;
}

async function getById<T>(path: string, id: string): Promise<T | null> {
  const res = await fetch(`${API_BASE_URL}/${path}/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const text = await res.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

export function fetchOpportunities(page: number, itemsPerPage: number) {
  return getList<Opportunity>("opportunity", page, itemsPerPage);
}

export function fetchSourceLinks(page: number, itemsPerPage: number) {
  return getList<SourceLink>("source-links", page, itemsPerPage);
}

export function fetchOpportunityById(id: string) {
  return getById<OpportunityDetail>("opportunity", id);
}

export function fetchSourceLinkById(id: string) {
  return getById<SourceLinkDetail>("source-links", id);
}

export function fetchDancers(page: number, itemsPerPage: number) {
  return getList<Dancer>("dancer", page, itemsPerPage);
}

export function fetchDancerById(id: string) {
  return getById<DancerDetail>("dancer", id);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchDancerRecommendations(id: string) {
  return getJson<Recommendation[]>(`dancer/${id}/recommendations`);
}

export function fetchRecommendations(page: number, itemsPerPage: number) {
  return getList<Recommendation>("recommendations", page, itemsPerPage);
}

export function fetchRecommendationById(id: string) {
  return getById<Recommendation>("recommendations", id);
}

export async function fetchDraftEmail(recommendationId: string): Promise<string> {
  const res = await fetch(
    `${API_BASE_URL}/recommendations/${recommendationId}/draft-email`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return res.text();
}
