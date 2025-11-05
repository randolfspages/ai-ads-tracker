import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, DollarSign, Users, Calendar, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface Candidate {
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

interface FECResponse {
  results: Candidate[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
}

const FECTracker: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCandidates = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `https://api.open.fec.gov/v1/candidates/?api_key=DEMO_KEY&page=${page}&per_page=20&sort=-election_years`;
      
      if (searchTerm) {
        url += `&q=${encodeURIComponent(searchTerm)}`;
      }
      if (selectedOffice) {
        url += `&office=${selectedOffice}`;
      }
      if (selectedParty) {
        url += `&party=${selectedParty}`;
      }
      if (selectedState) {
        url += `&state=${selectedState}`;
      }

      const response = await fetch(url);
      
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
  }, [selectedOffice, selectedParty, selectedState]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchCandidates(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPartyColor = (party: string): string => {
    const partyUpper = party?.toUpperCase() || '';
    if (partyUpper.includes('DEM')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (partyUpper.includes('REP')) return 'bg-red-100 text-red-800 border-red-300';
    if (partyUpper.includes('IND')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getOfficeIcon = (office: string) => {
    if (office === 'P') return '🏛️';
    if (office === 'S') return '🏢';
    if (office === 'H') return '🏛️';
    return '📋';
  };

  const getOfficeName = (office: string): string => {
    const offices: Record<string, string> = {
      'P': 'President',
      'S': 'Senate',
      'H': 'House'
    };
    return offices[office] || office;
  };

  const uniqueStates = Array.from(new Set(candidates.map(c => c.state).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">FEC Candidate Tracker</h1>
                <p className="text-sm text-gray-600">Federal Election Commission Data Portal</p>
              </div>
            </div>
            <button
              onClick={() => fetchCandidates(currentPage)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount.toLocaleString()}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{currentPage} / {totalPages}</p>
              </div>
              <Calendar className="h-12 w-12 text-green-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Results Showing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{candidates.length}</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Candidate Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter candidate name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                type="submit"
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
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
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
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
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
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
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
            <p className="text-gray-700 font-medium">No candidates found matching your criteria.</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {candidates.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-4xl">{getOfficeIcon(candidate.office)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPartyColor(candidate.party)}`}>
                              {candidate.party || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Office</p>
                              <p className="text-sm font-semibold text-gray-900">{getOfficeName(candidate.office)}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">State</p>
                              <p className="text-sm font-semibold text-gray-900">{candidate.state || 'N/A'}</p>
                            </div>
                            
                            {candidate.district && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">District</p>
                                <p className="text-sm font-semibold text-gray-900">{candidate.district}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                              <p className="text-sm font-semibold text-gray-900">{candidate.candidate_status || 'N/A'}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Candidate ID</p>
                              <p className="text-sm font-mono text-gray-900">{candidate.candidate_id}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                              <p className="text-sm font-semibold text-gray-900">{candidate.incumbent_challenge || 'N/A'}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Election Years</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {candidate.election_years?.length > 0 ? candidate.election_years.join(', ') : 'N/A'}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Federal Funds</p>
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
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Data sourced from the Federal Election Commission (FEC) API. For more information, visit{' '}
            <a href="https://api.open.fec.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              api.open.fec.gov
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FECTracker;