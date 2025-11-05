// PROJECT STRUCTURE
/*
fec-tracker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       └── candidates/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── StatsCard.tsx
│   ├── SearchFilters.tsx
│   ├── CandidateCard.tsx
│   ├── Pagination.tsx
│   └── Footer.tsx
├── types/
│   └── index.ts
├── lib/
│   └── utils.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
*/

// ============================================
// 1. package.json
// ============================================
{
  "name": "fec-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2"
  }
}

// ============================================
// 2. tsconfig.json
// ============================================
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

// ============================================
// 3. tailwind.config.ts
// ============================================
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config

// ============================================
// 4. next.config.js
// ============================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

// ============================================
// 5. app/globals.css
// ============================================
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
}

// ============================================
// 6. types/index.ts
// ============================================
export interface Candidate {
  candidate_id: string;
  name: string;
  party: string;
  office: string;
  state: string;
  district?: string;
  election_years: number[];
  cycles: number[];
  candidate_status: string;
  incumbent_challenge: string;
  federal_funds_flag: boolean;
  has_raised_funds: boolean;
}

export interface FECResponse {
  results: Candidate[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
}

export interface SearchFilters {
  searchTerm: string;
  office: string;
  party: string;
  state: string;
}

// ============================================
// 7. lib/utils.ts
// ============================================
export const getPartyColor = (party: string): string => {
  const partyUpper = party?.toUpperCase() || '';
  if (partyUpper.includes('DEM')) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (partyUpper.includes('REP')) return 'bg-red-100 text-red-800 border-red-300';
  if (partyUpper.includes('IND')) return 'bg-purple-100 text-purple-800 border-purple-300';
  return 'bg-gray-100 text-gray-800 border-gray-300';
};

export const getOfficeIcon = (office: string): string => {
  if (office === 'P') return '🏛️';
  if (office === 'S') return '🏢';
  if (office === 'H') return '🏛️';
  return '📋';
};

export const getOfficeName = (office: string): string => {
  const offices: Record<string, string> = {
    'P': 'President',
    'S': 'Senate',
    'H': 'House'
  };
  return offices[office] || office;
};

export const buildApiUrl = (
  page: number,
  filters: SearchFilters
): string => {
  const baseUrl = 'https://api.open.fec.gov/v1/candidates/';
  const params = new URLSearchParams({
    api_key: process.env.NEXT_PUBLIC_FEC_API_KEY || 'DEMO_KEY',
    page: page.toString(),
    per_page: '20',
    sort: '-election_years'
  });

  if (filters.searchTerm) params.append('q', filters.searchTerm);
  if (filters.office) params.append('office', filters.office);
  if (filters.party) params.append('party', filters.party);
  if (filters.state) params.append('state', filters.state);

  return `${baseUrl}?${params.toString()}`;
};

// ============================================
// 8. app/layout.tsx
// ============================================
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FEC Candidate Tracker',
  description: 'Track Federal Election Commission candidate data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// ============================================
// 9. app/api/candidates/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { FECResponse } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = searchParams.get('page') || '1';
  const searchTerm = searchParams.get('q') || '';
  const office = searchParams.get('office') || '';
  const party = searchParams.get('party') || '';
  const state = searchParams.get('state') || '';

  try {
    let url = `https://api.open.fec.gov/v1/candidates/?api_key=${process.env.NEXT_PUBLIC_FEC_API_KEY || 'DEMO_KEY'}&page=${page}&per_page=20&sort=-election_years`;
    
    if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;
    if (office) url += `&office=${office}`;
    if (party) url += `&party=${party}`;
    if (state) url += `&state=${state}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`FEC API error: ${response.status}`);
    }

    const data: FECResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching FEC data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate data' },
      { status: 500 }
    );
  }
}

// ============================================
// 10. components/Header.tsx
// ============================================
'use client';

import { TrendingUp, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  return (
    <header className="bg-white shadow-md border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                FEC Candidate Tracker
              </h1>
              <p className="text-sm text-gray-600">
                Federal Election Commission Data Portal
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// 11. components/StatsCard.tsx
// ============================================
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple';
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-500',
    green: 'border-green-500 text-green-500',
    purple: 'border-purple-500 text-purple-500',
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className={`h-12 w-12 ${colorClasses[color].split(' ')[1]} opacity-80`} />
      </div>
    </div>
  );
}

// ============================================
// 12. components/SearchFilters.tsx
// ============================================
'use client';

import { Search, Filter } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  states: string[];
}

export default function SearchFilters({
  filters,
  onFilterChange,
  onSearch,
  states,
}: SearchFiltersProps) {
  const handleInputChange = (key: keyof SearchFiltersType, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Candidate Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                placeholder="Enter candidate name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={onSearch}
            className="self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office
            </label>
            <select
              value={filters.office}
              onChange={(e) => handleInputChange('office', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Offices</option>
              <option value="P">President</option>
              <option value="S">Senate</option>
              <option value="H">House</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party
            </label>
            <select
              value={filters.party}
              onChange={(e) => handleInputChange('party', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Parties</option>
              <option value="DEM">Democratic</option>
              <option value="REP">Republican</option>
              <option value="IND">Independent</option>
              <option value="LIB">Libertarian</option>
              <option value="GRE">Green</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={filters.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 13. components/CandidateCard.tsx
// ============================================
import { ExternalLink } from 'lucide-react';
import { Candidate } from '@/types';
import { getPartyColor, getOfficeIcon, getOfficeName } from '@/lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="text-4xl">{getOfficeIcon(candidate.office)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {candidate.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPartyColor(
                    candidate.party
                  )}`}
                >
                  {candidate.party || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Office
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getOfficeName(candidate.office)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    State
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.state || 'N/A'}
                  </p>
                </div>

