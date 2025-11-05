#FEC_API_KEY = 'https://api.open.fec.gov/v1/candidates/?api_key=ztW2L6EKQzi2W3DT0uAvdobO8L6Ytvcxv4G6RJhx&page=1'


#FEC_API_KEY = 'ztW2L6EKQzi2W3DT0uAvdobO8L6Ytvcxv4G6RJhx'

#FEC_API_DEMO_KEY = 'https://api.open.fec.gov/v1/candidates/?api_key=DEMO_KEY'


npm install axios
# or
npm install @tanstack/react-query  # optional, for data caching


2. Type Definitions
Create a types file for FEC API responses:

// types/fec.ts

export interface FECCandidate {
  candidate_id: string;
  name: string;
  party: string;
  office: string;
  state: string;
  district?: string;
  cycles: number[];
  candidate_status: string;
  incumbent_challenge?: string;
}

export interface FECCommittee {
  committee_id: string;
  name: string;
  designation: string;
  type: string;
  party?: string;
  state?: string;
}

export interface FECContribution {
  committee_id: string;
  contributor_name: string;
  contributor_city?: string;
  contributor_state?: string;
  contributor_zip?: string;
  contribution_receipt_amount: number;
  contribution_receipt_date: string;
}

export interface FECApiResponse<T> {
  api_version: string;
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
  results: T[];
}

export interface FECErrorResponse {
  error: {
    message: string;
    code: string;
  };
}


3. API Service Layer
Create a centralized service for FEC API calls

// lib/fec-api.ts

import axios, { AxiosError } from 'axios';
import type { FECApiResponse, FECCandidate, FECCommittee, FECContribution } from '@/types/fec';

const FEC_API_BASE_URL = 'https://api.open.fec.gov/v1';
const API_KEY = process.env.FEC_API_KEY;

if (!API_KEY) {
  throw new Error('FEC_API_KEY environment variable is not set');
}

const fecClient = axios.create({
  baseURL: FEC_API_BASE_URL,
  params: {api_key: API_KEY,},
  timeout: 10000,
});

export class FECApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FECApiError';
  }
}

