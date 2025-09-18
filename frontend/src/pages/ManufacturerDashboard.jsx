import React, { useState } from 'react';
import { ChevronDown, Upload, History, User, Factory, TestTubeDiagonal, Plus, Calendar, FileText, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable UI components for a consistent look
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">{title}</h3>
);

// Form for uploading a new manufacturing report
const UploadManufacturingReport = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    herbUsed: '',
    quantityUsedKg: '',
    processingSteps: '',
    status: 'in-progress',
    effectiveDate: new Date().toISOString().split('T')[0], // Today's date
    expiryDate: '',
    notes: '',
    regulatoryTags: [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.regulatoryTags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        regulatoryTags: [...prev.regulatoryTags, tagInput.trim()]
      }));
      setTagInput('');
      toast.success(`🏷️ Tag "${tagInput.trim()}" added!`, { duration: 2000 });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      regulatoryTags: prev.regulatoryTags.filter(tag => tag !== tagToRemove)
    }));
    toast.success(`🗑️ Tag "${tagToRemove}" removed!`, { duration: 2000 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Show loading toast
    const loadingToast = toast.loading('🏭 Submitting manufacturing report...', {
      position: 'top-right',
    });

    // Simulate API call
    setTimeout(() => {
      try {
        console.log("Submitting new manufacturing report:", formData);
        onSubmit(formData);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`✅ Manufacturing report for ${formData.herbUsed} (Batch: ${formData.batchId}) submitted successfully!`, {
          duration: 4000,
        });
        
        setFormData({
          batchId: '',
          herbUsed: '',
          quantityUsedKg: '',
          processingSteps: '',
          status: 'in-progress',
          effectiveDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          notes: '',
          regulatoryTags: [],
        });
        setTagInput('');
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('❌ Failed to submit manufacturing report. Please try again.', {
          duration: 4000,
        });
      }
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionTitle title="New Manufacturing Report" />

      {/* Batch ID Field */}
      <div>
        <label htmlFor="batchId" className="block text-sm font-medium text-slate-300">
          Batch ID <span className="text-red-400">*</span>
        </label>
        <input 
          type="text" 
          name="batchId" 
          id="batchId" 
          value={formData.batchId} 
          onChange={handleChange} 
          required 
          placeholder="e.g., BATCH-2024-001"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>

      {/* Herb Used Field */}
      <div>
        <label htmlFor="herbUsed" className="block text-sm font-medium text-slate-300">
          Herb Used <span className="text-red-400">*</span>
        </label>
        <input 
          type="text" 
          name="herbUsed" 
          id="herbUsed" 
          value={formData.herbUsed} 
          onChange={handleChange} 
          required 
          placeholder="e.g., Turmeric, Ashwagandha"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>

      {/* Quantity Used Field */}
      <div>
        <label htmlFor="quantityUsedKg" className="block text-sm font-medium text-slate-300">
          Quantity Used (kg) <span className="text-red-400">*</span>
        </label>
        <input 
          type="number" 
          name="quantityUsedKg" 
          id="quantityUsedKg" 
          value={formData.quantityUsedKg} 
          onChange={handleChange} 
          required 
          step="0.01"
          min="0"
          placeholder="e.g., 250.5"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>

      {/* Processing Steps Field */}
      <div>
        <label htmlFor="processingSteps" className="block text-sm font-medium text-slate-300">
          Processing Steps <span className="text-red-400">*</span>
        </label>
        <textarea 
          name="processingSteps" 
          id="processingSteps" 
          value={formData.processingSteps} 
          onChange={handleChange} 
          rows="4" 
          required 
          placeholder="Describe the complete manufacturing process, including cleaning, drying, grinding, and packaging steps..."
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none resize-vertical"
        />
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-300">
          Manufacturing Status <span className="text-red-400">*</span>
        </label>
        <select 
          name="status" 
          id="status" 
          value={formData.status} 
          onChange={handleChange} 
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
        >
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Effective Date Field */}
      <div>
        <label htmlFor="effectiveDate" className="block text-sm font-medium text-slate-300">
          Manufacturing Date <span className="text-red-400">*</span>
        </label>
        <input 
          type="date" 
          name="effectiveDate" 
          id="effectiveDate" 
          value={formData.effectiveDate} 
          onChange={handleChange} 
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>

      {/* Expiry Date Field */}
      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-300">
          Expiry Date
        </label>
        <input 
          type="date" 
          name="expiryDate" 
          id="expiryDate" 
          value={formData.expiryDate} 
          onChange={handleChange} 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
        <p className="mt-1 text-xs text-slate-400">
          Leave blank if product doesn't have expiry date
        </p>
      </div>

      {/* Notes Field */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-300">
          Additional Notes
        </label>
        <textarea 
          name="notes" 
          id="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          rows="3"
          placeholder="Any additional information about the manufacturing process..."
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none resize-vertical" 
        />
      </div>

      {/* Regulatory Tags Field */}
      <div>
        <label htmlFor="tagInput" className="block text-sm font-medium text-slate-300">
          Regulatory Tags
        </label>
        <div className="mt-1 flex gap-2">
          <input 
            type="text" 
            id="tagInput" 
            value={tagInput} 
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g., AYUSH-GMP, ISO-9001, FDA-Approved"
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag(e);
              }
            }}
          />
          <button 
            type="button" 
            onClick={handleAddTag}
            className="flex-shrink-0 px-4 py-3 bg-blue-600/30 text-blue-300 border border-blue-500 hover:bg-blue-700/50 transition-all duration-300 active:scale-[0.98]"
          >
            <Tag className="h-5 w-5" />
          </button>
        </div>
        
        {/* Display Added Tags */}
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

      <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-[#10b981] border border-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98]">
        <Plus className="h-4 w-4 mr-2" /> Submit Manufacturing Report
      </button>
    </form>
  );
};

