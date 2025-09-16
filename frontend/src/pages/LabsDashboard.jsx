import React, { useState } from 'react';
import { ChevronDown, Upload, History, User, TestTubeDiagonal } from 'lucide-react';

// Reusable UI components for a consistent look
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">{title}</h3>
);

// Form for uploading a new lab report
const UploadLabReport = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    labName: '',
    nablAccreditationNumber: '',
    testBatchId: '',
    herbTested: '',
    testType: '',
    testResult: '',
    reportFile: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new lab report:", formData);
    onSubmit(formData);
    setFormData({ // Reset form after submission
      labName: '',
      nablAccreditationNumber: '',
      testBatchId: '',
      herbTested: '',
      testType: '',
      testResult: '',
      reportFile: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionTitle title="New Lab Report" />
      <div>
        <label htmlFor="labName" className="block text-sm font-medium text-slate-300">Lab Name</label>
        <input type="text" name="labName" id="labName" value={formData.labName} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="nablAccreditationNumber" className="block text-sm font-medium text-slate-300">NABL Accreditation Number</label>
        <input type="text" name="nablAccreditationNumber" id="nablAccreditationNumber" value={formData.nablAccreditationNumber} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="testBatchId" className="block text-sm font-medium text-slate-300">Batch ID</label>
        <input type="text" name="testBatchId" id="testBatchId" value={formData.testBatchId} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="herbTested" className="block text-sm font-medium text-slate-300">Herb Tested</label>
        <input type="text" name="herbTested" id="herbTested" value={formData.herbTested} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="testType" className="block text-sm font-medium text-slate-300">Test Type</label>
        <input type="text" name="testType" id="testType" value={formData.testType} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="testResult" className="block text-sm font-medium text-slate-300">Test Result</label>
        <input type="text" name="testResult" id="testResult" value={formData.testResult} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="reportFile" className="block text-sm font-medium text-slate-300">Lab Report File</label>
        <input type="file" name="reportFile" id="reportFile" accept=".pdf,.doc,.docx" onChange={handleChange} required className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>
      <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-blue-600/30 text-blue-300 font-semibold border border-blue-500 transition-all duration-300 hover:bg-blue-700/50 active:scale-[0.98]">
        Upload Report
      </button>
    </form>
  );
};

// Component to display history of lab reports
const LabHistory = ({ reports }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-700">
      <thead>
        <tr className="bg-slate-800/50 text-slate-400">
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report ID</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Batch ID</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Test Type</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Result</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
        {reports.length > 0 ? (
          reports.map((report, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{report.testBatchId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{report.testType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{report.testResult}</td>
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
            <td colSpan="6" className="px-6 py-4 text-center text-sm text-slate-500">No reports found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Component for the lab profile section
const LabProfile = ({ profile }) => (
  <div className="space-y-4 text-slate-300">
    <div className="flex items-center space-x-4">
      <div className="p-4 bg-slate-700/50 border border-slate-600">
        <TestTubeDiagonal className="h-12 w-12 text-blue-400" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white">{profile.labName}</h4>
        <p className="text-sm text-slate-400">Authorized Representative: {profile.authorizedRepresentative}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-slate-400">NABL Accreditation Number</p>
        <p className="text-white font-medium">{profile.nablAccreditationNumber}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Scope of NABL Accreditation</p>
        <p className="text-white font-medium">{profile.scopeOfNablAccreditation}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">PAN</p>
        <p className="text-white font-medium">{profile.pan}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">GSTIN</p>
        <p className="text-white font-medium">{profile.gstin}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Registered Address</p>
        <p className="text-white font-medium">{profile.registeredAddress}</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
const LabsDashboard = () => {
  const [activeSection, setActiveSection] = useState('upload');
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

  const handleUploadSubmit = (newReport) => {
    // Simulate a blockchain transaction by adding a report with a timestamp
    const reportWithDate = {
      ...newReport,
      date: new Date().toLocaleDateString(),
      status: 'Pending', // Status is pending until validated by a smart contract
    };
    setLabReports(prev => [reportWithDate, ...prev]);
    alert("Lab report submitted successfully!");
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return <UploadLabReport onSubmit={handleUploadSubmit} />;
      case 'history':
        return <LabHistory reports={labReports} />;
      case 'profile':
        return <LabProfile profile={labProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="container mx-auto max-w-7xl">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold">Laboratory Dashboard</h1>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-300 font-semibold transition-colors hover:bg-slate-700/50"
              onClick={() => setActiveSection('profile')}
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
                  onClick={() => setActiveSection('upload')}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 hover:bg-blue-600/20 ${activeSection === 'upload' ? 'bg-blue-600/30 border-l-4 border-blue-500' : 'text-slate-400'}`}
                >
                  <Upload className="h-5 w-5" />
                  Upload New Report
                </button>
                <button
                  onClick={() => setActiveSection('history')}
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

export default LabsDashboard;