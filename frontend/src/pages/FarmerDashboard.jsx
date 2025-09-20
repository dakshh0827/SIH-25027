import React, { useState, useEffect } from "react";
import {
  Upload,
  History,
  User,
  MapPin,
  Plus,
  Tag,
  LogOut,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useReportStore } from "../stores/useReportStore";
import { useAuthStore } from "../stores/useAuthStore";
import QRScannerModal from "../components/QRScannerModal";

// Reusable UI components
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">
    {title}
  </h3>
);

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="h-12 w-12 text-[#34d399] animate-spin mx-auto mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  </div>
);

// Form for uploading a new harvest record
const UploadHarvestForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    identifier: "",
    herbSpecies: "",
    harvestWeightKg: "",
    harvestSeason: "",
    location: "",
    notes: "",
    regulatoryTags: [],
    harvestProof: null,
  });
  const [tagInput, setTagInput] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.regulatoryTags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        regulatoryTags: [...prev.regulatoryTags, tagInput.trim()],
      }));
      setTagInput("");
      toast.success(`Tag "${tagInput.trim()}" added!`);
    } else if (formData.regulatoryTags.includes(tagInput.trim())) {
      toast.error("Tag already exists!");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      regulatoryTags: prev.regulatoryTags.filter((tag) => tag !== tagToRemove),
    }));
    toast.success(`Tag "${tagToRemove}" removed!`);
  };

  const handleCaptureLocation = () => {
    const loadingToast = toast.loading("Getting your location...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = `${position.coords.latitude.toFixed(
            6
          )}, ${position.coords.longitude.toFixed(6)}`;
          setFormData((prev) => ({ ...prev, location: coordinates }));
          toast.dismiss(loadingToast);
          toast.success(`Location captured: ${coordinates}`);
        },
        (error) => {
          console.error("Error getting location: ", error);
          toast.dismiss(loadingToast);
          toast.error(
            "Unable to retrieve location. Please allow geolocation access."
          );
        }
      );
    } else {
      toast.dismiss(loadingToast);
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [".png", ".jpg", ".jpeg"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (file.size > maxSize) {
        toast.error("File size too large. Please select an image under 10MB.");
        e.target.value = "";
        return;
      }

      if (!allowedTypes.includes(fileExtension)) {
        toast.error(
          "Invalid file type. Please select a PNG, JPG, or JPEG file."
        );
        e.target.value = "";
        return;
      }

      toast.success(`Image "${file.name}" selected successfully!`);
      setFormData((prev) => ({ ...prev, harvestProof: file }));
    }
  };

  const validateForm = () => {
    const requiredFields = {
      identifier: "Harvest Identifier",
      herbSpecies: "Herb Species",
      harvestWeightKg: "Harvest Weight",
      harvestSeason: "Harvest Season",
      location: "Location",
      harvestProof: "Harvest Proof",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        toast.error(`${label} is required!`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form in the parent after modal is handled
      setFormData({
        identifier: "",
        herbSpecies: "",
        harvestWeightKg: "",
        harvestSeason: "",
        location: "",
        notes: "",
        regulatoryTags: [],
        harvestProof: null,
      });
      setTagInput("");
      const fileInput = document.getElementById("harvestProof");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error submitting harvest record:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionTitle title="New Harvest Record" />

      <div>
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Harvest Identifier <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="identifier"
          id="identifier"
          value={formData.identifier}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          placeholder="e.g., HARV-TURMERIC-2024-001"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="herbSpecies"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Herb Species <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="herbSpecies"
          id="herbSpecies"
          value={formData.herbSpecies}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          placeholder="e.g., Turmeric, Ashwagandha"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="harvestWeightKg"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Harvest Weight (kg) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          name="harvestWeightKg"
          id="harvestWeightKg"
          value={formData.harvestWeightKg}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          step="0.01"
          min="0"
          placeholder="e.g., 150.5"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="harvestSeason"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Harvest Season <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="harvestSeason"
          id="harvestSeason"
          value={formData.harvestSeason}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          placeholder="e.g., Summer 2024, Monsoon 2024"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Location (GPS Coordinates) <span className="text-red-400">*</span>
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            readOnly
            required
            disabled={isSubmitting}
            placeholder="Click button to capture location"
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleCaptureLocation}
            disabled={isSubmitting}
            className="flex-shrink-0 px-4 py-3 bg-[#10b981] text-white border border-[#10b981] hover:bg-transparent hover:text-[#34d399] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Additional Notes
        </label>
        <textarea
          name="notes"
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isSubmitting}
          rows="3"
          placeholder="Any additional information about the harvest..."
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="tagInput"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Regulatory Tags
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g., Organic, FSSAI-Approved"
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddTag(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={isSubmitting || !tagInput.trim()}
            className="flex-shrink-0 px-4 py-3 bg-blue-600/30 text-blue-300 border border-blue-500 hover:bg-blue-700/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Tag className="h-5 w-5" />
          </button>
        </div>

        {formData.regulatoryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.regulatoryTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/50 text-sm cursor-pointer hover:bg-blue-600/30 transition-colors duration-200"
                onClick={() => !isSubmitting && handleRemoveTag(tag)}
              >
                {tag}
                {!isSubmitting && (
                  <span className="text-blue-400 hover:text-blue-200">×</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="harvestProof"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Harvest Proof (PNG/JPG) <span className="text-red-400">*</span>
        </label>
        <input
          type="file"
          name="harvestProof"
          id="harvestProof"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          required
          disabled={isSubmitting}
          className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#10b981] file:text-white hover:file:bg-[#059669] file:transition-colors file:duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-2 text-xs text-slate-400">
          Upload a clear image showing your harvest. Maximum file size: 10MB
        </p>
        {formData.harvestProof && (
          <p className="mt-1 text-xs text-green-400">
            Selected: {formData.harvestProof.name}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center px-4 py-3 bg-[#10b981] border border-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" /> Submit Harvest Record
          </>
        )}
      </button>
    </form>
  );
};

// Component to display history of uploaded records
const HarvestHistory = ({ records, isLoading }) => {
  const handleRecordClick = (record) => {
    toast.success(
      `Viewing harvest record for ${record.herbSpecies || record.herb}`
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading harvest history..." />;
  }

  const safeRecords = Array.isArray(records) ? records : [];

  return (
    <div className="space-y-4">
      <SectionTitle title="Harvest Records History" />

      {safeRecords.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Herb Species
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Weight (kg)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Season
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Status
                </th>
                {/* ✅ CHANGE: QR Code column removed */}
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
              {safeRecords.map((record) => (
                <tr
                  key={record.id || record._id || Math.random()}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleRecordClick(record)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {record.herbSpecies || record.herb || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.harvestWeightKg || record.weight || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.harvestSeason || record.season || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(record.createdAt || record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center capitalize px-2.5 py-0.5 text-xs font-medium bg-yellow-600/30 text-yellow-400">
                      {record.status || "Pending Validation"}
                    </span>
                  </td>
                  {/* ✅ CHANGE: QR Code cell removed */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            No harvest records found
          </p>
          <p className="text-slate-400 text-sm">
            Submit your first harvest record to get started!
          </p>
        </div>
      )}
    </div>
  );
};

// Component for the user profile section
const UserProfile = ({ profile, user, isLoading, onRefresh }) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!profile || !user) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Profile" />
        <div className="text-center py-12">
          <User className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">Profile not found</p>
          <p className="text-slate-400 text-sm mb-4">
            Unable to load your profile information
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-[#10b981] text-white border border-[#10b981] hover:bg-transparent hover:text-[#34d399] transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Farmer Profile" />
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600/50 transition-all duration-300"
        >
          <Loader2 className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-6 text-slate-300">
        <div className="bg-slate-800/30 p-4 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-3">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Full Name</p>
              <p className="text-white font-medium">{user.fullName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Role</p>
              <p className="text-white font-medium capitalize">{user.role}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Member Since</p>
              <p className="text-white font-medium">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-4 bg-slate-700/50 border border-slate-600">
            <User className="h-12 w-12 text-[#34d399]" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{profile.fpoName}</h4>
            <p className="text-sm text-slate-400">
              Authorized Representative: {profile.authorizedRepresentative}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Profile created: {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">
              Registration Number
            </p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.regNumber}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">PAN</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.pan}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">GSTIN</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.gstin}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">Last Updated</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {formatDate(profile.updatedAt)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">
            Registered Address
          </p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
            {profile.registeredAddress}
          </p>
        </div>

        {profile.idProofUrl && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">
              ID Proof Document
            </p>
            <div className="bg-slate-800/50 border border-slate-700/30 p-3">
              <img
                src={profile.idProofUrl}
                alt="ID Proof"
                className="max-w-full h-auto max-h-64 mx-auto border border-slate-600"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <p
                className="text-red-400 text-sm text-center mt-2"
                style={{ display: "none" }}
              >
                Failed to load image
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const FarmerDashboard = () => {
  const [activeSection, setActiveSection] = useState("history");
  const [modalQrData, setModalQrData] = useState(null);

  const { fetchFarmerHistory, harvestRecords, isSubmitting, submitReport } =
    useReportStore();
  const { logout, getProfile, profile, user, isLoading, authenticatedFetch } =
    useAuthStore();

  const [localProfileLoading, setLocalProfileLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && user) {
        try {
          await getProfile();
          await fetchFarmerHistory(authenticatedFetch);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      }
    };
    fetchData();
  }, [isLoading, user, getProfile, fetchFarmerHistory, authenticatedFetch]);

  const handleUploadSubmit = async (formData) => {
    try {
      const result = await submitReport({
        reportType: "farmer",
        data: formData,
      });

      if (result) {
        fetchFarmerHistory(authenticatedFetch);
        toast.success(
          `Harvest record for ${formData.herbSpecies} submitted successfully!`
        );

        if (result.qr) {
          const dataForModal = { ...result.report, ...result.qr };
          setModalQrData(dataForModal);
        }
      }
    } catch (error) {
      console.error("Error submitting harvest record:", error);
      toast.error("Failed to submit harvest record. Please try again.");
      throw error;
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefreshProfile = async () => {
    setLocalProfileLoading(true);
    await getProfile();
    setLocalProfileLoading(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "upload":
        return (
          <UploadHarvestForm
            onSubmit={handleUploadSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case "history":
        return (
          <HarvestHistory records={harvestRecords} isLoading={isLoading} />
        );
      case "profile":
        return (
          <UserProfile
            profile={profile}
            user={user}
            isLoading={localProfileLoading || isLoading}
            onRefresh={handleRefreshProfile}
          />
        );
      // ✅ CHANGE: QR case removed
      default:
        return (
          <HarvestHistory records={harvestRecords} isLoading={isLoading} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <Toaster
        position="top-right"
        containerClassName="z-50"
        containerStyle={{
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #475569",
            fontSize: "14px",
            maxWidth: "400px",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />

      <div className="container mx-auto max-w-7xl">
        <nav className="flex items-center justify-between py-6 mb-8 border-b border-slate-700/50">
          <div>
            <h1 className="text-3xl font-bold text-white">Farmer Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage harvest records and farming documentation
            </p>
            {user && (
              <p className="text-slate-500 text-xs mt-1">
                Welcome back, {user.fullName}
              </p>
            )}
          </div>
          <div className="relative flex gap-3">
            <button
              className="flex items-center gap-2 px-6 py-3 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
              onClick={() => handleSectionChange("profile")}
            >
              <User className="h-5 w-5" />
              Profile
            </button>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <nav className="space-y-2">
                <button
                  onClick={() => handleSectionChange("history")}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 text-left cursor-pointer ${
                    activeSection === "history"
                      ? "bg-green-600/30 border-l-4 border-green-500 text-green-300"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <History className="h-5 w-5 flex-shrink-0" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => handleSectionChange("upload")}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 text-left cursor-pointer ${
                    activeSection === "upload"
                      ? "bg-[#10b981]/30 border-l-4 border-[#34d399] text-[#34d399]"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Upload className="h-5 w-5 flex-shrink-0" />
                  <span>Upload New Record</span>
                </button>
                {/* ✅ CHANGE: QR tracking button removed from sidebar */}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>{renderSection()}</Card>
          </div>
        </div>

        {modalQrData && (
          <QRScannerModal
            qrData={modalQrData}
            onClose={() => setModalQrData(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
