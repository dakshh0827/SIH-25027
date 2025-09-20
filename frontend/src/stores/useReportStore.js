// stores/useReportStore.js - Updated with identifier-based QR integration
import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const useReportStore = create((set, get) => ({
  isSubmitting: false,
  harvestRecords: [],
  manufacturingReports: [],
  labRecords: [],
  qrData: null, // Store QR data from successful submissions
  qrHistory: [], // Store QR tracking history for current user
  availableHarvests: [], // Available harvest identifiers for manufacturers/labs

  setHarvestRecords: (records) => {
    set({ harvestRecords: Array.isArray(records) ? records : [] });
  },

  setManufacturingReports: (reports) => {
    set({ manufacturingReports: Array.isArray(reports) ? reports : [] });
  },

  setLabRecords: (reports) => {
    set({ labRecords: Array.isArray(reports) ? reports : [] });
  },

  // Backward compatibility
  setLabReports: (reports) => {
    set({ labRecords: Array.isArray(reports) ? reports : [] });
  },

  // QR data management
  setQRData: (qrData) => {
    set({ qrData });
  },

  clearQRData: () => {
    set({ qrData: null });
  },

  setQRHistory: (qrHistory) => {
    set({ qrHistory: Array.isArray(qrHistory) ? qrHistory : [] });
  },

  setAvailableHarvests: (harvests) => {
    set({ availableHarvests: Array.isArray(harvests) ? harvests : [] });
  },

  // Fetch available harvest identifiers for manufacturers/labs
  fetchAvailableHarvests: async () => {
    const { authenticatedFetch, handleApiError } = useAuthStore.getState();

    try {
      const response = await authenticatedFetch("/api/harvests/identifiers");
      const harvests = response.data || [];

      set({ availableHarvests: harvests });
      return harvests;
    } catch (error) {
      console.error("Error fetching available harvests:", error);
      handleApiError(error, "Failed to fetch available harvests");
      set({ availableHarvests: [] });
      return [];
    }
  },

  // Get harvest details by identifier
  getHarvestByIdentifier: async (identifier) => {
    const { authenticatedFetch, handleApiError } = useAuthStore.getState();

    try {
      const response = await authenticatedFetch(
        `/api/harvests/by-identifier/${identifier}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching harvest by identifier:", error);
      handleApiError(error, "Failed to fetch harvest details");
      throw error;
    }
  },

  submitReport: async ({ reportType, data }) => {
    set({ isSubmitting: true });
    const { authenticatedFetch, showSuccess, handleApiError } =
      useAuthStore.getState();

    let endpoint;
    let body;

    try {
      if (reportType === "farmer") {
        endpoint = "/api/harvests";
        const formData = new FormData();

        for (const key in data) {
          if (data[key] instanceof File) {
            formData.append(key, data[key]);
          } else if (key === "regulatoryTags" && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        }
        body = formData;
      } else if (reportType === "manufacturer") {
        endpoint = "/api/manufacturing_reports";

        // FIXED: Validate required fields for manufacturer report
        if (!data.harvestIdentifier) {
          throw new Error(
            "Harvest identifier is required for manufacturing reports"
          );
        }
        if (!data.batchId) {
          throw new Error("Batch ID is required for manufacturing reports");
        }
        if (!data.herbUsed) {
          throw new Error("Herb used is required for manufacturing reports");
        }
        if (!data.quantityUsedKg || isNaN(parseFloat(data.quantityUsedKg))) {
          throw new Error(
            "Valid quantity used (kg) is required for manufacturing reports"
          );
        }
        if (!data.processingSteps) {
          throw new Error(
            "Processing steps are required for manufacturing reports"
          );
        }

        // FIXED: Properly format the manufacturing report data
        const manufacturingData = {
          batchId: data.batchId.toString().trim(),
          herbUsed: data.herbUsed.toString().trim(),
          quantityUsedKg: parseFloat(data.quantityUsedKg),
          processingSteps: data.processingSteps.toString().trim(),
          harvestIdentifier: data.harvestIdentifier.toString().trim(),
          status: data.status || "in-progress",
          effectiveDate: data.effectiveDate || new Date().toISOString(),
          expiryDate: data.expiryDate || null,
          notes: data.notes || "",
          regulatoryTags: Array.isArray(data.regulatoryTags)
            ? data.regulatoryTags
            : data.regulatoryTags
            ? [data.regulatoryTags]
            : [],
        };

        console.log("Submitting manufacturing data:", manufacturingData);
        body = JSON.stringify(manufacturingData);
      } else if (reportType === "lab") {
        endpoint = "/api/lab_reports";
        const formData = new FormData();

        // Ensure harvestIdentifier is included for QR linking
        if (!data.harvestIdentifier) {
          throw new Error("Harvest identifier is required for lab reports");
        }

        for (const key in data) {
          if (data[key] instanceof File) {
            formData.append(key, data[key]);
          } else if (key === "regulatoryTags" && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        }
        body = formData;
      } else {
        throw new Error(`Invalid report type: ${reportType}`);
      }

      const options = {
        method: "POST",
        body: body,
      };

      if (!(body instanceof FormData)) {
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      console.log(`Submitting ${reportType} report to ${endpoint}`);
      const result = await authenticatedFetch(endpoint, options);

      // FIXED: Better response handling
      if (!result) {
        throw new Error("No response received from server");
      }

      console.log(`${reportType} report submission result:`, result);

      // Handle QR data in response
      if (result.qr) {
        // Store QR data for immediate use
        set({ qrData: result.qr });

        showSuccess(
          `${reportType} report submitted with QR code: ${result.qr.qrCode}!`
        );

        // Additional QR-specific notification
        setTimeout(() => {
          toast(
            `QR Code ${result.qr.qrCode} generated! Product tracking initiated.`,
            {
              icon: "📱",
              duration: 5000,
            }
          );
        }, 1500);
      } else if (result.qrUpdate && result.qrUpdate.updated) {
        showSuccess(
          `${reportType} report submitted and linked to QR ${result.qrUpdate.qrCode}!`
        );

        // QR update notification
        setTimeout(() => {
          toast(
            `Product journey updated! QR ${result.qrUpdate.qrCode} now includes ${reportType} data.`,
            {
              icon: "🔄",
              duration: 4000,
            }
          );
        }, 1500);
      } else {
        showSuccess(
          `${
            reportType.charAt(0).toUpperCase() + reportType.slice(1)
          } report submitted successfully!`
        );
      }

      set({ isSubmitting: false });

      // FIXED: Refresh the manufacturing history after successful submission
      if (reportType === "manufacturer") {
        try {
          await get().getManufacturingHistory();
        } catch (refreshError) {
          console.error(
            "Failed to refresh manufacturing history:",
            refreshError
          );
          // Don't throw this error as the main submission was successful
        }
      }

      return result; // Return full result including QR data
    } catch (error) {
      console.error(`Error submitting ${reportType} report:`, error);

      let errorMessage = `Failed to submit ${reportType} report. Please try again.`;

      if (error.message?.includes("validation")) {
        errorMessage = "Please check all required fields and try again.";
      } else if (error.message?.includes("Network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("QR")) {
        errorMessage =
          "Report submitted but QR linking failed. Contact admin if needed.";
      } else if (error.message?.includes("Harvest identifier")) {
        errorMessage = "Please select a valid harvest identifier.";
      } else if (error.message?.includes("Batch ID")) {
        errorMessage = "Please provide a valid batch ID.";
      } else if (error.message?.includes("required")) {
        errorMessage = error.message; // Use the specific validation message
      } else if (error.errors) {
        const firstError = error.errors[0];
        errorMessage =
          `${firstError?.field}: ${firstError?.message}` || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      handleApiError(error, errorMessage);
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Fetch QR history for the current user based on role
  fetchQRHistory: async (userRole) => {
    const { authenticatedFetch, handleApiError, showInfo } =
      useAuthStore.getState();

    try {
      let endpoint;
      switch (userRole) {
        case "farmer":
          endpoint = "/api/qr/farmer/history";
          break;
        case "manufacturer":
          endpoint = "/api/qr/manufacturer/history";
          break;
        case "lab":
          endpoint = "/api/qr/lab/history";
          break;
        default:
          console.warn("Invalid user role for QR history fetch");
          return [];
      }

      showInfo("Loading QR history...");
      const response = await authenticatedFetch(endpoint);
      const qrHistory = response.data || [];

      set({ qrHistory });

      if (qrHistory.length > 0) {
        showInfo(`Found ${qrHistory.length} QR code(s) in your history.`);
      }

      return qrHistory;
    } catch (error) {
      console.error("Error fetching QR history:", error);
      handleApiError(error, "Failed to fetch QR tracking history");
      set({ qrHistory: [] });
      return [];
    }
  },

  // Get QR tracker details
  getQRTracker: async (qrCode) => {
    const { authenticatedFetch, handleApiError } = useAuthStore.getState();

    try {
      const response = await authenticatedFetch(`/api/qr/track/${qrCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching QR tracker:", error);
      handleApiError(error, "Failed to fetch QR tracker details");
      throw error;
    }
  },

  // Get QR tracker by harvest identifier
  getQRTrackerByHarvest: async (harvestIdentifier) => {
    const { authenticatedFetch, handleApiError } = useAuthStore.getState();

    try {
      const response = await authenticatedFetch(
        `/api/qr/by-harvest/${harvestIdentifier}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching QR tracker by harvest:", error);
      handleApiError(error, "Failed to fetch QR tracker for this harvest");
      throw error;
    }
  },

  // Get public QR data (for consumers)
  getPublicQRData: async (qrCode) => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/qr/public/${qrCode}`
      );

      if (!response.ok) {
        throw new Error("QR code not found or not yet public");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching public QR data:", error);
      throw error;
    }
  },

  // Get all public QR codes for browsing
  getPublicQRList: async (limit = 20, offset = 0) => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/qr/public?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch public QR codes");
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching public QR list:", error);
      return [];
    }
  },

  // Download QR code image
  downloadQRImage: (qrImageUrl, qrCode) => {
    if (!qrImageUrl) {
      toast.error("QR image not available");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = qrImageUrl;
      link.download = `QR_Code_${qrCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`QR code ${qrCode} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading QR image:", error);
      toast.error("Failed to download QR code image");
    }
  },

  // Share QR tracking URL
  shareQRUrl: async (publicUrl, productName = "Product") => {
    if (!publicUrl) {
      toast.error("No tracking URL available");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Track ${productName}`,
          text: `Track the journey of this Ayurvedic product from farm to shelf`,
          url: publicUrl,
        });
        toast.success("Tracking link shared successfully!");
      } else {
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Tracking link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing QR URL:", error);

      // Fallback: try to copy to clipboard
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Tracking link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to share tracking link");
      }
    }
  },

  // Clear all QR-related data (useful for logout)
  clearQRData: () => {
    set({
      qrData: null,
      qrHistory: [],
      availableHarvests: [],
    });
  },

  // Validate harvest identifier exists
  validateHarvestIdentifier: async (identifier) => {
    try {
      const harvestData = await get().getHarvestByIdentifier(identifier);
      return !!harvestData;
    } catch (error) {
      return false;
    }
  },

  // Get QR status for a harvest identifier
  getQRStatusForHarvest: async (harvestIdentifier) => {
    try {
      const qrTracker = await get().getQRTrackerByHarvest(harvestIdentifier);
      return {
        exists: true,
        qrCode: qrTracker.qrCode,
        status: qrTracker.status,
        isPublic: qrTracker.isPublic,
        publicUrl: qrTracker.publicUrl,
      };
    } catch (error) {
      return {
        exists: false,
        qrCode: null,
        status: null,
        isPublic: false,
        publicUrl: null,
      };
    }
  },
}));

export { useReportStore };