// Component to display history of manufacturing reports (Updated - removed identifier column)
const ManufacturingHistory = ({ reports }) => {
  const handleReportClick = (report) => {
    toast.success(`📊 Viewing details for batch ${report.batchId}`, {
      duration: 2000,
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead>
          <tr className="bg-slate-800/50 text-slate-400">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Batch ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Herb Used</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantity (kg)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <tr 
                key={index} 
                className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200"
                onClick={() => handleReportClick(report)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{report.batchId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.herbUsed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.quantityUsedKg || report.quantityUsed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'completed' ? 'bg-green-600/30 text-green-400' : 
                    report.status === 'in-progress' ? 'bg-blue-600/30 text-blue-400' :
                    report.status === 'cancelled' ? 'bg-red-600/30 text-red-400' :
                    'bg-yellow-600/30 text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.effectiveDate || report.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-500">
                📝 No reports found. Submit your first manufacturing report!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Component for the manufacturer profile section (unchanged)
const ManufacturerProfile = ({ profile }) => (
  <div className="space-y-4 text-slate-300">
    <div className="flex items-center space-x-4">
      <div className="p-4 bg-slate-700/50 border border-slate-600">
        <Factory className="h-12 w-12 text-[#34d399]" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white">{profile.manufacturerName}</h4>
        <p className="text-sm text-slate-400">Authorized Representative: {profile.authorizedRepresentative}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">GSTIN</p>
        <p className="text-white font-medium">{profile.gstin}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-slate-400">AYUSH License Number</p>
        <p className="text-white font-medium">{profile.ayushLicenseNumber}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Registration Number</p>
        <p className="text-white font-medium">{profile.regNumber}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">PAN</p>
        <p className="text-white font-medium">{profile.pan}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Registered Address</p>
        <p className="text-white font-medium">{profile.registeredAddress}</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component (unchanged except for field mapping)
const ManufacturerDashboard = () => {
  const [activeSection, setActiveSection] = useState('history');
  const [manufacturingReports, setManufacturingReports] = useState([]);
  const [manufacturerProfile] = useState({
    manufacturerName: "VedaHerbs Ayurvedic Pvt. Ltd.",
    ayushLicenseNumber: "AYUSH/MD/2023/000123",
    regNumber: "U01234MH2020PTC123456",
    pan: "AAAAF1234B",
    gstin: "27ABCDE1234F1Z5",
    registeredAddress: "Plot No. 45, Industrial Area, Delhi – 110001",
    authorizedRepresentative: "Dr. Ramesh Sharma",
  });

  const handleUploadSubmit = (newReport) => {
    const reportWithDate = {
      ...newReport,
      date: new Date().toLocaleDateString(),
    };
    setManufacturingReports(prev => [reportWithDate, ...prev]);
    
    // After successful submission, automatically switch to history view
    setActiveSection('history');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return <UploadManufacturingReport onSubmit={handleUploadSubmit} />;
      case 'history':
        return <ManufacturingHistory reports={manufacturingReports} />;
      case 'profile':
        return <ManufacturerProfile profile={manufacturerProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="container mx-auto max-w-7xl">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold">Manufacturer Dashboard</h1>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white"
              onClick={() => handleSectionChange('profile')}
            >
              <User className="h-5 w-5" />
              Profile
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <nav className="space-y-2">
                <button
                  onClick={() => handleSectionChange('history')}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 hover:bg-green-600/20 ${activeSection === 'history' ? 'bg-green-600/30 border-l-4 border-green-500' : 'text-slate-400'}`}
                >
                  <History className="h-5 w-5" />
                  History
                </button>
                <button
                  onClick={() => handleSectionChange('upload')}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 hover:bg-[#10b981]/20 ${activeSection === 'upload' ? 'bg-[#10b981]/30 border-l-4 border-[#34d399]' : 'text-slate-400'}`}
                >
                  <Upload className="h-5 w-5" />
                  Upload New Report
                </button>
              </nav>
            </Card>
          </div>

          {/* Dynamic Content */}
          <div className="md:col-span-3">
            <Card>
              {renderSection()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
