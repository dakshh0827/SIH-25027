import React, { useState, useEffect } from "react";
import {
  Upload,
  History,
  User,
  Factory,
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

// Form for uploading a new manufacturing report
const UploadManufacturingReport = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    batchId: "",
    herbUsed: "",
    quantityUsedKg: "",
    processingSteps: "",
    status: "in-progress",
    effectiveDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: "",
    regulatoryTags: [],
    harvestIdentifier: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [qrData, setQRData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.regulatoryTags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        regulatoryTags: [...prev.regulatoryTags, tagInput.trim()],
      }));
      setTagInput("");
      toast.success(`Tag "${tagInput.trim()}" added!`, { duration: 2000 });
    } else if (formData.regulatoryTags.includes(tagInput.trim())) {
      toast.error("Tag already exists!", { duration: 2000 });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      regulatoryTags: prev.regulatoryTags.filter((tag) => tag !== tagToRemove),
    }));
    toast.success(`Tag "${tagToRemove}" removed!`, { duration: 2000 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onSubmit(formData);
      if (result && result.qr) {
        toast.success(
          `Manufacturing report created with QR code: ${result.qr.qrCode}!`,
          { duration: 5000 }
        );
        setQRData(result.qr);
      } else if (result && result.qrUpdate) {
        toast.success(
          `Manufacturing report linked to QR ${result.qrUpdate.qrCode}!`,
          { duration: 5000 }
        );
      }
      setFormData({
        batchId: "",
        herbUsed: "",
        quantityUsedKg: "",
        processingSteps: "",
        status: "in-progress",
        effectiveDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        notes: "",
        regulatoryTags: [],
        harvestIdentifier: "",
      });
      setTagInput("");
      setQRData(null);
    } catch (error) {
      console.error("Error submitting manufacturing report:", error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionTitle title="New Manufacturing Report" />

        <div>
          <label
            htmlFor="batchId"
            className="block text-sm font-medium text-slate-300"
          >
            Batch ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="batchId"
            id="batchId"
            value={formData.batchId}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="e.g., BATCH-2025-001"
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="harvestIdentifier"
            className="block text-sm font-medium text-slate-300 mb-1"
          >
            Harvest Identifier (to link with QR)
          </label>
          <input
            type="text"
            name="harvestIdentifier"
            id="harvestIdentifier"
            value={formData.harvestIdentifier}
            onChange={handleChange}
            placeholder="e.g., HARV-2025-018"
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-400">
            Enter the harvest identifier to link this manufacturing report with
            the product QR code
          </p>
        </div>

        <div>
          <label
            htmlFor="herbUsed"
            className="block text-sm font-medium text-slate-300"
          >
            Herb Used <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="herbUsed"
            id="herbUsed"
            value={formData.herbUsed}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="e.g., Turmeric, Ashwagandha"
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="quantityUsedKg"
            className="block text-sm font-medium text-slate-300"
          >
            Quantity Used (kg) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="quantityUsedKg"
            id="quantityUsedKg"
            value={formData.quantityUsedKg}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            step="0.01"
            min="0"
            placeholder="e.g., 250.5"
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="processingSteps"
            className="block text-sm font-medium text-slate-300"
          >
            Processing Steps <span className="text-red-400">*</span>
          </label>
          <textarea
            name="processingSteps"
            id="processingSteps"
            value={formData.processingSteps}
            onChange={handleChange}
            rows="4"
            required
            disabled={isSubmitting}
            placeholder="Describe the complete manufacturing process, including cleaning, drying, grinding, and packaging steps..."
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none resize-vertical disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-slate-300"
          >
            Manufacturing Status <span className="text-red-400">*</span>
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
          >
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="effectiveDate"
            className="block text-sm font-medium text-slate-300"
          >
            Manufacturing Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="effectiveDate"
            id="effectiveDate"
            value={formData.effectiveDate}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="expiryDate"
            className="block text-sm font-medium text-slate-300"
          >
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            id="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-slate-400">
            Leave blank if product doesn't have an expiry date
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-300"
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
            placeholder="Any additional information about the manufacturing process..."
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none resize-vertical disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="tagInput"
            className="block text-sm font-medium text-slate-300"
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
              placeholder="e.g., AYUSH-GMP, ISO-9001"
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50"
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
              className="flex-shrink-0 px-4 py-3 bg-blue-600/30 text-blue-300 border border-blue-500 hover:bg-blue-700/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
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
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <span className="text-blue-400 hover:text-blue-200">×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-4 py-3 bg-[#10b981] border border-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> Submit Manufacturing Report
            </>
          )}
        </button>
      </form>

      {qrData && (
        <div className="mt-6 p-4 bg-slate-800/50 border border-green-500/50">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-green-400">
              QR Code Generated
            </h4>
          </div>
          <p className="text-slate-300">
            QR Code:{" "}
            <span className="font-mono text-green-400">{qrData.qrCode}</span>
          </p>
          <p className="text-slate-300">
            Status: <span className="text-green-400">{qrData.status}</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            This QR code links your manufacturing report with the harvest data
            for full traceability.
          </p>
        </div>
      )}
    </div>
  );
};

