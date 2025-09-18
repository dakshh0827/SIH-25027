import React, { useState } from 'react';
import { ChevronDown, Upload, History, User, MapPin, Calendar, Scale, Plus, FileText, Tag } from 'lucide-react';
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


// Form for uploading a new harvest record
const UploadHarvestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    herbSpecies: '',
    harvestWeightKg: '',
    harvestSeason: '',
    location: '',
    notes: '',
    regulatoryTags: [],
    harvestProof: null,
  });


  const [tagInput, setTagInput] = useState('');


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
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
    }
  };


  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      regulatoryTags: prev.regulatoryTags.filter(tag => tag !== tagToRemove)
    }));
    toast.success(`🗑️ Tag "${tagToRemove}" removed!`, { duration: 2000 });
  };


  const handleCaptureLocation = () => {
    const loadingToast = toast.loading('📍 Getting your location...', {
      position: 'top-right',
    });


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coordinates = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setFormData(prev => ({
          ...prev,
          location: coordinates,
        }));
        
        toast.dismiss(loadingToast);
        toast.success(`📍 Location captured: ${coordinates}`, {
          duration: 3000,
        });
      }, (error) => {
        console.error("Error getting location: ", error);
        toast.dismiss(loadingToast);
        toast.error("❌ Unable to retrieve location. Please allow geolocation access.", {
          duration: 4000,
        });
      });
    } else {
      toast.dismiss(loadingToast);
      toast.error("❌ Geolocation is not supported by your browser.", {
        duration: 4000,
      });
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    const loadingToast = toast.loading('🌾 Submitting harvest record...', {
      position: 'top-right',
    });


    // Simulate API call
    setTimeout(() => {
      try {
        console.log("Submitting new harvest record:", formData);
        onSubmit(formData);
        
        toast.dismiss(loadingToast);
        toast.success(`✅ Harvest record for ${formData.herbSpecies} (${formData.harvestWeightKg}kg) submitted successfully!`, {
          duration: 4000,
        });
        
        // Reset form including file input
        setFormData({
          herbSpecies: '',
          harvestWeightKg: '',
          harvestSeason: '',
          location: '',
          notes: '',
          regulatoryTags: [],
          harvestProof: null,
        });
        setTagInput('');
        
        // Reset file input manually
        const fileInput = document.getElementById('harvestProof');
        if (fileInput) {
          fileInput.value = '';
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('❌ Failed to submit harvest record. Please try again.', {
          duration: 4000,
        });
      }
    }, 1500);
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('📁 File size too large. Please select an image under 10MB.', {
          duration: 4000,
        });
        e.target.value = '';
        return;
      }
      
      toast.success(`📸 Image "${file.name}" selected successfully!`, {
        duration: 2000,
      });
      
      setFormData(prev => ({ ...prev, harvestProof: file }));
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionTitle title="New Harvest Record" />


      {/* Herb Species Field */}
      <div>
        <label htmlFor="herbSpecies" className="block text-sm font-medium text-slate-300">
          Herb Species <span className="text-red-400">*</span>
        </label>
        <input 
          type="text" 
          name="herbSpecies" 
          id="herbSpecies" 
          value={formData.herbSpecies} 
          onChange={handleChange} 
          required 
          placeholder="e.g., Turmeric, Ashwagandha"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>


      {/* Harvest Weight Field */}
      <div>
        <label htmlFor="harvestWeightKg" className="block text-sm font-medium text-slate-300">
          Harvest Weight (kg) <span className="text-red-400">*</span>
        </label>
        <input 
          type="number" 
          name="harvestWeightKg" 
          id="harvestWeightKg" 
          value={formData.harvestWeightKg} 
          onChange={handleChange} 
          required 
          step="0.01"
          min="0"
          placeholder="e.g., 150.5"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>


      {/* Harvest Season Field */}
      <div>
        <label htmlFor="harvestSeason" className="block text-sm font-medium text-slate-300">
          Harvest Season <span className="text-red-400">*</span>
        </label>
        <input 
          type="text" 
          name="harvestSeason" 
          id="harvestSeason" 
          value={formData.harvestSeason} 
          onChange={handleChange} 
          required 
          placeholder="e.g., Summer 2024, Monsoon 2024"
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none" 
        />
      </div>


      {/* Location Field */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-300">
          Location (GPS Coordinates) <span className="text-red-400">*</span>
        </label>
        <div className="mt-1 flex gap-2">
          <input 
            type="text" 
            name="location" 
            id="location" 
            value={formData.location} 
            readOnly 
            required 
            placeholder="Click button to capture location"
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white cursor-not-allowed" 
          />
          <button 
            type="button" 
            onClick={handleCaptureLocation} 
            className="flex-shrink-0 px-4 py-3 bg-[#10b981] text-white border border-[#10b981] hover:bg-transparent hover:text-[#34d399] transition-all duration-300 active:scale-[0.98]"
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
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
          placeholder="Any additional information about the harvest..."
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
            placeholder="e.g., Organic, FSSAI-Approved"
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


      {/* Harvest Proof File */}
      <div>
        <label htmlFor="harvestProof" className="block text-sm font-medium text-slate-300">
          Harvest Proof (PNG/JPG) <span className="text-red-400">*</span>
        </label>
        <input 
          type="file" 
          name="harvestProof" 
          id="harvestProof" 
          accept=".png,.jpg,.jpeg" 
          onChange={handleFileChange} 
          required 
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#10b981] file:text-white hover:file:bg-[#059669] file:transition-colors file:duration-300" 
        />
        <p className="mt-2 text-xs text-slate-400">
          Upload a clear image showing your harvest. Maximum file size: 10MB
        </p>
      </div>


      <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-[#10b981] border border-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98]">
        <Plus className="h-4 w-4 mr-2" /> Submit Harvest Record
      </button>
    </form>
  );
};


// Component to display history of uploaded records (unchanged)
const HarvestHistory = ({ records }) => {
  const handleRecordClick = (record) => {
    toast.success(`🌾 Viewing harvest record for ${record.herbSpecies || record.herb}`, {
      duration: 2000,
    });
  };


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead>
          <tr className="bg-slate-800/50 text-slate-400">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Herb Species</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Weight (kg)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Season</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
          {records.length > 0 ? (
            records.map((record, index) => (
              <tr 
                key={index} 
                className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200"
                onClick={() => handleRecordClick(record)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.herbSpecies || record.herb}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.harvestWeightKg || record.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.harvestSeason || record.season}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Validated' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-500">
                🌾 No records found. Submit your first harvest record!
              </td>
            </tr>
          )}
        </tbody>
    </table>
    <Toaster />
    </div>
  );
};


// Component for the user profile section (unchanged)
const UserProfile = ({ profile }) => (
  <div className="space-y-4 text-slate-300">
    <div className="flex items-center space-x-4">
      <div className="p-4 bg-slate-700/50 border border-slate-600">
        <User className="h-12 w-12 text-[#34d399]" />
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
const FarmerDashboard = () => {
  const [activeSection, setActiveSection] = useState('history');
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
    const recordWithDate = {
      ...newRecord,
      date: new Date().toLocaleDateString(),
      status: 'Pending',
    };
    setHarvestRecords(prev => [recordWithDate, ...prev]);
    
    // After successful submission, automatically switch to history view
    setActiveSection('history');
  };


  const handleSectionChange = (section) => {
    setActiveSection(section);
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
      <Toaster />
      <div className="container mx-auto max-w-7xl">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
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
                  Upload New Record
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


export default FarmerDashboard;