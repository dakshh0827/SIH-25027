import React, { useState, useEffect } from 'react';
import { History, User, Users, Factory, FlaskConical, LogOut, Loader2, Calendar, MapPin, FileText, Search, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../stores/useAuthStore';

// Reusable UI components
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">{title}</h3>
);

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="h-12 w-12 text-[#34d399] animate-spin mx-auto mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  </div>
);

// Filter/Search component
const ReportsFilter = ({ searchTerm, setSearchTerm, filterType, setFilterType, statusFilter, setStatusFilter }) => (
  <div className="bg-slate-800/30 p-4 border border-slate-700/50 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
        />
      </div>
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
      >
        <option value="all">All Report Types</option>
        <option value="harvest">Harvest Reports</option>
        <option value="manufacturing">Manufacturing Reports</option>
        <option value="lab">Lab Reports</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
      >
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="draft">Draft</option>
        <option value="final">Final</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  </div>
);

// Harvest Reports Component
const HarvestReports = ({ reports, isLoading, searchTerm, statusFilter }) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading harvest reports..." />;
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.identifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.herbSpecies?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <SectionTitle title={`Harvest Reports (${filteredReports.length})`} />
      {filteredReports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Identifier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Herb Species</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Weight (kg)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Season</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
              {filteredReports.map((report, index) => (
                <tr key={report.id || index} className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{report.identifier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.herbSpecies}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.harvestWeightKg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.harvestSeason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-slate-500 mr-1" />
                      {report.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
                      report.status === 'completed' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-500 mr-1" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">No harvest reports found</p>
          <p className="text-slate-400 text-sm">No harvest data matches your current filters.</p>
        </div>
      )}
    </div>
  );
};

// Manufacturing Reports Component
const ManufacturingReports = ({ reports, isLoading, searchTerm, statusFilter }) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading manufacturing reports..." />;
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.identifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.batchId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.herbUsed?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <SectionTitle title={`Manufacturing Reports (${filteredReports.length})`} />
      {filteredReports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Batch ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Herb Used</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantity (kg)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Effective Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
              {filteredReports.map((report, index) => (
                <tr key={report.id || index} className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{report.batchId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.herbUsed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.quantityUsedKg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
                      report.status === 'completed' ? 'bg-green-600/30 text-green-400' : 
                      report.status === 'in-progress' ? 'bg-blue-600/30 text-blue-400' : 
                      report.status === 'cancelled' ? 'bg-red-600/30 text-red-400' : 
                      'bg-yellow-600/30 text-yellow-400'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-500 mr-1" />
                      {new Date(report.effectiveDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.expiryDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-slate-500 mr-1" />
                        {new Date(report.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-slate-500">No expiry</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Factory className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">No manufacturing reports found</p>
          <p className="text-slate-400 text-sm">No manufacturing data matches your current filters.</p>
        </div>
      )}
    </div>
  );
};

// Lab Reports Component
const LabReports = ({ reports, isLoading, searchTerm, statusFilter }) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading lab reports..." />;
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.identifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.testResult?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.manufacturingReportId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <SectionTitle title={`Lab Reports (${filteredReports.length})`} />
      {filteredReports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Identifier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Test Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Result</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Manufacturing Report</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Issued Date</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
              {filteredReports.map((report, index) => (
                <tr key={report.id || index} className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{report.identifier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.testType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
                      report.testResult?.toLowerCase().includes('pass') ? 'bg-green-600/30 text-green-400' :
                      report.testResult?.toLowerCase().includes('fail') ? 'bg-red-600/30 text-red-400' :
                      'bg-blue-600/30 text-blue-400'
                    }`}>
                      {report.testResult}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-600/30 text-green-400">
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{report.manufacturingReportId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-500 mr-1" />
                      {new Date(report.issuedDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FlaskConical className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">No lab reports found</p>
          <p className="text-slate-400 text-sm">No lab data matches your current filters.</p>
        </div>
      )}
    </div>
  );
};

// All Reports Combined Component
const AllReports = ({ harvestReports, manufacturingReports, labReports, isLoading, searchTerm, filterType, statusFilter }) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading all reports..." />;
  }

  return (
    <div className="space-y-8">
      {(filterType === 'all' || filterType === 'harvest') && (
        <HarvestReports 
          reports={harvestReports} 
          isLoading={false} 
          searchTerm={searchTerm} 
          statusFilter={statusFilter} 
        />
      )}
      {(filterType === 'all' || filterType === 'manufacturing') && (
        <ManufacturingReports 
          reports={manufacturingReports} 
          isLoading={false} 
          searchTerm={searchTerm} 
          statusFilter={statusFilter} 
        />
      )}
      {(filterType === 'all' || filterType === 'lab') && (
        <LabReports 
          reports={labReports} 
          isLoading={false} 
          searchTerm={searchTerm} 
          statusFilter={statusFilter} 
        />
      )}
    </div>
  );
};

// Admin Profile Component
const AdminProfile = ({ profile, user, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Admin Profile" />
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Admin Profile" />
        <div className="text-center py-12">
          <User className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">Profile not found</p>
          <p className="text-slate-400 text-sm mb-4">Unable to load your profile information.</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-[#10b981] text-white border border-[#10b981] hover:bg-transparent hover:text-[#34d399] transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Admin Profile" />
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600/50 transition-all duration-300"
        >
          <Loader2 className="h-4 w-4" />
          Refresh
        </button>
      </div>
      
      <div className="space-y-6 text-slate-300">
        <div className="bg-slate-800/30 p-4 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-3">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Full Name</p>
              <p className="text-white font-medium">{user.fullName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Role</p>
              <p className="text-white font-medium capitalize">Administrator</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Member Since</p>
              <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-slate-700/50 border border-slate-600">
            <Users className="h-12 w-12 text-[#34d399]" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">System Administrator</h4>
            <p className="text-sm text-slate-400">Platform Administrator with full access</p>
            <p className="text-xs text-slate-500 mt-1">
              Profile ID: {profile?.id || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#10b981]/20 to-blue-600/20 p-4 border border-[#34d399]/30">
          <h4 className="text-lg font-semibold text-white mb-2">Administrator Privileges</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• View all harvest, manufacturing, and lab reports</li>
            <li>• Access to complete system analytics</li>
            <li>• User management capabilities</li>
            <li>• System configuration access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('all-reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data states - replace with actual API calls
  const [harvestReports, setHarvestReports] = useState([]);
  const [manufacturingReports, setManufacturingReports] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const { logout, getProfile, authenticatedFetch, profile, user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      await getProfile();
      await fetchAllReports();
    };
    fetchData();
  }, [getProfile]);

  const fetchAllReports = async () => {
    setIsLoading(true);
    try {
      // Fetch all reports from admin endpoints
      const [harvestData, manufacturingData, labData] = await Promise.allSettled([
        authenticatedFetch('/api/admin/harvests').catch(() => ({ data: [] })),
        authenticatedFetch('/api/admin/manufacturing_reports').catch(() => ({ data: [] })),
        authenticatedFetch('/api/admin/lab_reports').catch(() => ({ data: [] }))
      ]);

      const harvestReports = harvestData.status === 'fulfilled' ? (harvestData.value?.data || []) : [];
      const manufacturingReports = manufacturingData.status === 'fulfilled' ? (manufacturingData.value?.data || []) : [];
      const labReports = labData.status === 'fulfilled' ? (labData.value?.data || []) : [];

      setHarvestReports(harvestReports);
      setManufacturingReports(manufacturingReports);
      setLabReports(labReports);

      toast.success(`Loaded ${harvestReports.length + manufacturingReports.length + labReports.length} reports`);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      // Set empty arrays on error
      setHarvestReports([]);
      setManufacturingReports([]);
      setLabReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Reset filters when changing sections
    if (section !== 'all-reports') {
      setSearchTerm('');
      setFilterType('all');
      setStatusFilter('all');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefreshProfile = async () => {
    setProfileLoading(true);
    await getProfile();
    setProfileLoading(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'all-reports':
        return (
          <>
            <ReportsFilter 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <AllReports 
              harvestReports={harvestReports}
              manufacturingReports={manufacturingReports}
              labReports={labReports}
              isLoading={isLoading}
              searchTerm={searchTerm}
              filterType={filterType}
              statusFilter={statusFilter}
            />
          </>
        );
      case 'profile':
        return (
          <AdminProfile
            profile={profile}
            user={user}
            isLoading={profileLoading}
            onRefresh={handleRefreshProfile}
          />
        );
      default:
        return (
          <>
            <ReportsFilter 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <AllReports 
              harvestReports={harvestReports}
              manufacturingReports={manufacturingReports}
              labReports={labReports}
              isLoading={isLoading}
              searchTerm={searchTerm}
              filterType={filterType}
              statusFilter={statusFilter}
            />
          </>
        );
    }
  };

  const getTotalReports = () => {
    return harvestReports.length + manufacturingReports.length + labReports.length;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <Toaster />
      <div className="container mx-auto max-w-7xl">
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitoring {getTotalReports()} reports across the platform
            </p>
          </div>
          <div className="relative flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
              onClick={() => handleSectionChange('profile')}
            >
              <User className="h-5 w-5" />
              Profile
            </button>
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <nav className="space-y-2">
                <button
                  onClick={() => handleSectionChange('all-reports')}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 cursor-pointer hover:bg-green-600/20 ${
                    activeSection === 'all-reports' ? 'bg-green-600/30 border-l-4 border-green-500' : 'text-slate-400'
                  }`}
                >
                  <History className="h-5 w-5" />
                  <div className="text-left">
                    <div>All Reports</div>
                    <div className="text-xs text-slate-500">{getTotalReports()} total</div>
                  </div>
                </button>
              </nav>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <SectionTitle title="Platform Stats" />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-slate-300">Harvest Reports</span>
                  </div>
                  <span className="text-white font-semibold">{harvestReports.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-slate-300">Manufacturing</span>
                  </div>
                  <span className="text-white font-semibold">{manufacturingReports.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-slate-300">Lab Reports</span>
                  </div>
                  <span className="text-white font-semibold">{labReports.length}</span>
                </div>
              </div>
            </Card>
          </div>

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

export default AdminDashboard;