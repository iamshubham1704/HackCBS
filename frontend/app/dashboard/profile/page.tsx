"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeVoterId } from "@/app/utils/voterIdDecoder";

interface UserProfile {
  name: string;
  dob: string;
  gender: string;
  presentAddress: {
    houseNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  permanentAddress: {
    houseNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  voterId: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // For now, using sample data
      const voterId = localStorage.getItem("voterId") || "VCUP000025NHCVPU5";
      
      const sampleProfile: UserProfile = {
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
        },
        voterId: voterId
      };
      
      setProfile(sampleProfile);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleDownloadVoterCard = () => {
    // In a real implementation, this would generate and download a PDF
    alert("Downloading digital voter card...");
  };

  const maskAddress = (address: any) => {
    // Mask sensitive parts of the address for privacy
    const masked = { ...address };
    masked.houseNumber = "***" + masked.houseNumber.slice(-1);
    masked.street = "***" + masked.street.slice(-3);
    return masked;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
            onClick={fetchProfile}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  // Decode voter ID information
  const decodedInfo: any = decodeVoterId(profile.voterId);
  const maskedPresentAddress = maskAddress(profile.presentAddress);
  const maskedPermanentAddress = maskAddress(profile.permanentAddress);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header with QR Code */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="mt-2 opacity-90">Voter ID: {profile.voterId}</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  {/* QR Code placeholder - in a real app, this would be a generated QR code */}
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <div className="text-gray-500 text-xs text-center">
                      QR Code
                      <br />
                      for
                      <br />
                      {profile.voterId.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{profile.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{profile.gender}</p>
                    </div>
                  </div>
                </div>
                
                {/* Location Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Location Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">
                        {decodedInfo.valid ? decodedInfo.state : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-medium">
                        {decodedInfo.valid ? decodedInfo.district : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Constituency</p>
                      <p className="font-medium">
                        {decodedInfo.valid ? decodedInfo.constituency : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Addresses */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Addresses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h4 className="font-medium text-gray-800 mb-3">Present Address</h4>
                    <p>{maskedPresentAddress.houseNumber}, {maskedPresentAddress.street}</p>
                    <p>{maskedPresentAddress.city}, {maskedPresentAddress.state}</p>
                    <p>{maskedPresentAddress.pincode}, {maskedPresentAddress.country}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h4 className="font-medium text-gray-800 mb-3">Permanent Address</h4>
                    <p>{maskedPermanentAddress.houseNumber}, {maskedPermanentAddress.street}</p>
                    <p>{maskedPermanentAddress.city}, {maskedPermanentAddress.state}</p>
                    <p>{maskedPermanentAddress.pincode}, {maskedPermanentAddress.country}</p>
                  </div>
                </div>
              </div>
              
              {/* Download Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleDownloadVoterCard}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download Digital Voter Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}