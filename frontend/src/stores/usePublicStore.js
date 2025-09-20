import { create } from "zustand";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

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
  stats: null,
  selectedQR: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSelectedQR: (qr) => set({ selectedQR: qr }),

  /**
   * Fetch public QR codes with pagination and search
   */
  fetchPublicQRCodes: async (page = 1, limit = 12, search = "") => {
    try {
      set({ isLoading: true, error: null });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/public/qr-codes?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch QR codes");
      }

      set({
        publicQRCodes: data.data.qrCodes,
        pagination: data.data.pagination,
        isLoading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      console.error("Error fetching public QR codes:", error);
      set({
        isLoading: false,
        error: error.message,
        publicQRCodes: [],
      });
      toast.error("Failed to load public QR codes", {
        duration: 4000,
        position: "top-right",
      });
      throw error;
    }
  },

  /**
   * Search public QR codes
   */
  searchPublicQRCodes: async (searchTerm) => {
    try {
      set({ searchTerm });
      const { fetchPublicQRCodes } = get();
      await fetchPublicQRCodes(1, 12, searchTerm);
    } catch (error) {
      console.error("Error searching QR codes:", error);
      toast.error("Search failed. Please try again.", {
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
      const { pagination, searchTerm, fetchPublicQRCodes } = get();
      if (!pagination.hasNext) return;

      await fetchPublicQRCodes(
        pagination.page + 1,
        pagination.limit,
        searchTerm
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
      const { pagination, searchTerm, fetchPublicQRCodes } = get();
      if (!pagination.hasPrev) return;

      await fetchPublicQRCodes(
        pagination.page - 1,
        pagination.limit,
        searchTerm
      );
    } catch (error) {
      console.error("Error loading previous page:", error);
    }
  },

  /**
   * Fetch public statistics
   */
  fetchPublicStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/stats`);

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
      console.error("Error fetching public stats:", error);
      toast.error("Failed to load statistics", {
        duration: 3000,
        position: "top-right",
      });
    }
  },

  /**
   * Get QR preview data
   */
  getQRPreview: async (qrCode) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/public/qr/${qrCode}/preview`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("QR code not found or not public");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
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
   * Download scanner QR image
   */
  downloadScannerQR: async (qrCode, productName) => {
    try {
      const imageUrl = get().getScannerImageUrl(qrCode);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `scanner-qr-${qrCode}-${
        productName?.replace(/\s+/g, "-") || "product"
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
      const reportUrl = `${window.location.origin}/report/${qrCode}`;

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
      stats: null,
      selectedQR: null,
    });
  },

  /**
   * Refresh current page
   */
  refreshCurrentPage: async () => {
    try {
      const { pagination, searchTerm, fetchPublicQRCodes } = get();
      await fetchPublicQRCodes(pagination.page, pagination.limit, searchTerm);
    } catch (error) {
      console.error("Error refreshing page:", error);
    }
  },
}));

export { usePublicStore };
