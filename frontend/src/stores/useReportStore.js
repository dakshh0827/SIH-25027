// useReportStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore'; // <-- Make sure to import your auth store

const useReportStore = create((set) => ({
  isSubmitting: false,

  submitReport: async ({ reportType, data }) => {
    set({ isSubmitting: true });

    let endpoint = '';
    const body = new FormData();

    // Prepare the FormData with all fields
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'regulatoryTags' && Array.isArray(data[key])) {
          data[key].forEach(tag => body.append(key, tag));
        } else {
          body.append(key, data[key]);
        }
      }
    }

    switch (reportType) {
      case 'farmer':
        endpoint = 'http://localhost:5000/api/harvests';
        break;
      // ... other cases
    }

    const loadingToast = toast.loading('Submitting report...', { position: 'top-center' });

    try {
      // ✅ Add the authorization header here
      const token = useAuthStore.getState().token; // Get the token from your auth store
      
      if (!token) {
        // Handle the case where there is no token (e.g., user isn't logged in)
        toast.dismiss(loadingToast);
        toast.error('❌ You are not authorized. Please log in.');
        set({ isSubmitting: false });
        return;
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // ✅ Attach the token to the header
        },
        body,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Submission failed');
      }

      const newReport = await res.json();
      toast.dismiss(loadingToast);
      toast.success('Report submitted successfully! 🎉');
      
      return newReport;

    } catch (error) {
      console.error('Report submission error:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to submit report.');
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export { useReportStore };