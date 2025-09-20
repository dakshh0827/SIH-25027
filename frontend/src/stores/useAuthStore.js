import { create } from "zustand";
// import { jwtDecode } from 'jwt-decode';
import toast from "react-hot-toast";
import { useReportStore } from "./useReportStore";

const API_BASE_URL = "http://localhost:5000";

const useAuthStore = create((set, get) => ({
  user: null,
  userType: null,
  accessToken: null,
  // token: null,
  isLoading: true,
  profile: null,

  restoreSession: async () => {
    try {
      // Use the new /refresh-token endpoint to restore the session
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // IMPORTANT: This sends cookies with the request
      });

      if (!response.ok) {
        throw new Error("No valid session");
      }

      const { accessToken, user } = await response.json();
      set({ user, accessToken, isLoading: false });
      console.log("Session restored successfully.");
    } catch (error) {
      console.log("No active session to restore.");
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  login: (userData, accessToken) => {
    try {
      set({
        user: userData,
        userType: userData.role,
        accessToken: accessToken,
        isLoading: false,
      });
      localStorage.setItem("token", accessToken);
      const roleDisplayName =
        {
          fpo: "Farmer",
          manufacturer: "Manufacturer",
          laboratory: "Laboratory",
          admin: "Admin",
          farmer: "Farmer",
          lab: "Laboratory",
        }[userData.role.toLowerCase()] || "User";
      toast.success(
        `Welcome, ${
          userData.fullName || userData.name
        }! Logged in as ${roleDisplayName}.`,
        {
          duration: 3000,
          position: "top-right",
          style: { background: "#10b981", color: "#fff" },
        }
      );
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login failed. Please try again.", {
        duration: 4000,
        position: "top-right",
        style: { background: "#ef4444", color: "#fff" },
      });
    }
  },

  logout: async () => {
    const currentUser = get().user;
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn(
        "Logout API call failed, clearing state locally anyway.",
        error
      );
    } finally {
      set({ user: null, accessToken: null, isLoading: false, profile: null });
      // Clear QR data on logout
      useReportStore.getState().clearQRData();
      toast.success(
        currentUser
          ? `Goodbye, ${currentUser.fullName}! You've been logged out.`
          : "You've been logged out successfully.",
        {
          duration: 2000,
          position: "top-right",
          style: { background: "#10b981", color: "#fff" },
        }
      );
    }
  },

  authenticatedFetch: async (url, options = {}) => {
    // This is the correct, new implementation.
    const { accessToken } = get();

    const response = await get()._performFetch(url, options, accessToken);

    if (response.status === 401) {
      console.log("Access token expired. Attempting to refresh...");
      try {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!refreshResponse.ok) throw new Error("Refresh token invalid.");

        const { accessToken: newAccessToken, user } =
          await refreshResponse.json();
        set({ accessToken: newAccessToken, user });

        console.log("Token refreshed. Retrying original request...");
        const retryResponse = await get()._performFetch(
          url,
          options,
          newAccessToken
        );

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({
            message: `API request failed with status ${retryResponse.status}`,
          }));
          throw errorData;
        }
        return retryResponse.json();
      } catch (error) {
        console.error("Failed to refresh token. Logging out.", error);
        get().logout();
        return Promise.reject(
          new Error("Your session has expired. Please log in again.")
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `API request failed with status ${response.status}`,
      }));
      return Promise.reject(errorData);
    }

    return response.json();
  },

  /**
   * Internal helper to perform the actual fetch call.
   */
  _performFetch: async (url, options, token) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return fetch(fullUrl, { ...options, headers, credentials: "include" });
  },

  getProfile: async () => {
    try {
      const { authenticatedFetch } = get();
      // set({ isLoading: true });
      const data = await authenticatedFetch("/api/auth/profile", {
        method: "GET",
      });
      set({ profile: data.profile, user: data.user });
      toast.success("Profile loaded successfully", {
        duration: 2000,
        position: "top-right",
        style: { background: "#10b981", color: "#fff" },
      });
      return data;
    } catch (error) {
      console.error("Error getting profile:", error);
      // set({ isLoading: false });
      let errorMessage = "Failed to load profile";
      if (error.message.includes("HTML")) {
        errorMessage = "Server error - please check if the backend is running";
      } else if (error.message.includes("fetch")) {
        errorMessage = "Network error - please check your connection";
      }
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-right",
        style: { background: "#ef4444", color: "#fff" },
      });
      throw error;
    }
  },

  // FIXED: Correct harvest history fetching
  getHarvestHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "farmer") return;

    const { setHarvestRecords } = useReportStore.getState();

    try {
      showInfo("Fetching harvest history...");
      // FIXED: Use correct endpoint
      const response = await authenticatedFetch("/api/harvests/history");

      // Handle response structure
      const records = response?.data || response || [];
      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || Date.now() + Math.random(),
        createdAt: record.createdAt || new Date().toISOString(),
        status: record.status || "completed",
      }));

      setHarvestRecords(formattedRecords);
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} harvest records.`);
      return formattedRecords;
    } catch (error) {
      console.error("Harvest history fetch error:", error);
      handleApiError(error, "Failed to fetch harvest history.");
      useReportStore.getState().setHarvestRecords([]);
      throw error;
    }
  },

  // NEW: QR history fetching for farmers
  getQRHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "farmer") return;

    const { setQRHistory } = useReportStore.getState();

    try {
      showInfo("Fetching QR history...");
      // Use QR history endpoint
      const response = await authenticatedFetch("/api/harvests/qr-history");

      const qrHistory = response?.data || response || [];
      const safeQRHistory = Array.isArray(qrHistory) ? qrHistory : [];

      setQRHistory(safeQRHistory);
      toast.dismiss();
      showInfo(`Loaded ${safeQRHistory.length} QR codes.`);
      return safeQRHistory;
    } catch (error) {
      console.error("QR history fetch error:", error);
      handleApiError(error, "Failed to fetch QR history.");
      useReportStore.getState().setQRHistory([]);
      throw error;
    }
  },

  // NEW: Combined history fetch for farmers
  getFarmerHistory: async () => {
    const { userType } = get();
    if (userType !== "farmer") return { harvests: [], qrHistory: [] };

    try {
      const [harvests, qrHistory] = await Promise.all([
        get().getHarvestHistory(),
        get().getQRHistory(),
      ]);

      return { harvests, qrHistory };
    } catch (error) {
      console.error("Error fetching farmer history:", error);
      return { harvests: [], qrHistory: [] };
    }
  },

  // in useAuthStore.js

  getManufacturingHistory: async () => {
    // FIX: Use get() to access this store's state, not useAuthStore.getState()
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "manufacturer") {
      console.warn("getManufacturingHistory called by non-manufacturer user");
      return [];
    }

    // FIX: Get the setter function from the correct store (`useReportStore`)
    const { setManufacturingReports } = useReportStore.getState();

    try {
      showInfo("Fetching manufacturing history...");
      const response = await authenticatedFetch(
        "/api/manufacturing_reports/history"
      );

      console.log("Manufacturing history response:", response);

      let records = [];
      if (response?.data) {
        records = response.data;
      } else if (Array.isArray(response)) {
        records = response;
      } else if (response?.success && Array.isArray(response.data)) {
        records = response.data;
      } else {
        console.warn("Unexpected response format:", response);
        records = [];
      }

      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || `temp_${Date.now()}_${Math.random()}`,
        createdAt: record.createdAt || new Date().toISOString(),
        date:
          record.effectiveDate ||
          record.createdAt ||
          new Date().toLocaleDateString(),
        hasQRTracking: !!record.qrTracking,
        qrCode: record.qrTracking?.qrCode || null,
        qrStatus: record.qrTracking?.status || null,
        isPublic: record.qrTracking?.isPublic || false,
        publicUrl: record.qrTracking?.publicUrl || null,
      }));

      // This will now work correctly
      setManufacturingReports(formattedRecords);
      toast.dismiss();

      if (formattedRecords.length > 0) {
        showInfo(`Loaded ${formattedRecords.length} manufacturing reports.`);
      } else {
        showInfo("No manufacturing reports found.");
      }

      return formattedRecords;
    } catch (error) {
      console.error("Failed to fetch manufacturing history:", error);
      handleApiError(error, "Failed to fetch manufacturing history.");
      // This will also work correctly now
      setManufacturingReports([]);
      throw error;
    }
  },

  // NEW: Manufacturing QR history
  getManufacturingQRHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "manufacturer") return;

    try {
      showInfo("Fetching manufacturing QR history...");
      const response = await authenticatedFetch("/api/qr/manufacturer/history");

      const qrHistory = response?.data || [];
      toast.dismiss();
      showInfo(`Loaded ${qrHistory.length} QR codes.`);
      return qrHistory;
    } catch (error) {
      console.error("Manufacturing QR history fetch error:", error);
      handleApiError(error, "Failed to fetch manufacturing QR history.");
      return [];
    }
  },

  getLabHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "laboratory" && userType !== "lab") return;

    const { setLabReports } = useReportStore.getState();

    try {
      showInfo("Fetching lab reports history...");
      const response = await authenticatedFetch("/api/lab_reports/history");

      const records = response?.data || response || [];
      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || Date.now() + Math.random(),
        createdAt: record.createdAt || new Date().toISOString(),
        date:
          record.issuedDate ||
          record.createdAt ||
          new Date().toLocaleDateString(),
        status: record.status || "final",
        testType: record.testType || "Unknown",
        harvestIdentifier: record.harvestIdentifier || "N/A",
      }));

      setLabReports(formattedRecords);
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} lab reports.`);
      return formattedRecords;
    } catch (error) {
      console.error("Lab history fetch error:", error);
      handleApiError(error, "Failed to fetch lab reports history.");
      useReportStore.getState().setLabReports([]);
      throw error;
    }
  },

  // NEW: Lab QR history
  getLabQRHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "laboratory" && userType !== "lab") return;

    try {
      showInfo("Fetching lab QR history...");
      const response = await authenticatedFetch("/api/qr/lab/history");

      const qrHistory = response?.data || [];
      toast.dismiss();
      showInfo(`Loaded ${qrHistory.length} QR codes.`);
      return qrHistory;
    } catch (error) {
      console.error("Lab QR history fetch error:", error);
      handleApiError(error, "Failed to fetch lab QR history.");
      return [];
    }
  },

  // NEW: Available harvests for manufacturers/labs
  getAvailableHarvests: async () => {
    const { authenticatedFetch, showInfo, handleApiError } = get();
    const { setAvailableHarvests } = useReportStore.getState();

    try {
      showInfo("Loading available harvests...");
      const response = await authenticatedFetch("/api/harvests/identifiers");

      const harvests = response?.data || [];
      setAvailableHarvests(harvests);
      toast.dismiss();
      return harvests;
    } catch (error) {
      console.error("Available harvests fetch error:", error);
      handleApiError(error, "Failed to fetch available harvests.");
      setAvailableHarvests([]);
      return [];
    }
  },

  getAdminHarvestReports: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    try {
      showInfo("Fetching all harvest reports...");
      const response = await authenticatedFetch("/api/admin/harvests");

      const records = response?.data || response || [];
      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || Date.now() + Math.random(),
        createdAt: record.createdAt || new Date().toISOString(),
        status: record.status || "completed",
      }));

      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} harvest reports.`);
      return formattedRecords;
    } catch (error) {
      handleApiError(error, "Failed to fetch harvest reports.");
      throw error;
    }
  },

  getAdminManufacturingReports: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    try {
      showInfo("Fetching all manufacturing reports...");
      const response = await authenticatedFetch(
        "/api/admin/manufacturing_reports"
      );

      const records = response?.data || response || [];
      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || Date.now() + Math.random(),
        createdAt: record.createdAt || new Date().toISOString(),
        date:
          record.effectiveDate ||
          record.createdAt ||
          new Date().toLocaleDateString(),
      }));

      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} manufacturing reports.`);
      return formattedRecords;
    } catch (error) {
      handleApiError(error, "Failed to fetch manufacturing reports.");
      throw error;
    }
  },

  getAdminLabReports: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    try {
      showInfo("Fetching all lab reports...");
      const response = await authenticatedFetch("/api/admin/lab_reports");

      const records = response?.data || response || [];
      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || Date.now() + Math.random(),
        createdAt: record.createdAt || new Date().toISOString(),
        date:
          record.issuedDate ||
          record.createdAt ||
          new Date().toLocaleDateString(),
        status: record.status || "final",
        testType: record.testType || "Unknown",
        harvestIdentifier: record.harvestIdentifier || "N/A",
      }));

      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} lab reports.`);
      return formattedRecords;
    } catch (error) {
      console.error("Lab reports fetch error:", error);
      handleApiError(error, "Failed to fetch lab reports.");
      throw error;
    }
  },

  // NEW: Admin QR tracker management
  getAdminQRTrackers: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    try {
      showInfo("Fetching all QR trackers...");
      const response = await authenticatedFetch("/api/qr/admin/all");

      const qrTrackers = response?.data || [];
      toast.dismiss();
      showInfo(`Loaded ${qrTrackers.length} QR trackers.`);
      return qrTrackers;
    } catch (error) {
      console.error("Admin QR trackers fetch error:", error);
      handleApiError(error, "Failed to fetch QR trackers.");
      return [];
    }
  },

  handleApiError: (error, defaultMessage = "An error occurred") => {
    const message =
      error.response?.data?.message || error.message || defaultMessage;
    toast.error(`${message}`, {
      duration: 4000,
      position: "top-right",
      style: { background: "#ef4444", color: "#fff" },
    });
  },

  showSuccess: (message) => {
    toast.success(`${message}`, {
      duration: 3000,
      position: "top-right",
      style: { background: "#10b981", color: "#fff" },
    });
  },

  showWarning: (message) => {
    toast(`${message}`, {
      duration: 4000,
      position: "top-right",
      style: { background: "#f59e0b", color: "#1f2937" },
    });
  },

  showInfo: (message) => {
    toast(`${message}`, {
      duration: 3000,
      position: "top-right",
      style: { background: "#3b82f6", color: "#ffffff" },
    });
  },

  showLoading: (message) => {
    return toast.loading(message, {
      position: "top-right",
      style: { background: "#1e293b", color: "#fff" },
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));

export { useAuthStore };
