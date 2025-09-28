import { create } from "zustand";
import toast from "react-hot-toast";

const API_BASE_URL = "https://fe8d7288e956.ngrok-free.app";

const usePublicStore = create((set, get) => ({
  // State
  publicQRCodes: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  searchTerm: "",
  statusFilter: "", // Filter by status
  stats: null,
  selectedQR: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSelectedQR: (qr) => set({ selectedQR: qr }),

  /**
   * Helper function to fix QR image URL if it contains localhost
   */
  fixQRImageUrl: (qrImageUrl) => {
    if (!qrImageUrl) return null;

    // If it's already a data URL with the correct content, return as is
    if (
      qrImageUrl.startsWith("data:image") &&
      !qrImageUrl.includes("localhost")
    ) {
      return qrImageUrl;
    }

    // If it contains localhost, return null to force using scanner endpoint
    if (qrImageUrl.includes("localhost") || qrImageUrl.includes("127.0.0.1")) {
      return null;
    }

    return qrImageUrl;
  },

  /**
   * Get status display info for UI
   */
  getStatusInfo: (status) => {
    const statusMap = {
      INITIALIZED: {
        label: "Initialized",
        color: "blue",
        description: "Harvest data recorded",
      },
      MANUFACTURING: {
        label: "Manufacturing",
        color: "orange",
        description: "Processing in progress",
      },
      TESTING: {
        label: "Testing",
        color: "purple",
        description: "Lab testing completed",
      },
      COMPLETED: {
        label: "Completed",
        color: "green",
        description: "All stages completed",
      },
      PUBLIC: {
        label: "Public",
        color: "emerald",
        description: "Available to consumers",
      },
    };
    return (
      statusMap[status] || {
        label: status,
        color: "gray",
        description: "Unknown status",
      }
    );
  },

  /**
   * Fetch QR codes with pagination and search (accessible at all stages)
   */
  fetchPublicQRCodes: async (
    page = 1,
    limit = 12,
    search = "",
    status = ""
  ) => {
    try {
      set({ isLoading: true, error: null });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/public/qr-codes?${params}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch QR codes");
      }

      // Map all QR codes to use ngrok scanner endpoint directly
      const mappedQRCodes = data.data.qrCodes.map((qr) => ({
        ...qr,
        // Always use the scanner endpoint for consistent QR images
        qrImageUrl: `${API_BASE_URL}/api/public/qr/${qr.qrCode}/scanner`,
        scannerImageUrl: `${API_BASE_URL}/api/public/qr/${qr.qrCode}/scanner`,
        // Keep original for reference if needed
        originalQrImageUrl: qr.qrImageUrl,
        // Add report URL for convenience
        reportUrl: `${API_BASE_URL}/api/qr/report/${qr.qrCode}`,
        shareUrl: `${API_BASE_URL}/report/${qr.qrCode}`,
        // Add status info for UI
        statusInfo: get().getStatusInfo(qr.status),
      }));

      console.log(
        "Mapped QR codes with scanner endpoints:",
        mappedQRCodes.length
      );

      set({
        publicQRCodes: mappedQRCodes,
        pagination: {
          ...data.data.pagination,
          hasNext: data.data.pagination.page < data.data.pagination.totalPages,
          hasPrev: data.data.pagination.page > 1,
        },
        isLoading: false,
        error: null,
      });

      return {
        ...data.data,
        qrCodes: mappedQRCodes,
      };
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      set({
        isLoading: false,
        error: error.message,
        publicQRCodes: [],
      });
      toast.error("Failed to load QR codes", {
        duration: 4000,
        position: "top-right",
      });
      throw error;
    }
  },

  /**
   * Search QR codes
   */
  searchPublicQRCodes: async (searchTerm) => {
    try {
      set({ searchTerm });
      const { fetchPublicQRCodes, statusFilter } = get();
      await fetchPublicQRCodes(1, 12, searchTerm, statusFilter);
    } catch (error) {
      console.error("Error searching QR codes:", error);
      toast.error("Search failed. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
  },

  /**
   * Filter by status
   */
  filterByStatus: async (status) => {
    try {
      set({ statusFilter: status });
      const { fetchPublicQRCodes, searchTerm } = get();
      await fetchPublicQRCodes(1, 12, searchTerm, status);
    } catch (error) {
      console.error("Error filtering QR codes:", error);
      toast.error("Filter failed. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
  },

  /**
   * Load next page of QR codes
   */
  loadNextPage: async () => {
    try {
      const { pagination, searchTerm, statusFilter, fetchPublicQRCodes } =
        get();
      if (!pagination.hasNext) return;

      await fetchPublicQRCodes(
        pagination.page + 1,
        pagination.limit,
        searchTerm,
        statusFilter
      );
    } catch (error) {
      console.error("Error loading next page:", error);
    }
  },

  /**
   * Load previous page of QR codes
   */
  loadPreviousPage: async () => {
    try {
      const { pagination, searchTerm, statusFilter, fetchPublicQRCodes } =
        get();
      if (!pagination.hasPrev) return;

      await fetchPublicQRCodes(
        pagination.page - 1,
        pagination.limit,
        searchTerm,
        statusFilter
      );
    } catch (error) {
      console.error("Error loading previous page:", error);
    }
  },

  /**
   * Fetch statistics (includes breakdown by status for all QR codes)
   */
  fetchPublicStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/stats`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        set({ stats: data.data });
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics", {
        duration: 3000,
        position: "top-right",
      });
    }
  },

  /**
   * Get QR preview data (accessible at all stages)
   */
  getQRPreview: async (qrCode) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/public/qr/${qrCode}/preview`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("QR code not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          ...data.data,
          statusInfo: get().getStatusInfo(data.data.status),
        };
      } else {
        throw new Error(data.message || "Failed to fetch QR preview");
      }
    } catch (error) {
      console.error("Error fetching QR preview:", error);
      toast.error(error.message, {
        duration: 3000,
        position: "top-right",
      });
      throw error;
    }
  },

  /**
   * Get QR image URL - always use scanner endpoint for consistency
   */
  getQRImageUrl: (qr) => {
    // Always return the scanner endpoint to ensure ngrok URL
    return `${API_BASE_URL}/api/public/qr/${qr.qrCode}/scanner`;
  },

  /**
   * Get scanner QR image URL
   */
  getScannerImageUrl: (qrCode) => {
    return `${API_BASE_URL}/api/public/qr/${qrCode}/scanner`;
  },

  /**
   * Get report URL
   */
  getReportUrl: (qrCode) => {
    return `${API_BASE_URL}/api/qr/report/${qrCode}`;
  },

  /**
   * Get shareable report URL (for frontend routing)
   */
  getShareableReportUrl: (qrCode) => {
    return `${API_BASE_URL}/report/${qrCode}`;
  },

  /**
   * Download scanner QR image
   */
  downloadScannerQR: async (qrCode, productName) => {
    try {
      // Always use the scanner endpoint
      const imageUrl = `${API_BASE_URL}/api/public/qr/${qrCode}/scanner`;

      // For downloads, we need to fetch the image and create a blob
      const response = await fetch(imageUrl, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch QR image");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `scanner-qr-${qrCode}-${
        productName?.replace(/\s+/g, "-") || "product"
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      toast.success("QR code downloaded successfully!", {
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code", {
        duration: 3000,
        position: "top-right",
      });
    }
  },

  /**
   * Share report URL
   */
  shareReportURL: async (qrCode, productName) => {
    try {
      // Use the shareable frontend route
      const reportUrl = get().getShareableReportUrl(qrCode);

      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: `${productName} - Traceability Report`,
          text: `View the complete traceability report for ${productName}`,
          url: reportUrl,
        });
        toast.success("Shared successfully!", {
          duration: 2000,
          position: "top-right",
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(reportUrl);
        toast.success("Report URL copied to clipboard!", {
          duration: 2000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error sharing report URL:", error);
      toast.error("Failed to share report", {
        duration: 3000,
        position: "top-right",
      });
    }
  },

  /**
   * Clear all data
   */
  clearPublicData: () => {
    set({
      publicQRCodes: [],
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      searchTerm: "",
      statusFilter: "",
      stats: null,
      selectedQR: null,
    });
  },

  /**
   * Refresh current page
   */
  refreshCurrentPage: async () => {
    try {
      const { pagination, searchTerm, statusFilter, fetchPublicQRCodes } =
        get();
      await fetchPublicQRCodes(
        pagination.page,
        pagination.limit,
        searchTerm,
        statusFilter
      );
    } catch (error) {
      console.error("Error refreshing page:", error);
    }
  },
}));

export { usePublicStore };