const ManufacturingHistory = ({ reports, isLoading }) => {
  const handleReportClick = (report) => {
    toast.success(`Viewing details for batch ${report.batchId}`, {
      duration: 2000,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading manufacturing history..." />;
  }

  const safeReports = Array.isArray(reports) ? reports : [];

  return (
    <div className="space-y-4">
      <SectionTitle title="Manufacturing Reports History" />
      {safeReports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Batch ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Herb Used
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Quantity (kg)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Date
                </th>
                {/* ✅ CHANGE: Reverted table header to Harvest ID */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Harvest ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
              {safeReports.map((report, index) => (
                <tr
                  key={report.id || index}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleReportClick(report)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {report.batchId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.herbUsed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.quantityUsedKg || report.quantityUsed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
                        report.status === "completed"
                          ? "bg-green-600/30 text-green-400"
                          : report.status === "in-progress"
                          ? "bg-blue-600/30 text-blue-400"
                          : report.status === "cancelled"
                          ? "bg-red-600/30 text-red-400"
                          : "bg-yellow-600/30 text-yellow-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(report.effectiveDate || report.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">
                    {/* ✅ CHANGE: Reverted to display Harvest ID */}
                    {report.harvestIdentifier || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Factory className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            No manufacturing reports found
          </p>
          <p className="text-slate-400 text-sm">
            Submit your first manufacturing report to get started!
          </p>
        </div>
      )}
    </div>
  );
};

const ManufacturerProfile = ({ profile, user, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Manufacturer Profile" />
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-[#34d399] animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Manufacturer Profile" />
        <div className="text-center py-12">
          <User className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">Profile not found</p>
          <p className="text-slate-400 text-sm mb-4">
            Unable to load your profile information.
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
        <SectionTitle title="Manufacturer Profile" />
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
            <Factory className="h-12 w-12 text-[#34d399]" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">
              {profile.manufacturerName}
            </h4>
            <p className="text-sm text-slate-400">
              Authorized Representative: {profile.authorizedRepresentative}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Profile created: {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">AYUSH License Number</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.ayushLicenseNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Registration Number</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.regNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">PAN</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.pan}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">GSTIN</p>
            <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
              {profile.gstin}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Registered Address</p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 border border-slate-700/30">
            {profile.registeredAddress}
          </p>
        </div>
      </div>
    </div>
  );
};

const ManufacturerDashboard = () => {
  const [activeSection, setActiveSection] = useState("history");
  const [modalQrData, setModalQrData] = useState(null);

  const {
    isSubmitting,
    submitReport,
    manufacturingReports,
    fetchManufacturingHistory,
  } = useReportStore();
  const { logout, getProfile, profile, user, isLoading, authenticatedFetch } =
    useAuthStore();

  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && user) {
        try {
          await getProfile();
          await fetchManufacturingHistory(authenticatedFetch);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      }
    };
    fetchData();
  }, [
    isLoading,
    user,
    getProfile,
    fetchManufacturingHistory,
    authenticatedFetch,
  ]);

  const handleUploadSubmit = async (formData) => {
    try {
      const result = await submitReport({
        reportType: "manufacturer",
        data: formData,
      });
      if (result) {
        fetchManufacturingHistory(authenticatedFetch);
        toast.success(
          `Manufacturing report for batch ${formData.batchId} submitted successfully!`
        );

        // Open the modal with the new QR data
        if (result.qrUpdate) {
          const dataForModal = {
            ...result.report,
            ...result.qrUpdate,
            productName:
              result.qrUpdate.productName || `Batch ${formData.batchId}`,
          };
          setModalQrData(dataForModal);
        }
        return result;
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit manufacturing report. Please try again.");
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
    setProfileLoading(true);
    await getProfile();
    setProfileLoading(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "upload":
        return (
          <UploadManufacturingReport
            onSubmit={handleUploadSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case "history":
        return (
          <ManufacturingHistory
            reports={manufacturingReports}
            isLoading={isLoading}
          />
        );
      case "profile":
        return (
          <ManufacturerProfile
            profile={profile}
            user={user}
            isLoading={profileLoading || isLoading}
            onRefresh={handleRefreshProfile}
          />
        );
      default:
        return (
          <ManufacturingHistory
            reports={manufacturingReports}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <Toaster />
      <div className="container mx-auto max-w-7xl">
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold">Manufacturer Dashboard</h1>
          <div className="relative flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
              onClick={() => handleSectionChange("profile")}
            >
              <User className="h-5 w-5" />
              Profile
            </button>
          </div>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <nav className="space-y-2">
                <button
                  onClick={() => handleSectionChange("history")}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 cursor-pointer hover:bg-green-600/20 ${
                    activeSection === "history"
                      ? "bg-green-600/30 border-l-4 border-green-500"
                      : "text-slate-400"
                  }`}
                >
                  <History className="h-5 w-5" />
                  History
                </button>
                <button
                  onClick={() => handleSectionChange("upload")}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 cursor-pointer hover:bg-[#10b981]/20 ${
                    activeSection === "upload"
                      ? "bg-[#10b981]/30 border-l-4 border-[#34d399]"
                      : "text-slate-400"
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  Upload New Report
                </button>
              </nav>
            </Card>
          </div>
          <div className="md:col-span-3">
            <Card>{renderSection()}</Card>
          </div>

          {modalQrData && (
            <QRScannerModal
              qrData={modalQrData}
              onClose={() => setModalQrData(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
