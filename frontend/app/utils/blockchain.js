/**
 * Blockchain utility functions for voting application
 */

// Contract ABI - matches the Voting.sol contract
const CONTRACT_ABI = [
  "function vote(uint electionId, uint candidateId, bytes32 voterHash) public",
  "function getCandidates(uint electionId) public view returns (tuple(uint id, string name, uint voteCount)[])",
  "function getResults(uint electionId) public view returns (tuple(uint id, string name, uint voteCount)[])",
  "function getVoteCount(uint electionId, uint candidateId) public view returns (uint)",
  "function endElection(uint electionId) public",
  "function addCandidate(uint electionId, uint candidateId, string name) public",
  "event VoteCast(uint indexed electionId, uint indexed candidateId, bytes32 indexed voterHash, uint timestamp)",
  "event ElectionEnded(uint indexed electionId, uint timestamp)"
];

// Contract address - in a real app, this would be the deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Hashes a voter ID with a secret to create an anonymous voter hash
 * @param {string} voterId - The voter's ID
 * @param {string} secret - A secret key for hashing
 * @returns {string} - The hashed voter identifier
 */
export function hashVoterId(voterId, secret = "default_secret") {
  // In a real implementation, this would use SHA256
  // For simulation, we'll create a deterministic hash
  const combined = voterId + secret;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex string and pad to 64 characters (32 bytes)
  return "0x" + Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
}

/**
 * Casts a vote on the blockchain
 * @param {Object} voteData - The vote data
 * @param {number} voteData.electionId - The election ID
 * @param {number} voteData.candidateId - The candidate ID
 * @param {string} voteData.voterId - The voter's ID
 * @returns {Object} - The transaction result
 */
export async function castVoteOnBlockchain(voteData) {
  const { electionId, candidateId, voterId } = voteData;
  
  // Validate required fields
  if (!electionId || isNaN(electionId) || !candidateId || isNaN(candidateId) || !voterId) {
    return {
      success: false,
      error: `Missing or invalid required fields: electionId=${electionId}, candidateId=${candidateId}, voterId=${voterId}`
    };
  }
  
  // Hash the voter ID to anonymize it
  const voterHash = hashVoterId(voterId);
  
  try {
    // Log the data being sent for debugging
    console.log("Sending vote data to backend:", {
      userId: "user123", // In a real app, this would be the actual user ID
      electionId,
      candidateId,
      voterId
    });
    
    // In a real implementation, this would call the smart contract
    // For now, we'll make an API call to our backend which handles blockchain interaction
    const response = await fetch("http://localhost:5000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123", // In a real app, this would be the actual user ID
        electionId,
        candidateId,
        voterId
      }),
    });
    
    console.log("Vote API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Vote API error response:", errorData);
      throw new Error(errorData.message || "Failed to cast vote");
    }
    
    const result = await response.json();
    console.log("Vote API success response:", result);
    
    return {
      success: true,
      transactionHash: result.transaction.blockchainHash,
      voterHash: result.transaction.voterHash,
      timestamp: result.transaction.timestamp
    };
  } catch (error) {
    console.error("Blockchain vote error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetches election results from the blockchain
 * @param {number} electionId - The election ID
 * @returns {Object} - The election results
 */
export async function fetchResultsFromBlockchain(electionId) {
  try {
    // In a real implementation, this would call the smart contract
    // For now, we'll make an API call to our backend which handles blockchain interaction
    const response = await fetch(`http://localhost:5000/api/elections/${electionId}/results`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch results");
    }
    
    const result = await response.json();
    
    // Simulate blockchain interaction delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      candidates: result.election.candidates.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        voteCount: candidate.voteCount
      }))
    };
  } catch (error) {
    console.error("Blockchain results error:", error);
    return { candidates: [] };
  }
}

export default {
  hashVoterId,
  castVoteOnBlockchain,
  fetchResultsFromBlockchain
};