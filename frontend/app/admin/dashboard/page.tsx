"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/app/api";

interface ElectionForm {
  title: string;
  description: string;
  electionType: string;
  state: string;
  district: string;
  constituency: string;
  startDate: string;
  endDate: string;
}

interface CandidateForm {
  name: string;
  party: string;
  electionId: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  electionType: string;
  state: string;
  district: string;
  constituency: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  candidates: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  voteCount: number;
}

export default function AdminDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [formData, setFormData] = useState<ElectionForm>({
    title: "",
    description: "",
    electionType: "lok-sabha",
    state: "",
    district: "",
    constituency: "",
    startDate: "",
    endDate: ""
  });
  const [candidateData, setCandidateData] = useState<CandidateForm>({
    name: "",
    party: "",
    electionId: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getElections();
      setElections(response.elections || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCandidateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await adminAPI.createElection(formData);
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        electionType: "lok-sabha",
        state: "",
        district: "",
        constituency: "",
        startDate: "",
        endDate: ""
      });
      
      // Refresh elections list
      fetchElections();
      
      alert("Election created successfully!");
    } catch (err: any) {
      alert("Failed to create election: " + (err.message || "Please try again"));
    }
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await adminAPI.addCandidate(candidateData.electionId, {
        name: candidateData.name,
        party: candidateData.party
      });
      
      setShowCandidateForm(false);
      setCandidateData({
        name: "",
        party: "",
        electionId: ""
      });
      
      // Refresh elections list
      fetchElections();
      
      alert("Candidate added successfully!");
    } catch (err: any) {
      alert("Failed to add candidate: " + (err.message || "Please try again"));
    }
  };

  const handleRemoveCandidate = async (electionId: string, candidateId: string) => {
    try {
      await adminAPI.removeCandidate(electionId, candidateId);
      
      // Refresh elections list
      fetchElections();
      
      alert("Candidate removed successfully!");
    } catch (err: any) {
      alert("Failed to remove candidate: " + (err.message || "Please try again"));
    }
  };

  const handleLogout = () => {
    // In a real implementation, this would clear admin session
    router.push("/");
  };

  const endElection = async (electionId: string) => {
    try {
      await adminAPI.endElection(electionId);
      
      // Refresh elections list
      fetchElections();
      
      alert("Election ended successfully!");
    } catch (err: any) {
      alert("Failed to end election: " + (err.message || "Please try again"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elections...</p>
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
            onClick={fetchElections}
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
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Elections</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {showForm ? "Cancel" : "Create New Election"}
              </button>
            </div>
            
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Election</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Lok Sabha Elections 2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Type *
                    </label>
                    <select
                      name="electionType"
                      value={formData.electionType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="lok-sabha">Lok Sabha</option>
                      <option value="state-assembly">State Assembly</option>
                      <option value="local">Local/Municipal</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe the election..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Delhi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constituency
                    </label>
                    <input
                      type="text"
                      name="constituency"
                      value={formData.constituency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Mumbai South"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Create Election
                  </button>
                </div>
              </form>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Election
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {elections.map((election) => (
                    <tr key={election.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{election.title}</div>
                        <div className="text-sm text-gray-500">{election.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {election.electionType.replace('-', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{election.state}</div>
                        {election.district && (
                          <div className="text-sm text-gray-500">{election.district}</div>
                        )}
                        {election.constituency && (
                          <div className="text-sm text-gray-500">{election.constituency}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {election.startDate} to {election.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          election.isActive 
                            ? election.isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {election.isCompleted ? 'Completed' : election.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedElectionId(election.id);
                            setShowCandidateForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Add Candidates
                        </button>
                        {!election.isCompleted && election.isActive && (
                          <button
                            onClick={() => endElection(election.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            End Election
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Candidates Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Candidates</h2>
            
            {showCandidateForm && (
              <form onSubmit={handleCandidateSubmit} className="mb-8 p-6 border border-gray-200 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Candidate</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election *
                    </label>
                    <select
                      name="electionId"
                      value={candidateData.electionId}
                      onChange={handleCandidateInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Election</option>
                      {elections.map(election => (
                        <option key={election.id} value={election.id}>
                          {election.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Candidate Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={candidateData.name}
                      onChange={handleCandidateInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Rajesh Kumar"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party *
                    </label>
                    <input
                      type="text"
                      name="party"
                      value={candidateData.party}
                      onChange={handleCandidateInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Bharatiya Janata Party"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCandidateForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Add Candidate
                  </button>
                </div>
              </form>
            )}
            
            {/* Display candidates for each election */}
            {elections.map(election => (
              <div key={election.id} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{election.title} - Candidates</h3>
                
                {election.candidates && election.candidates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votes
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {election.candidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {candidate.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {candidate.party}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {candidate.voteCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleRemoveCandidate(election.id, candidate.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No candidates added for this election yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}