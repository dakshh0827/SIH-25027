import React, { useState } from 'react';
import { ChevronDown, Upload, History, User, Factory, TestTubeDiagonal, Plus } from 'lucide-react';
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
    manufacturerName: '',
    ayushLicenseNumber: '',
    batchId: '',
    herbUsed: '',
    quantityUsed: '',
    processingSteps: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Show loading toast
    const loadingToast = toast.loading('🏭 Submitting manufacturing report...', {
      position: 'top-right',
    });

    try {
      setTimeout(() => {
        console.log("Submitting new manufacturing report:", formData);
        onSubmit(formData);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`✅ Manufacturing report for batch ${formData.batchId} submitted successfully!`, {
          duration: 4000,
          position: 'top-right',
        });
        
        setFormData({
          manufacturerName: '',
          ayushLicenseNumber: '',
          batchId: '',
          herbUsed: '',
          quantityUsed: '',
          processingSteps: '',
        });
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Failed to submit manufacturing report. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const handleInputFocus = (fieldName) => {
    const fieldMessages = {
      manufacturerName: '🏭 Enter your registered manufacturer name',
      ayushLicenseNumber: '📝 Your official AYUSH license number',
      batchId: '🏷️ Unique identifier for this production batch',
      herbUsed: '🌿 Specify the herb used in processing',
      quantityUsed: '⚖️ Enter quantity in kilograms',
      processingSteps: '🔄 Describe your manufacturing process'
    };
    
    toast(fieldMessages[fieldName], {
      duration: 2000,
      position: 'top-right',
      icon: '💡',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionTitle title="New Manufacturing Report" />
      <div>
        <label htmlFor="manufacturerName" className="block text-sm font-medium text-slate-300">Manufacturer Name</label>
        <input 
          type="text" 
          name="manufacturerName" 
          id="manufacturerName" 
          value={formData.manufacturerName} 
          onChange={handleChange} 
          onFocus={() => handleInputFocus('manufacturerName')}
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>
      <div>
        <label htmlFor="ayushLicenseNumber" className="block text-sm font-medium text-slate-300">AYUSH License Number</label>
        <input 
          type="text" 
          name="ayushLicenseNumber" 
          id="ayushLicenseNumber" 
          value={formData.ayushLicenseNumber} 
          onChange={handleChange} 
          onFocus={() => handleInputFocus('ayushLicenseNumber')}
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>
      <div>
        <label htmlFor="batchId" className="block text-sm font-medium text-slate-300">Batch ID</label>
        <input 
          type="text" 
          name="batchId" 
          id="batchId" 
          value={formData.batchId} 
          onChange={handleChange} 
          onFocus={() => handleInputFocus('batchId')}
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>
      <div>
        <label htmlFor="herbUsed" className="block text-sm font-medium text-slate-300">Herb Used</label>
        <input 
          type="text" 
          name="herbUsed" 
          id="herbUsed" 
          value={formData.herbUsed} 
          onChange={handleChange} 
          onFocus={() => handleInputFocus('herbUsed')}
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>
      <div>
        <label htmlFor="quantityUsed" className="block text-sm font-medium text-slate-300">Quantity Used (kg)</label>
        <input 
          type="number" 
          name="quantityUsed" 
          id="quantityUsed" 
          value={formData.quantityUsed} 
          onChange={handleChange} 
          onFocus={() => handleInputFocus('quantityUsed')}
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>
      <div>
        <label htmlFor="processingSteps" className="block text-sm font-medium text-slate-300">Processing Steps</label>
        <textarea 
          name="processingSteps" 
          id="processingSteps" 
          value={formData.processingSteps} 
          onChange={handleChange} 
          onFocus={() => handleInputFocus('processingSteps')}
          rows="4" 
          required 
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
        ></textarea>
      </div>
      <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-[#10b981] border border-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98]">
        <Plus className="h-4 w-4 mr-2" /> Submit Report
      </button>
    </form>
  );
};

// Component to display history of manufacturing reports
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Herb Used</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Batch ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.herbUsed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.batchId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'Validated' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                    {report.status}
                  </span>
                </td>
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

// Component for the manufacturer profile section
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

// Main Dashboard Component
const ManufacturerDashboard = () => {
  const [activeSection, setActiveSection] = useState('upload');
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

  React.useEffect(() => {
    toast.success('🏭 Welcome to Manufacturer Dashboard!', {
      duration: 3000,
      position: 'top-right',
    });
  }, []);

  const handleUploadSubmit = (newReport) => {
    // Simulate a blockchain transaction by adding a report with a timestamp
    const reportWithDate = {
      ...newReport,
      date: new Date().toLocaleDateString(),
      status: 'Pending', // Status is pending until validated by a smart contract
    };
    setManufacturingReports(prev => [reportWithDate, ...prev]);
  };

  const handleSectionChange = (section) => {
    const sectionMessages = {
      'upload': '📤 Ready to submit a new manufacturing report',
      'history': '📚 Viewing manufacturing history',
      'profile': '👤 Manufacturer profile information'
    };
    
    setActiveSection(section);
    toast(sectionMessages[section], {
      duration: 2000,
      position: 'top-right',
      icon: '📋',
    });
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
                  onClick={() => handleSectionChange('upload')}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 hover:bg-[#10b981]/20 ${activeSection === 'upload' ? 'bg-[#10b981]/30 border-l-4 border-[#34d399]' : 'text-slate-400'}`}
                >
                  <Upload className="h-5 w-5" />
                  Upload New Report
                </button>
                <button
                  onClick={() => handleSectionChange('history')}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 hover:bg-green-600/20 ${activeSection === 'history' ? 'bg-green-600/30 border-l-4 border-green-500' : 'text-slate-400'}`}
                >
                  <History className="h-5 w-5" />
                  History
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