                {candidate.district && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      District
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {candidate.district}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.candidate_status || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Candidate ID
                  </p>
                  <p className="text-sm font-mono text-gray-900">
                    {candidate.candidate_id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Type
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.incumbent_challenge || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Election Years
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.election_years?.length > 0
                      ? candidate.election_years.join(', ')
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Federal Funds
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.federal_funds_flag ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={`https://www.fec.gov/data/candidate/${candidate.candidate_id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
          >
            <span>View on FEC</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 14. components/Pagination.tsx
// ============================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing page <span className="font-semibold">{currentPage}</span> of{' '}
          <span className="font-semibold">{totalPages}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 15. components/Footer.tsx
// ============================================
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-600">
          Data sourced from the Federal Election Commission (FEC) API. For more
          information, visit{' '}
          <a
            href="https://api.open.fec.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            api.open.fec.gov
          </a>
        </p>
      </div>
    </footer>
  );
}

// ============================================
// 16. app/page.tsx (Main Page Component)
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import SearchFilters from '@/components/SearchFilters';
import CandidateCard from '@/components/CandidateCard';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import { Candidate, FECResponse, SearchFilters as SearchFiltersType } from '@/types';

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<SearchFiltersType>({
    searchTerm: '',
    office: '',
    party: '',
    state: '',
  });

  const fetchCandidates = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters.searchTerm && { q: filters.searchTerm }),
        ...(filters.office && { office: filters.office }),
        ...(filters.party && { party: filters.party }),
        ...(filters.state && { state: filters.state }),
      });

      const response = await fetch(`/api/candidates?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FECResponse = await response.json();
      setCandidates(data.results || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, [filters.office, filters.party, filters.state]);

  const handleSearch = () => {
    fetchCandidates(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchCandidates(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const uniqueStates = Array.from(
    new Set(candidates.map((c) => c.state).filter(Boolean))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onRefresh={() => fetchCandidates(currentPage)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Candidates"
            value={totalCount.toLocaleString()}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Current Page"
            value={`${currentPage} / ${totalPages}`}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Results Showing"
            value={candidates.length}
            icon={DollarSign}
            color="purple"
          />
        </div>

        <SearchFilters
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          states={uniqueStates}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading candidates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              No candidates found matching your criteria.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.candidate_id} candidate={candidate} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ============================================
// 17. .env.local (Environment Variables)
// ============================================
# Create this file in your project root
NEXT_PUBLIC_FEC_API_KEY=DEMO_KEY

// ============================================
// 18. .gitignore
// ============================================
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

// ============================================
// 19. README.md
// ============================================
# FEC Candidate Tracker

A Next.js application to track Federal Election Commission (FEC) candidate data.

## Features

- 🔍 Advanced search and filtering
- 📊 Real-time candidate data from FEC API
- 🎨 Modern UI with Tailwind CSS
- 🔒 Type-safe with TypeScript
- 📱 Fully responsive design
- ⚡ Server-side API routes for better performance
- 🔄 Pagination support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fec-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FEC_API_KEY=DEMO_KEY
```

For production, get your own API key from: https://api.open.fec.gov/developers/

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
fec-tracker/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── api/
│       └── candidates/
│           └── route.ts    # API route for fetching candidates
├── components/
│   ├── Header.tsx          # Header component
│   ├── StatsCard.tsx       # Statistics card component
│   ├── SearchFilters.tsx   # Search and filter component
│   ├── CandidateCard.tsx   # Candidate display card
│   ├── Pagination.tsx      # Pagination component
│   └── Footer.tsx          # Footer component
├── types/
│   └── index.ts            # TypeScript type definitions
├── lib/
│   └── utils.ts            # Utility functions
└── ...config files
```

## Key Components

### API Route (`app/api/candidates/route.ts`)
- Handles FEC API requests server-side
- Implements caching with Next.js revalidation
- Supports filtering by office, party, state, and search term

### Main Page (`app/page.tsx`)
- Manages application state
- Coordinates between components
- Handles data fetching and pagination

### Reusable Components
- **Header**: Navigation and refresh functionality
- **StatsCard**: Display key metrics
- **SearchFilters**: Search and filter interface
- **CandidateCard**: Individual candidate information
- **Pagination**: Page navigation controls
- **Footer**: Site footer with links

## API Integration

The application uses the FEC OpenData API:
- **Base URL**: `https://api.open.fec.gov/v1/`
- **Endpoint**: `/candidates/`
- **Documentation**: https://api.open.fec.gov/developers/

## Filtering Options

- **Search**: Search by candidate name
- **Office**: Filter by President, Senate, or House
- **Party**: Filter by political party (DEM, REP, IND, etc.)
- **State**: Filter by US state

## Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Deployment

This application can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

### Deploying to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## Environment Variables

- `NEXT_PUBLIC_FEC_API_KEY`: Your FEC API key (defaults to DEMO_KEY)

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **FEC OpenData API**: Federal election data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Acknowledgments

- Data provided by the Federal Election Commission
- Built with Next.js and React
- Styled with Tailwind CSS

## Support

For issues and questions:
- FEC API Documentation: https://api.open.fec.gov/developers/
- Next.js Documentation: https://nextjs.org/docs
- GitHub Issues: [Your Repository Issues]

---

Made with ❤️ using Next.js and TypeScript