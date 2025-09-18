// stores/useReportStore.js - FIXED VERSION
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';

const useReportStore = create((set, get) => ({
  isSubmitting: false,
  harvestRecords: [],
  manufacturingReports: [], // Changed from manufacturingRecords for clarity
  labRecords: [], // Changed from labReports to match your component usage
  
  setHarvestRecords: (records) => {
    set({ harvestRecords: Array.isArray(records) ? records : [] });
  },
  
  setManufacturingReports: (reports) => {
    set({ manufacturingReports: Array.isArray(reports) ? reports : [] });
  },
  
  // FIXED: This should be setLabRecords to match your component usage
  setLabRecords: (reports) => {
    set({ labRecords: Array.isArray(reports) ? reports : [] });
  },
  
  // Also add the setLabReports method for backward compatibility
  setLabReports: (reports) => {
    set({ labRecords: Array.isArray(reports) ? reports : [] });
  },
  
  submitReport: async ({ reportType, data }) => {
    set({ isSubmitting: true });
    const { authenticatedFetch, showSuccess, handleApiError } = useAuthStore.getState();
    
    let endpoint;
    let body;
    
    try {
      if (reportType === 'farmer') {
        endpoint = '/api/harvests';
        const formData = new FormData();
        
        for (const key in data) {
          if (data[key] instanceof File) {
            formData.append(key, data[key]);
          } else if (key === 'regulatoryTags' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        }
        body = formData;
        
      } else if (reportType === 'manufacturer') {
        endpoint = '/api/manufacturing_reports';
        // For manufacturer, send as JSON (no file upload)
        body = JSON.stringify(data);
        
      } else if (reportType === 'lab') {
        endpoint = '/api/lab_reports';
        const formData = new FormData();
        
        // Handle all form fields including file
        for (const key in data) {
          if (data[key] instanceof File) {
            formData.append(key, data[key]);
          } else if (key === 'regulatoryTags' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] !== null && data[key] !== undefined) {
            // Convert the field name to match backend expectations
            if (key === 'labReportFile') {
              // File is already handled above
              continue;
            }
            formData.append(key, data[key]);
          }
        }
        body = formData;
        
      } else {
        throw new Error(`Invalid report type: ${reportType}`);
      }

      const options = {
        method: 'POST',
        body: body,
      };

      // Only set Content-Type for JSON, let browser set it for FormData
      if (!(body instanceof FormData)) {
        options.headers = {
          'Content-Type': 'application/json',
        };
      }
     
      console.log(`Submitting ${reportType} report to ${endpoint}`);
      const newReport = await authenticatedFetch(endpoint, options);
      
      showSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report submitted successfully!`);
      set({ isSubmitting: false });
      
      return newReport?.data || newReport; // Handle both response formats
      
    } catch (error) {
      console.error(`Error submitting ${reportType} report:`, error);
      
      // Better error message based on error type
      let errorMessage = `Failed to submit ${reportType} report. Please try again.`;
      
      if (error.message?.includes('validation')) {
        errorMessage = 'Please check all required fields and try again.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.errors) {
        // Handle validation errors from backend
        const firstError = error.errors[0];
        errorMessage = `${firstError?.field}: ${firstError?.message}` || errorMessage;
      }
      
      handleApiError(error, errorMessage);
      set({ isSubmitting: false });
      throw error;
    }
  },
}));

export { useReportStore };