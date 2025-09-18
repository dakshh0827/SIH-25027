import React, { useState } from 'react';
import { Upload, History, User, TestTubeDiagonal, Tag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useReportStore } from '../stores/useReportStore';

// Reusable UI components
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">{title}</h3>
);

// Form for uploading a new lab report
const UploadLabReport = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    testType: '',
    testResult: '',
    labReportFile: null,
    status: 'final',
    manufacturingReportId: '',
    effectiveDate: '',
    issuedDate: new Date().toISOString().split('T')[0],
    notes: '',
    regulatoryTags: [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: files ? files[0] : value 
    }));
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
    } else if (formData.regulatoryTags.includes(tagInput.trim())) {
      toast.error('Tag already exists!', { duration: 2000 });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ 
      ...prev, 
      regulatoryTags: prev.regulatoryTags.filter(tag => tag !== tagToRemove) 
    }));
    toast.success(`🗑️ Tag "${tagToRemove}" removed!`, { duration: 2000 });
  };

  const validateForm = () => {
    const requiredFields = {
      testType: 'Test Type',
      testResult: 'Test Result',
      manufacturingReportId: 'Manufacturing Report ID',
      effectiveDate: 'Test Performed Date',
      issuedDate: 'Report Issued Date',
      labReportFile: 'Lab Report File'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        toast.error(`${label} is required!`, { duration: 3000 });
        return false;
      }
    }

    // Validate dates
    const effectiveDate = new Date(formData.effectiveDate);
    const issuedDate = new Date(formData.issuedDate);
    
    if (effectiveDate > issuedDate) {
      toast.error('Test performed date cannot be after report issued date!', { duration: 4000 });
      return false;
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
      
      // Reset form
      setFormData({
        testType: '',
        testResult: '',
        labReportFile: null,
        status: 'final',
        manufacturingReportId: '',
        effectiveDate: '',
        issuedDate: new Date().toISOString().split('T')[0],
        notes: '',
        regulatoryTags: [],
      });
      setTagInput('');
      
      // Reset file input manually
      const fileInput = document.getElementById('labReportFile');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error submitting lab report:', error);
      toast.error('Failed to submit lab report. Please try again.', { duration: 4000 });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (file.size > maxSize) {
        toast.error('📁 File size too large. Please select a file under 10MB.', { duration: 4000 });
        e.target.value = '';
        return;
      }

      if (!allowedTypes.includes(fileExtension)) {
        toast.error('📁 Invalid file type. Please select a PDF, DOC, or DOCX file.', { duration: 4000 });
        e.target.value = '';
        return;
      }

      toast.success(`📄 File "${file.name}" selected successfully!`, { duration: 2000 });
      setFormData(prev => ({ ...prev, labReportFile: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionTitle title="New Lab Report" />
      
      {/* Manufacturing Report ID Field */}
      <div>
        <label htmlFor="manufacturingReportId" className="block text-sm font-medium text-slate-300 mb-1">
          Manufacturing Report ID <span className="text-red-400">*</span>
        </label>
        <input 
          type="text" 
          name="manufacturingReportId" 
          id="manufacturingReportId" 
          value={formData.manufacturingReportId} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting} 
          placeholder="e.g., MFG-RPT-2024-001" 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
        />
      </div>

      {/* Test Type Field */}
      <div>
        <label htmlFor="testType" className="block text-sm font-medium text-slate-300 mb-1">
          Test Type <span className="text-red-400">*</span>
        </label>
        <select 
          name="testType" 
          id="testType" 
          value={formData.testType} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting} 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Test Type</option>
          <option value="Heavy Metals Analysis">Heavy Metals Analysis</option>
          <option value="Microbial Limit Test">Microbial Limit Test</option>
          <option value="Phytochemical Assay">Phytochemical Assay</option>
          <option value="Pesticide Residue Analysis">Pesticide Residue Analysis</option>
          <option value="Aflatoxin Testing">Aflatoxin Testing</option>
          <option value="Moisture Content Analysis">Moisture Content Analysis</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Test Result Field */}
      <div>
        <label htmlFor="testResult" className="block text-sm font-medium text-slate-300 mb-1">
          Test Result <span className="text-red-400">*</span>
        </label>
        <textarea 
          name="testResult" 
          id="testResult" 
          value={formData.testResult} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting} 
          rows="4" 
          placeholder="Summary of test results and findings..." 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none resize-vertical disabled:opacity-50 disabled:cursor-not-allowed" 
        />
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">
          Report Status <span className="text-red-400">*</span>
        </label>
        <select 
          name="status" 
          id="status" 
          value={formData.status} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting} 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="registered">Registered</option>
          <option value="preliminary">Preliminary</option>
          <option value="final">Final</option>
          <option value="amended">Amended</option>
        </select>
      </div>

      {/* Date Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="effectiveDate" className="block text-sm font-medium text-slate-300 mb-1">
            Test Performed Date <span className="text-red-400">*</span>
          </label>
          <input 
            type="date" 
            name="effectiveDate" 
            id="effectiveDate" 
            value={formData.effectiveDate} 
            onChange={handleChange} 
            required 
            disabled={isSubmitting} 
            max={new Date().toISOString().split('T')[0]} 
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
          />
        </div>
        <div>
          <label htmlFor="issuedDate" className="block text-sm font-medium text-slate-300 mb-1">
            Report Issued Date <span className="text-red-400">*</span>
          </label>
          <input 
            type="date" 
            name="issuedDate" 
            id="issuedDate" 
            value={formData.issuedDate} 
            onChange={handleChange} 
            required 
            disabled={isSubmitting} 
            max={new Date().toISOString().split('T')[0]} 
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
          />
        </div>
      </div>

      {/* Notes Field */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">
          Additional Notes
        </label>
        <textarea 
          name="notes" 
          id="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          disabled={isSubmitting} 
          rows="3" 
          placeholder="Any additional observations or comments..." 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none resize-vertical disabled:opacity-50 disabled:cursor-not-allowed" 
        />
      </div>

      {/* Regulatory Tags Field */}
      <div>
        <label htmlFor="tagInput" className="block text-sm font-medium text-slate-300 mb-1">
          Regulatory Tags
        </label>
        <div className="mt-1 flex gap-2">
          <input 
            type="text" 
            id="tagInput" 
            value={tagInput} 
            onChange={(e) => setTagInput(e.target.value)} 
            disabled={isSubmitting} 
            placeholder="e.g., NABL, ISO-17025, AYUSH-Approved" 
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag(e);
              }
            }}
          />
          <button 
            type="button" 
            onClick={handleAddTag} 
            disabled={isSubmitting || !tagInput.trim()} 
            className="flex-shrink-0 px-4 py-3 bg-blue-600/30 text-blue-300 border border-blue-500 rounded-md hover:bg-blue-700/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/50 rounded-full text-sm cursor-pointer hover:bg-blue-600/30 transition-colors duration-200" 
                onClick={() => !isSubmitting && handleRemoveTag(tag)}
              >
                {tag}
                {!isSubmitting && <span className="text-blue-400 hover:text-blue-200">×</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lab Report File */}
      <div>
        <label htmlFor="labReportFile" className="block text-sm font-medium text-slate-300 mb-1">
          Lab Report File <span className="text-red-400">*</span>
        </label>
        <input 
          type="file" 
          name="labReportFile" 
          id="labReportFile" 
          accept=".pdf,.doc,.docx" 
          onChange={handleFileChange} 
          required 
          disabled={isSubmitting} 
          className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#10b981] file:text-white hover:file:bg-[#059669] file:transition-colors file:duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
        />
        <p className="mt-2 text-xs text-slate-400">
          Upload the official lab report document (PDF, DOC, or DOCX). Maximum file size: 10MB
        </p>
        {formData.labReportFile && (
          <p className="mt-1 text-xs text-green-400">
            ✓ Selected: {formData.labReportFile.name}
          </p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full flex items-center justify-center px-4 py-3 bg-[#10b981] border border-[#10b981] text-white font-semibold rounded-md transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Submitting...' : 'Submit Lab Report'}
      </button>
    </form>
  );
};

// Component to display history of lab reports
const LabHistory = ({ reports }) => {
  const handleReportClick = (report) => {
    toast.success(`📊 Viewing lab report for ${report.testType}`, {
      duration: 2000,
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'final':
        return 'bg-green-600/30 text-green-400';
      case 'preliminary':
        return 'bg-yellow-600/30 text-yellow-400';
      case 'amended':
        return 'bg-blue-600/30 text-blue-400';
      case 'registered':
        return 'bg-purple-600/30 text-purple-400';
      default:
        return 'bg-gray-600/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Lab Reports History" />
      
      {reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Test Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Issued Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  MFG Report ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
              {reports.map((report, index) => (
                <tr 
                  key={report.id || index} 
                  className="hover:bg-slate-800/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.testType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.issuedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">
                    {report.manufacturingReportId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleReportClick(report)}
                      className="text-[#34d399] hover:text-[#10b981] transition-colors duration-200 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <TestTubeDiagonal className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">No lab reports found</p>
          <p className="text-slate-400 text-sm">Submit your first lab report to get started!</p>
        </div>
      )}
    </div>
  );
};

// Component for the lab profile section
const LabProfile = ({ profile }) => (
  <div className="space-y-6">
    <SectionTitle title="Laboratory Profile" />
    
    <div className="space-y-4 text-slate-300">
      <div className="flex items-center space-x-4">
        <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
          <TestTubeDiagonal className="h-12 w-12 text-[#34d399]" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-white">{profile.labName}</h4>
          <p className="text-sm text-slate-400">
            Authorized Representative: {profile.authorizedRepresentative}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">NABL Accreditation Number</p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 rounded-md">
            {profile.nablAccreditationNumber}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">PAN</p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 rounded-md">
            {profile.pan}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">GSTIN</p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 rounded-md">
            {profile.gstin}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">Scope of NABL Accreditation</p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 rounded-md">
            {profile.scopeOfNablAccreditation}
          </p>
        </div>
        <div className="md:col-span-2 space-y-2">
          <p className="text-sm text-slate-400 font-medium">Registered Address</p>
          <p className="text-white font-medium bg-slate-800/50 px-3 py-2 rounded-md">
            {profile.registeredAddress}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
const LabsDashboard = () => {
  const [activeSection, setActiveSection] = useState('history');
  const [labReports, setLabReports] = useState([]);
  const [labProfile] = useState({
    labName: "Herbal Quality Labs Pvt. Ltd.",
    nablAccreditationNumber: "TC-1234",
    scopeOfNablAccreditation: "Heavy Metals, Microbial Limit Test, Phytochemical Assay",
    pan: "AAAAF1234B",
    gstin: "27ABCDE1234F1Z5",
    registeredAddress: "Plot No. 22, Industrial Area, Delhi – 110001",
    authorizedRepresentative: "Dr. Suman Verma",
  });

  // Use the useReportStore
  const { isSubmitting, submitReport } = useReportStore();

  const handleUploadSubmit = async (formData) => {
    try {
      const newReport = await submitReport({ 
        reportType: 'lab', 
        data: formData 
      });
      
      if (newReport) {
        setLabReports(prev => [
          { 
            ...newReport, 
            id: Date.now(), // Add unique ID
            date: new Date().toLocaleDateString() 
          }, 
          ...prev
        ]);
        
        // Switch to history view after successful submission
        setTimeout(() => {
          setActiveSection('history');
        }, 1000);
        
        toast.success(`✅ Lab report for ${formData.testType} submitted successfully!`, {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit lab report. Please try again.', {
        duration: 4000,
      });
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return (
          <UploadLabReport 
            onSubmit={handleUploadSubmit} 
            isSubmitting={isSubmitting} 
          />
        );
      case 'history':
        return <LabHistory reports={labReports} />;
      case 'profile':
        return <LabProfile profile={labProfile} />;
      default:
        return <LabHistory reports={labReports} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569'
          }
        }}
      />
      
      <div className="container mx-auto max-w-7xl">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6 mb-8 border-b border-slate-700/50">
          <div>
            <h1 className="text-3xl font-bold text-white">Laboratory Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage lab reports and testing documentation
            </p>
          </div>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-6 py-3 border border-[#34d399] bg-transparent text-[#34d399] font-semibold rounded-lg transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white"
              onClick={() => handleSectionChange('profile')}
            >
              <User className="h-5 w-5" />
              Profile
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <nav className="space-y-2">
                <button
                  onClick={() => handleSectionChange('history')}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-300 text-left ${
                    activeSection === 'history' 
                      ? 'bg-green-600/30 border-l-4 border-green-500 text-green-300' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <History className="h-5 w-5 flex-shrink-0" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => handleSectionChange('upload')}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-300 text-left ${
                    activeSection === 'upload' 
                      ? 'bg-[#10b981]/30 border-l-4 border-[#34d399] text-[#34d399]' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Upload className="h-5 w-5 flex-shrink-0" />
                  <span>Upload New Report</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* Dynamic Content */}
          <div className="lg:col-span-3">
            <Card>
              {renderSection()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabsDashboard;
