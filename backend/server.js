import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Current directory:", __dirname);
console.log("Loading .env.local from:", __dirname + "/.env.local");

// Load environment variables
dotenv.config({ path: __dirname + "/.env.local" });

console.log("Environment variables loaded:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "Not found");
console.log("PORT:", process.env.PORT || "Not found");

import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import User from "./models/usermodel.js";
import Kyc from "./models/KYCmodel.js";
import Admin from "./models/adminModel.js";
import Election from "./models/electionModel.js";
import generateVoterId from "./utils/voterIdGenerator.js";

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // For handling base64 encoded images
app.use(express.urlencoded({ extended: true }));

// Registration API endpoint
app.post("/api/register/personal", async (req, res) => {
  try {
    const {
      name,
      age,
      fatherName,
      motherName,
      phone,
      email,
      presentAddress,
      permanentAddress,
      isSameAsPermanent,
      occupation,
    } = req.body;

    console.log("Registration request received:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user
    const user = new User({
      fullName: name,
      email,
      phone,
      role: "candidate", // Default role for now
      password: "temp_password", // Will be set properly during final registration
    });

    const savedUser = await user.save();
    console.log("User saved:", savedUser._id);

    // Create initial KYC record with address details
    const kyc = new Kyc({
      user: savedUser._id,
      aadhaarNumber: "pending", // Use a placeholder value
      aadhaarVerified: false,
      faceVerified: false,
      verificationStatus: "pending",
      presentAddress: presentAddress || {},
      permanentAddress: permanentAddress || {},
      isSameAsPermanent: isSameAsPermanent || false,
    });

    const savedKyc = await kyc.save();
    console.log("KYC record saved:", savedKyc._id);

    // Update user with KYC reference
    savedUser.kycRef = savedKyc._id;
    await savedUser.save();

    res.status(201).json({
      message: "Personal details saved successfully",
      user: {
        id: savedUser._id,
        name: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// Aadhaar verification API endpoint
app.post("/api/register/aadhaar", async (req, res) => {
  try {
    const { userId, aadhaarNumber, addressProofType } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (!aadhaarNumber) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }
    
    // Validate addressProofType if provided
    const validAddressProofTypes = ["aadhaar", "passport", "driving_license", "voter_id", "bank_statement", "rent_agreement", "other"];
    if (addressProofType && !validAddressProofTypes.includes(addressProofType)) {
      return res.status(400).json({ 
        message: `Invalid address proof type: ${addressProofType}. Valid types are: ${validAddressProofTypes.join(", ")}` 
      });
    }

    // Find user and update KYC details
    const user = await User.findById(userId).populate("kycRef");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update KYC record
    const kyc = await Kyc.findById(user.kycRef);
    if (!kyc) {
      return res.status(404).json({ message: "KYC record not found" });
    }

    kyc.aadhaarNumber = aadhaarNumber;
    // In a real implementation, we would verify the Aadhaar details here
    kyc.aadhaarVerified = true;
    kyc.verificationStatus = "pending"; // Will be updated after face verification
    
    // Also save address proof type if provided
    if (addressProofType) {
      kyc.addressProofType = addressProofType;
      // For now, we'll just set a placeholder for the document
      kyc.addressProofDocument = "uploaded_address_proof_document";
    }

    await kyc.save();

    // Update user verification status
    user.isAadhaarVerified = true;
    await user.save();

    const response = {
      message: "Aadhaar details saved successfully",
      kyc: {
        id: kyc._id,
        aadhaarNumber: kyc.aadhaarNumber,
        aadhaarVerified: kyc.aadhaarVerified,
      },
    };
    
    // Add address proof info to response if applicable
    if (addressProofType) {
      response.kyc.addressProofType = kyc.addressProofType;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Aadhaar verification error:", error);
    res.status(500).json({ message: "Server error during Aadhaar verification", error: error.message });
  }
});

// Face verification API endpoint
app.post("/api/register/face", async (req, res) => {
  try {
    const { userId, faceImages } = req.body;
    console.log("Face verification request:", { userId, faceImagesCount: faceImages?.length });

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (!faceImages || !Array.isArray(faceImages)) {
      return res.status(400).json({ message: "Face images are required and must be an array" });
    }

    // Find user and update KYC details
    const user = await User.findById(userId).populate("kycRef");
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Update KYC record with face images
    const kyc = await Kyc.findById(user.kycRef);
    if (!kyc) {
      console.log("KYC record not found:", user.kycRef);
      return res.status(404).json({ message: "KYC record not found" });
    }

    kyc.faceImages = faceImages;
    // In a real implementation, we would verify the face images here
    kyc.faceVerified = true;
    kyc.verificationStatus = "verified"; // All verifications complete

    await kyc.save();

    // Update user verification status
    user.isFaceVerified = true;
    user.kycStatus = "verified";
    
    // Generate and save voter ID
    try {
      // Use state from KYC record, and default values for district and constituency
      // In a real implementation, these would be determined based on the user's address
      const state = kyc.presentAddress?.state || "Delhi";
      const district = kyc.presentAddress?.city || "Delhi";
      // For constituency, we would need additional logic to determine this based on the address
      const constituency = district; // Using district as constituency for now
      
      console.log("Generating voter ID with:", { state, district, constituency });
      user.voterId = generateVoterId(state, district, constituency);
      console.log("Generated voter ID:", user.voterId);
    } catch (voterIdError) {
      console.error("Error generating voter ID:", voterIdError);
      // Use a fallback voter ID format if there's an error
      const fallbackId = `VC${new Date().getFullYear().toString().slice(-2)}${Math.random().toString(36).substring(2, 8).toUpperCase()}0`;
      user.voterId = fallbackId;
      console.log("Using fallback voter ID:", user.voterId);
    }
    
    await user.save();

    res.status(200).json({
      message: "Face verification completed successfully",
      user: {
        id: user._id,
        name: user.fullName,
        voterId: user.voterId,
        isAadhaarVerified: user.isAadhaarVerified,
        isFaceVerified: user.isFaceVerified,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ message: "Server error during face verification", error: error.message });
  }
});

// Login API endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { voterId } = req.body;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // Basic format validation
    if (voterId.length !== 17 || !voterId.startsWith('VC')) {
      return res.status(400).json({ message: "Invalid voter ID format" });
    }
    
    // In a real implementation, we would check the database for the voter ID
    // For now, we'll simulate a successful validation
    console.log("Validating voter ID:", voterId);
    
    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return success response
    res.status(200).json({
      message: "Voter ID validated successfully",
      voterId: voterId,
      valid: true
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// Get eligible elections for a voter
app.post("/api/elections/eligible", async (req, res) => {
  try {
    const { voterId, state } = req.body;
    
    // Validate required fields
    if (!voterId || !state) {
      return res.status(400).json({ message: "Voter ID and state are required" });
    }
    
    // Fetch all active elections from the database
    const allElections = await Election.find({ isActive: true });
    
    // Filter elections based on voter's eligibility
    const eligibleElections = allElections.filter(election => {
      // All users are eligible for Lok Sabha elections
      if (election.electionType === "lok-sabha") {
        return true;
      }
      
      // Users are eligible for state elections in their state
      if (election.electionType === "state-assembly" && election.state === state) {
        return true;
      }
      
      // Users are eligible for local elections in their state
      if (election.electionType === "local" && election.state === state) {
        return true;
      }
      
      return false;
    });
    
    res.status(200).json({
      message: "Eligible elections retrieved successfully",
      elections: eligibleElections.map(election => ({
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        electionType: election.electionType,
        state: election.state,
        district: election.district,
        constituency: election.constituency,
        isActive: election.isActive,
        isCompleted: election.isCompleted
      }))
    });
  } catch (error) {
    console.error("Error getting eligible elections:", error);
    res.status(500).json({ message: "Server error while retrieving elections", error: error.message });
  }
});

// Get election candidates
app.get("/api/elections/:electionId/candidates", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // In a real implementation, this would fetch candidates from the database
    // For now, returning sample data
    const candidates = [
      {
        id: "c1",
        name: "Rajesh Kumar",
        party: "Indian National Congress",
        symbol: "Hand"
      },
      {
        id: "c2",
        name: "Priya Sharma",
        party: "Bharatiya Janata Party",
        symbol: "Lotus"
      },
      {
        id: "c3",
        name: "Amit Patel",
        party: "Aam Aadmi Party",
        symbol: "Broom"
      }
    ];
    
    res.status(200).json({
      message: "Candidates retrieved successfully",
      candidates
    });
  } catch (error) {
    console.error("Error getting candidates:", error);
    res.status(500).json({ message: "Server error while retrieving candidates", error: error.message });
  }
});

// Cast a vote
app.post("/api/vote", async (req, res) => {
  try {
    const { userId, electionId, candidateId, voterId } = req.body;
    
    // Validate required fields
    if (!userId || !electionId || !candidateId || !voterId) {
      return res.status(400).json({ message: "User ID, election ID, candidate ID, and voter ID are required" });
    }
    
    // In a real implementation, this would:
    // 1. Check if the user has already voted in this election
    // 2. Verify the user is eligible to vote in this election
    // 3. Record the vote in the database
    // 4. Submit the vote to the blockchain
    
    // For blockchain integration, we would:
    // 1. Hash the voter ID to create an anonymous voter hash
    // 2. Call the smart contract function: vote(uint electionId, uint candidateId, bytes32 voterHash)
    // 3. Wait for the transaction to be mined
    // 4. Return the transaction hash
    
    // Simulate blockchain interaction
    const voterHash = "0x" + crypto.createHash('sha256').update(voterId + "secret_salt").digest('hex');
    const transactionHash = "0x" + Math.random().toString(36).substr(2, 32);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const voteTransaction = {
      id: "tx_" + Math.random().toString(36).substr(2, 9),
      userId,
      electionId,
      candidateId,
      voterHash,
      timestamp: new Date(),
      blockchainHash: transactionHash
    };
    
    res.status(200).json({
      message: "Vote cast successfully",
      transaction: voteTransaction
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({ message: "Server error while casting vote", error: error.message });
  }
});

// Get election results
app.get("/api/results/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // In a real implementation, this would fetch results from the blockchain
    // For blockchain integration, we would:
    // 1. Call the smart contract function: getResults(uint electionId)
    // 2. Parse the results and return them
    
    // Simulate blockchain interaction
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock results based on election ID
    let results;
    if (electionId === "1") {
      results = {
        electionId,
        title: "Local Council Elections",
        date: "Nov 5, 2025",
        totalVotes: 12540,
        candidates: [
          {
            id: 1,
            name: "Rajesh Kumar",
            party: "Indian National Congress",
            votes: Math.floor(Math.random() * 1000) + 5000,
            percentage: 0
          },
          {
            id: 2,
            name: "Priya Sharma",
            party: "Bharatiya Janata Party",
            votes: Math.floor(Math.random() * 1000) + 4000,
            percentage: 0
          },
          {
            id: 3,
            name: "Amit Patel",
            party: "Aam Aadmi Party",
            votes: Math.floor(Math.random() * 1000) + 3000,
            percentage: 0
          }
        ]
      };
    } else if (electionId === "2") {
      results = {
        electionId,
        title: "State Assembly Elections",
        date: "Oct 20, 2025",
        totalVotes: 87650,
        candidates: [
          {
            id: 4,
            name: "Sunita Verma",
            party: "Indian National Congress",
            votes: Math.floor(Math.random() * 1000) + 45000,
            percentage: 0
          },
          {
            id: 5,
            name: "Vikram Singh",
            party: "Bharatiya Janata Party",
            votes: Math.floor(Math.random() * 1000) + 40000,
            percentage: 0
          }
        ]
      };
    } else {
      results = {
        electionId,
        title: "Unknown Election",
        date: "Unknown",
        totalVotes: 0,
        candidates: []
      };
    }
    
    // Calculate percentages
    const totalVotes = results.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    results.candidates = results.candidates.map(candidate => ({
      ...candidate,
      percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 1000) / 10 : 0
    }));
    
    res.status(200).json({
      message: "Results retrieved successfully",
      results
    });
  } catch (error) {
    console.error("Error getting results:", error);
    res.status(500).json({ message: "Server error while retrieving results", error: error.message });
  }
});

// Get KYC status
app.get("/api/kyc/status/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // In a real implementation, this would fetch KYC status from the database
    // For now, returning sample data
    const kycStatus = {
      voterId,
      aadhaarVerified: true,
      faceVerified: true,
      voterIdGenerated: true,
      remarks: "All verification steps completed successfully"
    };
    
    res.status(200).json({
      message: "KYC status retrieved successfully",
      kycStatus
    });
  } catch (error) {
    console.error("Error getting KYC status:", error);
    res.status(500).json({ message: "Server error while retrieving KYC status", error: error.message });
  }
});

// Get user profile
app.get("/api/profile/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // In a real implementation, this would fetch user profile from the database
    // For now, returning sample data
    const profile = {
      voterId,
      name: "John Doe",
      dob: "1990-05-15",
      gender: "Male",
      presentAddress: {
        houseNumber: "123",
        street: "Main Street",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India"
      },
      permanentAddress: {
        houseNumber: "456",
        street: "Park Avenue",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110002",
        country: "India"
      }
    };
    
    res.status(200).json({
      message: "Profile retrieved successfully",
      profile
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error while retrieving profile", error: error.message });
  }
});

// Admin registration
app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, email, password, organization, department } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !organization || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }
    
    // Create new admin
    const admin = new Admin({
      name,
      email,
      password, // In a real implementation, this should be hashed
      organization,
      department,
    });
    
    const savedAdmin = await admin.save();
    
    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        organization: savedAdmin.organization,
        department: savedAdmin.department
      }
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Server error during admin registration", error: error.message });
  }
});

