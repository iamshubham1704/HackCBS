"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoterProfileCard from "@/components/VoterProfileCard";
import ElectionCard from "@/components/ElectionCard";
import { electionAPI } from "../api";
import Link from "next/link";
import { decodeVoterId } from "@/app/utils/voterIdDecoder";

interface Election {
  id: string;
  title: string;
  description: string;
  endDate: string;
  electionType: string;
  state: string;
  district: string;
  constituency: string;
  isActive: boolean;
  isCompleted: boolean;
  userHasVoted: boolean;
  startDate?: string; // Add startDate field
}

export default function Dashboard() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedVoterId = localStorage.getItem("voterId");
    if (!storedVoterId) {
      // Redirect to login if not logged in
      router.push("/login");
    } else {
      setVoterId(storedVoterId);
      fetchEligibleElections(storedVoterId);
    }
  }, [router]);

  const fetchEligibleElections = async (voterId: string) => {
    try {
      setLoading(true);
      
      // Decode voter ID to get location information
      const decodedInfo: any = decodeVoterId(voterId);
      
      // Get API base URL from environment or use default
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      
      // Fetch elections from the backend API
      const response = await fetch(`${API_BASE_URL}/elections/eligible`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: voterId,
          state: decodedInfo.valid ? decodedInfo.state : "Delhi"
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch elections");
      }
      
      const data = await response.json();
      
      // Transform the data to match our Election interface
      const elections: Election[] = data.elections.map((election: any) => ({
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: new Date(election.startDate).toLocaleDateString(),
        endDate: new Date(election.endDate).toLocaleDateString(),
        electionType: election.electionType,
        state: election.state,
        district: election.district || "",
        constituency: election.constituency || "",
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        userHasVoted: false // This would come from the backend in a real implementation
      }));
      
      setElections(elections);
    } catch (err: any) {
      setError(err.message || "Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove voter ID from localStorage
    localStorage.removeItem("voterId");
    // Redirect to home page
    router.push("/");
  };

  if (!voterId) {
    return null; // Don't render anything while checking auth status
  }

  // Sample stats data - in a real app, this would come from the backend
  const stats = {
    totalVotesCast: elections.filter(e => e.userHasVoted).length,
    upcomingEvents: elections.filter(e => !e.userHasVoted).length
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/dashboard/vote" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">🗳️</span>
                </div>
                <h3 className="ml-4 font-semibold text-gray-800">Vote</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">Cast your vote in elections</p>
            </Link>
            
            <Link href="/dashboard/results" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">📊</span>
                </div>
                <h3 className="ml-4 font-semibold text-gray-800">Results</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">View election results</p>
            </Link>
            
            <Link href="/dashboard/kyc" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">🧾</span>
                </div>
                <h3 className="ml-4 font-semibold text-gray-800">KYC Status</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">Check verification progress</p>
            </Link>
            
            <Link href="/dashboard/profile" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👤</span>
                </div>
                <h3 className="ml-4 font-semibold text-gray-800">Profile</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">View your profile</p>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Voter Profile Card */}
            <div className="lg:col-span-1">
              <VoterProfileCard 
                voterId={voterId}
                aadhaarVerified={true}
                faceVerified={true}
              />
            </div>
            
            {/* Stats and Quick Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                    <div className="text-3xl font-bold text-indigo-700 mb-2">{stats.totalVotesCast}</div>
                    <div className="text-indigo-600 font-medium">Total Votes Cast</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                    <div className="text-3xl font-bold text-green-700 mb-2">{stats.upcomingEvents}</div>
                    <div className="text-green-600 font-medium">Upcoming Events</div>
                  </div>
                </div>
              </div>
              
              {/* Ongoing Elections Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Ongoing Elections</h2>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading elections...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">Error: {error}</div>
                ) : (
                  <div className="space-y-4">
                    {elections
                      .filter(election => !election.userHasVoted)
                      .map(election => (
                        <ElectionCard
                          key={election.id}
                          title={election.title}
                          description={election.description}
                          endDate={election.endDate}
                          status="ongoing"
                          userVoteStatus="not-voted"
                          electionId={election.id}
                        />
                      ))}
                    
                    {elections.filter(election => !election.userHasVoted).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No ongoing elections at the moment
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
          
          {/* All Elections */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Elections</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading elections...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Error: {error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elections.map(election => (
                  <ElectionCard
                    key={election.id}
                    title={election.title}
                    description={election.description}
                    endDate={election.endDate}
                    status={election.userHasVoted ? "completed" : "ongoing"}
                    userVoteStatus={election.userHasVoted ? "voted" : "not-voted"}
                    electionId={election.id}
                  />

                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}