// Candidates
export async function getCandidates(params?: {
  name?: string;
  office?: string;
  state?: string;
  cycle?: number;
  page?: number;
  per_page?: number;
}): Promise<FECApiResponse<FECCandidate>> {
  try {
    const response = await fecClient.get<FECApiResponse<FECCandidate>>('/candidates/', {
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new FECApiError(
        error.response?.data?.error?.message || error.message,
        error.response?.status,
        error
      );
    }
    throw new FECApiError('Unknown error occurred', undefined, error);
  }
}

// Single Candidate
export async function getCandidateById(candidateId: string): Promise<FECCandidate> {
  try {
    const response = await fecClient.get<FECApiResponse<FECCandidate>>(
      `/candidate/${candidateId}/`
    );
    return response.data.results[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new FECApiError(
        error.response?.data?.error?.message || error.message,
        error.response?.status,
        error
      );
    }
    throw new FECApiError('Unknown error occurred', undefined, error);
  }
}

// Committees
export async function getCommittees(params?: {
  committee_type?: string;
  designation?: string;
  state?: string;
  page?: number;
  per_page?: number;
}): Promise<FECApiResponse<FECCommittee>> {
  try {
    const response = await fecClient.get<FECApiResponse<FECCommittee>>('/committees/', {
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new FECApiError(
        error.response?.data?.error?.message || error.message,
        error.response?.status,
        error
      );
    }
    throw new FECApiError('Unknown error occurred', undefined, error);
  }
}

// Contributions by Committee
export async function getContributions(
  committeeId: string,
  params?: {
    min_date?: string;
    max_date?: string;
    min_amount?: number;
    max_amount?: number;
    page?: number;
    per_page?: number;
  }
): Promise<FECApiResponse<FECContribution>> {
  try {
    const response = await fecClient.get<FECApiResponse<FECContribution>>(
      `/committee/${committeeId}/schedules/schedule_a/`,
      { params }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new FECApiError(
        error.response?.data?.error?.message || error.message,
        error.response?.status,
        error
      );
    }
    throw new FECApiError('Unknown error occurred', undefined, error);
  }
}
```

## 4. Environment Variables

Create a `.env.local` file:
```
FEC_API_KEY=your_api_key_here



Register for an API key at: https://api.open.fec.gov/developers/
5. Server-Side Data Fetching (App Router)
Using Server Components (Recommended for App Router):


// app/candidates/page.tsx

import { Suspense } from 'react';
import CandidateList from '@/components/CandidateList';
import CandidateFilters from '@/components/CandidateFilters';

interface PageProps {
  searchParams: {
    office?: string;
    state?: string;
    page?: string;
  };
}

export default function CandidatesPage({ searchParams }: PageProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">FEC Candidates</h1>
      
      <CandidateFilters />
      
      <Suspense fallback={<CandidateListSkeleton />}>
        <CandidateList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function CandidateListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border p-4 rounded">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}


****Option 1: Using Suspense with Separate Data Component

6. 1st Option // components/CandidateList.tsx

import { getCandidates } from '@/lib/fec-api';

interface CandidateListProps {
  searchParams: {
    office?: string;
    state?: string;
    page?: string;
  };
}

export default async function CandidateList({ searchParams }: CandidateListProps) {
  const page = Number(searchParams.page) || 1;
  
  const data = await getCandidates({
    office: searchParams.office,
    state: searchParams.state,
    page,
    per_page: 20,
  });

  return (
    <>
      <div className="grid gap-4">
        {data.results.map((candidate) => (
          <div key={candidate.candidate_id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{candidate.name}</h2>
            <p>Party: {candidate.party}</p>
            <p>Office: {candidate.office}</p>
            <p>State: {candidate.state}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p>
          Page {data.pagination.page} of {data.pagination.pages}
        </p>
      </div>
    </>
  );
}



***Option 2: Multiple Suspense Boundaries for Parallel Loading
6. 2nd Option  // app/candidates/[id]/page.tsx

import { Suspense } from 'react';
import { getCandidateById, getContributions } from '@/lib/fec-api';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CandidateDetailPage({ params }: PageProps) {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<CandidateInfoSkeleton />}>
        <CandidateInfo candidateId={params.id} />
      </Suspense>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Contributions</h2>
        <Suspense fallback={<ContributionsSkeleton />}>
          <CandidateContributions candidateId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function CandidateInfo({ candidateId }: { candidateId: string }) {
  const candidate = await getCandidateById(candidateId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{candidate.name}</h1>
      <div className="space-y-2">
        <p><strong>Candidate ID:</strong> {candidate.candidate_id}</p>
        <p><strong>Party:</strong> {candidate.party}</p>
        <p><strong>Office:</strong> {candidate.office}</p>
        <p><strong>State:</strong> {candidate.state}</p>
      </div>
    </div>
  );
}

async function CandidateContributions({ candidateId }: { candidateId: string }) {
  // This would need the committee ID in reality
  const contributions = await getContributions(candidateId, {
    per_page: 10,
  });

  return (
    <div className="space-y-3">
      {contributions.results.map((contribution, idx) => (
        <div key={idx} className="border p-3 rounded">
          <p className="font-semibold">{contribution.contributor_name}</p>
          <p className="text-sm text-gray-600">
            ${contribution.contribution_receipt_amount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(contribution.contribution_receipt_date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function CandidateInfoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

function ContributionsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border p-3 rounded">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
}



Option 3: Nested Suspense with ErrorBoundary
6. 3rd Option // app/dashboard/page.tsx

import { Suspense } from 'react';
import { getCandidates, getCommittees } from '@/lib/fec-api';
import { ErrorBoundary } from 'react-error-boundary';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">FEC Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ErrorBoundary fallback={<ErrorCard title="Candidates" />}>
          <Suspense fallback={<LoadingCard title="Candidates" />}>
            <CandidatesCard />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<ErrorCard title="Committees" />}>
          <Suspense fallback={<LoadingCard title="Committees" />}>
            <CommitteesCard />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

async function CandidatesCard() {
  const data = await getCandidates({ per_page: 5 });
  
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Recent Candidates</h2>
      <ul className="space-y-2">
        {data.results.map((candidate) => (
          <li key={candidate.candidate_id} className="text-sm">
            {candidate.name} - {candidate.party}
          </li>
        ))}
      </ul>
    </div>
  );
}

async function CommitteesCard() {
  const data = await getCommittees({ per_page: 5 });
  
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Recent Committees</h2>
      <ul className="space-y-2">
        {data.results.map((committee) => (
          <li key={committee.committee_id} className="text-sm">
            {committee.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingCard({ title }: { title: string }) {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ title }: { title: string }) {
  return (
    <div className="border rounded-lg p-4 bg-red-50">
      <h2 className="text-xl font-bold mb-2 text-red-600">{title}</h2>
      <p className="text-sm text-red-600">Failed to load data</p>
    </div>
  );
}



6. API Routes (for Client-Side Fetching)
If you need client-side data fetching, create API routes:

// app/api/candidates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCandidates, FECApiError } from '@/lib/fec-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const data = await getCandidates({
      name: searchParams.get('name') || undefined,
      office: searchParams.get('office') || undefined,
      state: searchParams.get('state') || undefined,
      page: Number(searchParams.get('page')) || 1,
      per_page: Number(searchParams.get('per_page')) || 20,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof FECApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



7. Error Handling and Loading States
Create error and loading components:

// app/candidates/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}

// app/candidates/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}


8. Caching Strategy
Next.js App Router caches by default, but you can customize:

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Or set revalidation period
export const revalidate = 3600; // revalidate every hour

// In fetch calls, use cache options
const data = await getCandidates({...}); // Cached by default

// Or use unstable_cache for granular control
import { unstable_cache } from 'next/cache';

const getCachedCandidates = unstable_cache(
  async (params) => getCandidates(params),
  ['candidates'],
  { revalidate: 3600, tags: ['candidates'] }
);


This approach provides type-safe, server-side data fetching with proper error handling and caching for the FEC API in Next.js.