// Create a new election (admin only)
app.post("/api/admin/elections", async (req, res) => {
  try {
    // In a real implementation, we would verify admin authentication
    // For now, we'll just create the election
    
    const { title, description, electionType, state, district, constituency, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!title || !description || !electionType || !state || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate election type
    const validElectionTypes = ["lok-sabha", "state-assembly", "local"];
    if (!validElectionTypes.includes(electionType)) {
      return res.status(400).json({ message: "Invalid election type" });
    }
    
    // Create election object
    const election = new Election({
      title,
      description,
      electionType,
      state,
      district: district || "",
      constituency: constituency || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
      isCompleted: false,
      totalVotes: 0,
      candidates: []
    });
    
    const savedElection = await election.save();
    
    res.status(201).json({
      message: "Election created successfully",
      election: {
        id: savedElection._id,
        title: savedElection.title,
        description: savedElection.description,
        electionType: savedElection.electionType,
        state: savedElection.state,
        district: savedElection.district,
        constituency: savedElection.constituency,
        startDate: savedElection.startDate,
        endDate: savedElection.endDate,
        isActive: savedElection.isActive,
        isCompleted: savedElection.isCompleted,
        createdAt: savedElection.createdAt,
        updatedAt: savedElection.updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ message: "Server error while creating election", error: error.message });
  }
});

// Get all elections (for admin dashboard)
app.get("/api/admin/elections", async (req, res) => {
  try {
    // In a real implementation, we would verify admin authentication
    
    // Fetch elections from the database
    const elections = await Election.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "Elections retrieved successfully",
      elections: elections.map(election => ({
        id: election._id,
        title: election.title,
        description: election.description,
        electionType: election.electionType,
        state: election.state,
        district: election.district,
        constituency: election.constituency,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        createdAt: election.createdAt,
        updatedAt: election.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error getting elections:", error);
    res.status(500).json({ message: "Server error while retrieving elections", error: error.message });
  }
});

// Add candidate to election
app.post("/api/admin/elections/:electionId/candidates", async (req, res) => {
  try {
    const { electionId } = req.params;
    const { name, party } = req.body;
    
    // Validate required fields
    if (!name || !party) {
      return res.status(400).json({ message: "Candidate name and party are required" });
    }
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Add candidate to election
    const newCandidate = {
      name,
      party,
      voteCount: 0
    };
    
    await election.addCandidate(newCandidate);
    
    res.status(201).json({
      message: "Candidate added successfully",
      candidate: newCandidate
    });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Server error while adding candidate", error: error.message });
  }
});

// Remove candidate from election
app.delete("/api/admin/elections/:electionId/candidates/:candidateId", async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Remove candidate from election
    await election.removeCandidate(candidateId);
    
    res.status(200).json({
      message: "Candidate removed successfully"
    });
  } catch (error) {
    console.error("Error removing candidate:", error);
    res.status(500).json({ message: "Server error while removing candidate", error: error.message });
  }
});

// End election
app.post("/api/admin/elections/:electionId/end", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // End the election
    await election.endElection();
    
    res.status(200).json({
      message: "Election ended successfully",
      election
    });
  } catch (error) {
    console.error("Error ending election:", error);
    res.status(500).json({ message: "Server error while ending election", error: error.message });
  }
});

// Get election results
app.get("/api/elections/:electionId/results", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Sort candidates by vote count
    const sortedCandidates = [...election.candidates].sort((a, b) => b.voteCount - a.voteCount);
    
    res.status(200).json({
      message: "Election results retrieved successfully",
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        candidates: sortedCandidates.map(candidate => ({
          id: candidate._id,
          name: candidate.name,
          party: candidate.party,
          voteCount: candidate.voteCount
        }))
      }
    });
  } catch (error) {
    console.error("Error getting election results:", error);
    res.status(500).json({ message: "Server error while retrieving election results", error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});