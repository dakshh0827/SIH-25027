import React, { useState } from 'react';
import { ChevronDown, Upload, History, User, MapPin, Calendar, Scale, Plus } from 'lucide-react';

// Reusable UI components for a consistent look
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">{title}</h3>
);

// Form for uploading a new harvest record
const UploadHarvestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    herb: '',
    weight: '',
    season: '',
    harvestProof: null,
    location: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: `${position.coords.latitude}, ${position.coords.longitude}`,
        }));
      }, (error) => {
        console.error("Error getting location: ", error);
        alert("Unable to retrieve location. Please allow geolocation access.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new harvest record:", formData);
    onSubmit(formData);
    setFormData({ herb: '', weight: '', season: '', harvestProof: null, location: '' }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="herb" className="block text-sm font-medium text-slate-300">Herb Species</label>
        <input type="text" name="herb" id="herb" value={formData.herb} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-slate-300">Harvest Weight (kg)</label>
        <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="season" className="block text-sm font-medium text-slate-300">Harvest Season</label>
        <input type="text" name="season" id="season" value={formData.season} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-300">
          Location (GPS Coordinates)
        </label>
        <div className="mt-1 flex gap-2">
          <input type="text" name="location" id="location" value={formData.location} readOnly required className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white" />
          <button type="button" onClick={handleCaptureLocation} className="flex-shrink-0 px-4 py-3 bg-green-600/30 text-green-300 border border-green-500 hover:bg-green-700/50 transition-colors duration-300 active:scale-[0.98]">
            <MapPin className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="harvestProof" className="block text-sm font-medium text-slate-300">Harvest Proof (PNG/JPG)</label>
        <input type="file" name="harvestProof" id="harvestProof" accept=".png,.jpg,.jpeg" onChange={handleChange} required className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
      </div>
      <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-blue-600/30 text-blue-300 font-semibold border border-blue-500 transition-all duration-300 hover:bg-blue-700/50 active:scale-[0.98]">
        <Plus className="h-4 w-4 mr-2" /> Upload Record
      </button>
    </form>
  );
};

// Component to display history of uploaded records
const HarvestHistory = ({ records }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-700">
      <thead>
        <tr className="bg-slate-800/50 text-slate-400">
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Herb</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Weight (kg)</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Season</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
        {records.length > 0 ? (
          records.map((record, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{record.herb}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{record.weight}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{record.season}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{record.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{record.location}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Validated' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="px-6 py-4 text-center text-sm text-slate-500">No records found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Component for the user profile section
const UserProfile = ({ profile }) => (
  <div className="space-y-4 text-slate-300">
    <div className="flex items-center space-x-4">
      <div className="p-4 bg-slate-700/50 border border-slate-600">
        <User className="h-12 w-12 text-blue-400" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white">{profile.fpoName}</h4>
        <p className="text-sm text-slate-400">Authorized Representative: {profile.authorizedRepresentative}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-slate-400">Registration Number</p>
        <p className="text-white font-medium">{profile.regNumber}</p>
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
const FpoDashboard = () => {
  const [activeSection, setActiveSection] = useState('upload');
  const [harvestRecords, setHarvestRecords] = useState([]);
  const [fpoProfile] = useState({
    fpoName: "Green Harvest Producer Company Ltd.",
    regNumber: "U01234MH2020PTC123456",
    pan: "AAAAF1234B",
    gstin: "27ABCDE1234F1Z5",
    registeredAddress: "123, Market Road, District XYZ, Madhya Pradesh",
    authorizedRepresentative: "Mr. Ramesh Kumar",
  });

  const handleUploadSubmit = (newRecord) => {
    // Simulate a blockchain transaction by adding a record with a timestamp
    const recordWithDate = {
      ...newRecord,
      date: new Date().toLocaleDateString(),
      status: 'Pending', // Status is pending until validated by a smart contract
    };
    setHarvestRecords(prev => [recordWithDate, ...prev]);
    alert("Harvest record submitted successfully!");
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return <UploadHarvestForm onSubmit={handleUploadSubmit} />;
      case 'history':
        return <HarvestHistory records={harvestRecords} />;
      case 'profile':
        return <UserProfile profile={fpoProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="container mx-auto max-w-7xl">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold">FPO Dashboard</h1>
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
                  Upload New Record
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

export default FpoDashboard;