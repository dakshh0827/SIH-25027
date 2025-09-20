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

  // checkAuth: () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (token) {
  //       const decoded = jwtDecode(token);
  //       if (decoded.exp * 1000 > Date.now()) {
  //         set({ user: decoded, userType: decoded.role, token: token });
  //         toast.success("Welcome back! Session restored.", {
  //           duration: 2000,
  //           position: "top-right",
  //           style: { background: "#10b981", color: "#fff" },
  //         });
  //       } else {
  //         set({ user: null, userType: null, token: null, profile: null });
  //         localStorage.removeItem("token");
  //         toast.error("Your session has expired. Please log in again.", {
  //           duration: 4000,
  //           position: "top-right",
  //           style: { background: "#ef4444", color: "#fff" },
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error checking auth:", error);
  //     set({ user: null, userType: null, token: null, profile: null });
  //     localStorage.removeItem("token");
  //     toast.error("Authentication error. Please log in again.", {
  //       duration: 4000,
  //       position: "top-right",
  //       style: { background: "#ef4444", color: "#fff" },
  //     });
  //   }
  // },

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
      // FIX: Removed localStorage.removeItem("token")
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

  getHarvestHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "farmer") return;

    const { setHarvestRecords } = useReportStore.getState();
    // set({ isLoading: true });

    try {
      showInfo("Fetching harvest history...");
      const records = await authenticatedFetch("/api/harvests");

      const safeRecords = Array.isArray(records) ? records : [];

      const formattedRecords = safeRecords.map((record) => ({
        ...record,
        id: record.id || record._id || Date.now() + Math.random(),
        createdAt: record.createdAt || new Date().toISOString(),
        status: record.status || "Pending",
      }));

      setHarvestRecords(formattedRecords);
      // set({ isLoading: false });
      toast.dismiss();
      showInfo("Harvest history updated.");
      return formattedRecords;
    } catch (error) {
      handleApiError(error, "Failed to fetch harvest history.");
      // set({ isLoading: false });
      useReportStore.getState().setHarvestRecords([]);
      throw error;
    }
  },

  getManufacturingHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "manufacturer") return;

    const { setManufacturingReports } = useReportStore.getState();
    // set({ isLoading: true });

    try {
      showInfo("Fetching manufacturing history...");
      const response = await authenticatedFetch("/api/manufacturing_reports");

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

      setManufacturingReports(formattedRecords);
      // set({ isLoading: false });
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} manufacturing reports.`);
      return formattedRecords;
    } catch (error) {
      handleApiError(error, "Failed to fetch manufacturing history.");
      // set({ isLoading: false });
      useReportStore.getState().setManufacturingReports([]);
      throw error;
    }
  },

  getLabHistory: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "laboratory" && userType !== "lab") return;

    const { setLabReports } = useReportStore.getState();
    // set({ isLoading: true });

    try {
      showInfo("Fetching lab reports history...");
      const response = await authenticatedFetch("/api/lab_reports");

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
        manufacturingReportId: record.manufacturingReport?.batchId || "N/A",
      }));

      setLabReports(formattedRecords);
      // set({ isLoading: false });
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} lab reports.`);
      return formattedRecords;
    } catch (error) {
      console.error("Lab history fetch error:", error);
      handleApiError(error, "Failed to fetch lab reports history.");
      // set({ isLoading: false });
      useReportStore.getState().setLabReports([]);
      throw error;
    }
  },

  getAdminHarvestReports: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    // set({ isLoading: true });

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

      // set({ isLoading: false });
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} harvest reports.`);
      return formattedRecords;
    } catch (error) {
      handleApiError(error, "Failed to fetch harvest reports.");
      // set({ isLoading: false });
      throw error;
    }
  },

  getAdminManufacturingReports: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    // set({ isLoading: true });

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

      // set({ isLoading: false });
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} manufacturing reports.`);
      return formattedRecords;
    } catch (error) {
      handleApiError(error, "Failed to fetch manufacturing reports.");
      // set({ isLoading: false });
      throw error;
    }
  },

  getAdminLabReports: async () => {
    const { authenticatedFetch, showInfo, handleApiError, userType } = get();
    if (userType !== "admin") return [];

    // set({ isLoading: true });

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
        manufacturingReportId: record.manufacturingReportId || "N/A",
      }));

      // set({ isLoading: false });
      toast.dismiss();
      showInfo(`Loaded ${formattedRecords.length} lab reports.`);
      return formattedRecords;
    } catch (error) {
      console.error("Lab reports fetch error:", error);
      handleApiError(error, "Failed to fetch lab reports.");
      // set({ isLoading: false });
      throw error;
    }
  },

  // authenticatedFetch: async (url, options = {}) => {
  //   const { token } = get();
  //   if (!token) {
  //     get().logout();
  //     return Promise.reject(
  //       new Error("Authentication token not found. Please log in.")
  //     );
  //   }
  //   const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  //   const defaultHeaders = { Authorization: `Bearer ${token}` };
  //   if (!(options.body instanceof FormData)) {
  //     defaultHeaders["Content-Type"] = "application/json";
  //   }
  //   const config = {
  //     ...options,
  //     headers: { ...defaultHeaders, ...options.headers },
  //   };
  //   try {
  //     const response = await fetch(fullUrl, config);
  //     if (response.status === 401) {
  //       get().logout();
  //       get().handleApiError(new Error("Session expired."), "Session expired.");
  //       return Promise.reject(new Error("Session expired."));
  //     }
  //     const contentType = response.headers.get("content-type");
  //     if (!contentType || !contentType.includes("application/json")) {
  //       const responseText = await response.text();
  //       console.error(
  //         "Non-JSON response received:",
  //         responseText.substring(0, 200)
  //       );
  //       if (
  //         responseText.includes("<!doctype") ||
  //         responseText.includes("<html")
  //       ) {
  //         throw new Error(
  //           "Server returned HTML instead of JSON. Check if the API endpoint exists and server is configured correctly."
  //         );
  //       }
  //       throw new Error(
  //         "Server returned unexpected content type: " + contentType
  //       );
  //     }
  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({
  //         message: `API request failed with status ${response.status}`,
  //       }));
  //       return Promise.reject(errorData);
  //     }
  //     return response.json();
  //   } catch (error) {
  //     console.error("Network or unexpected API error:", error);
  //     if (error.message.includes("fetch")) {
  //       get().handleApiError(
  //         error,
  //         "Network error. Please check if the server is running."
  //       );
  //     } else {
  //       get().handleApiError(error, "API request failed. Please try again.");
  //     }
  //     return Promise.reject(error);
  //   }
  // },

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
