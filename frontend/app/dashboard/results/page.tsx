"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchResultsFromBlockchain } from "@/app/utils/blockchain";
import { electionAPI } from "@/app/api";

interface CandidateResult {
  id: number;
  name: string;
  voteCount: number;
}

interface BlockchainResult {
  candidates: CandidateResult[];
}

interface ElectionResult {
  id: string;
  title: string;
  date: string;
  totalVotes: number;
  candidates: {
    id: number;
    name: string;
    party: string;
    votes: number;
    percentage: number;
  }[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("current");
  const router = useRouter();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // Fetch elections from the backend
      const response = await electionAPI.getEligibleElections("user123"); // In a real app, this would be the actual user ID
      
      // Fetch results from blockchain for each election
      const electionResults: ElectionResult[] = [];
      
      for (const election of response.elections) {
        if (election.isCompleted) {
          // Fetch results from blockchain
          const blockchainResults: any = await fetchResultsFromBlockchain(parseInt(election.id));
          
          // Calculate total votes
          const totalVotes = blockchainResults.candidates.reduce((sum: number, candidate: any) => sum + candidate.voteCount, 0);
          
          // Transform blockchain results to match our interface
          electionResults.push({
            id: election.id,
            title: election.title,
            date: new Date(election.endDate).toLocaleDateString(),
            totalVotes: totalVotes,
            candidates: blockchainResults.candidates.map((candidate: any) => ({
              id: candidate.id,
              name: candidate.name,
              party: getCandidateParty(candidate.id),
              votes: candidate.voteCount,
              percentage: totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 1000) / 10 : 0
            }))
          });
        }
      }

      setResults(electionResults);
    } catch (err: any) {
      setError(err.message || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const getCandidateParty = (candidateId: number): string => {
    const partyMap: Record<number, string> = {
      1: "Indian National Congress",
      2: "Bharatiya Janata Party",
      3: "Aam Aadmi Party",
      4: "Indian National Congress",
      5: "Bharatiya Janata Party"
    };
    return partyMap[candidateId] || "Independent";
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Election Results</h1>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "current"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Current Results
                </button>
                <button
                  onClick={() => setActiveTab("historical")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "historical"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Historical Results
                </button>
              </nav>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No results available at this time.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {results.map((result) => (
                  <div key={result.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{result.title}</h2>
                        <p className="text-gray-600">Date: {result.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">Total Votes</p>
                        <p className="text-2xl font-bold text-indigo-600">{result.totalVotes.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {result.candidates.map((candidate) => (
                        <div key={candidate.id} className="space-y-2">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-800">{candidate.name}</span>
                              <span className="ml-2 text-sm text-gray-600">({candidate.party})</span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">
                                {candidate.votes.toLocaleString()} votes
                              </p>
                              <p className="text-sm text-gray-600">{candidate.percentage}%</p>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${candidate.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}