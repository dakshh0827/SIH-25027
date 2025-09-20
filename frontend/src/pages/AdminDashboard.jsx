import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  User,
  Users,
  Factory,
  FlaskConical,
  LogOut,
  Loader2,
  Calendar,
  MapPin,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

// Reusable UI components
const Card = ({ children }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl space-y-6">
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-xl text-white font-semibold border-b border-slate-700/50 pb-2">
    {title}
  </h3>
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

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
      <div className="text-sm text-slate-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-700/50 border border-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm text-slate-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm border transition-all duration-300 ${
                currentPage === page
                  ? "bg-[#34d399] border-[#34d399] text-slate-900 font-semibold"
                  : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-700/50 border border-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Filter/Search component
const ReportsFilter = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => (
  <div className="bg-slate-800/30 p-4 border border-slate-700/50 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search reports by ID, name, etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
      >
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="final">Final</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  </div>
);

// Expandable Report Row Component
const ExpandableReportRow = ({
  report,
  expandedRows,
  toggleExpanded,
  index,
  isAllReportsView,
}) => {
  const isExpanded = expandedRows.includes(index);

  const getReportTypeIcon = (type) => {
    switch (type) {
      case "Harvest":
        return <Users className="h-4 w-4 text-green-400" />;
      case "Manufacturing":
        return <Factory className="h-4 w-4 text-blue-400" />;
      case "Lab":
        return <FlaskConical className="h-4 w-4 text-purple-400" />;
      default:
        return null;
    }
  };

  // Modified logic for rendering basic cells without value column
  const renderBasicInfo = () => {
    let identifierCell, detailsCell, statusCell;

    const statusBadge = (status) => {
      const styles = {
        completed: "bg-green-600/30 text-green-400",
        final: "bg-green-600/30 text-green-400",
        "in-progress": "bg-blue-600/30 text-blue-400",
        cancelled: "bg-red-600/30 text-red-400",
        default: "bg-yellow-600/30 text-yellow-400",
      };
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
            styles[status] || styles.default
          }`}
        >
          {status}
        </span>
      );
    };

    switch (report.type) {
      case "Harvest":
        identifierCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
            {report.identifier}
          </td>
        );
        detailsCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {report.herbSpecies}
          </td>
        );
        statusCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {statusBadge(report.status)}
          </td>
        );
        break;
      case "Manufacturing":
        identifierCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
            {report.batchId}
          </td>
        );
        detailsCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {report.herbUsed}
          </td>
        );
        statusCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {statusBadge(report.status)}
          </td>
        );
        break;
      case "Lab":
        identifierCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
            {report.identifier}
          </td>
        );
        detailsCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {report.testType}
          </td>
        );
        statusCell = (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {statusBadge(report.status)}
          </td>
        );
        break;
      default:
        return null;
    }

    if (isAllReportsView) {
      return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <div className="flex items-center gap-2">
              {getReportTypeIcon(report.type)}
              <span>{report.type}</span>
            </div>
          </td>
          {identifierCell}
          {detailsCell}
          {statusCell}
        </>
      );
    } else {
      return (
        <>
          {identifierCell}
          {detailsCell}
          {statusCell}
        </>
      );
    }
  };

  const renderExpandedInfo = () => {
    const testResultBadge = (result) => {
      const resLower = result?.toLowerCase() || "";
      let style = "bg-blue-600/30 text-blue-400";
      if (resLower.includes("pass")) style = "bg-green-600/30 text-green-400";
      if (resLower.includes("fail")) style = "bg-red-600/30 text-red-400";
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${style}`}
        >
          {result}
        </span>
      );
    };

    switch (report.type) {
      case "Harvest":
        return (
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="text-slate-400">Harvest Weight:</span>{" "}
                  <span className="text-white ml-2 font-semibold">
                    {report.harvestWeightKg} kg
                  </span>
                </p>
                <p>
                  <MapPin className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Location:</span>{" "}
                  <span className="text-white ml-2">{report.location}</span>
                </p>
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Season:</span>{" "}
                  <span className="text-white ml-2">
                    {report.harvestSeason}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Created:</span>{" "}
                  <span className="text-white ml-2">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <FileText className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Report ID:</span>{" "}
                  <span className="text-white ml-2 font-mono text-xs">
                    {report.id}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
      case "Manufacturing":
        return (
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="text-slate-400">Quantity Used:</span>{" "}
                  <span className="text-white ml-2 font-semibold">
                    {report.quantityUsedKg} kg
                  </span>
                </p>
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Effective Date:</span>{" "}
                  <span className="text-white ml-2">
                    {new Date(report.effectiveDate).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Expiry Date:</span>{" "}
                  <span className="text-white ml-2">
                    {report.expiryDate
                      ? new Date(report.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <FileText className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Report ID:</span>{" "}
                  <span className="text-white ml-2 font-mono text-xs">
                    {report.id}
                  </span>
                </p>
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Created:</span>{" "}
                  <span className="text-white ml-2">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
      case "Lab":
        return (
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="text-slate-400">Test Result:</span>{" "}
                  <span className="text-white ml-2">
                    {testResultBadge(report.testResult)}
                  </span>
                </p>
                <p>
                  <FileText className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Manufacturing Report:</span>{" "}
                  <span className="text-white ml-2 font-mono text-xs">
                    {report.manufacturingReportId}
                  </span>
                </p>
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Issued Date:</span>{" "}
                  <span className="text-white ml-2">
                    {new Date(report.issuedDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <FileText className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Report ID:</span>{" "}
                  <span className="text-white ml-2 font-mono text-xs">
                    {report.id}
                  </span>
                </p>
                <p>
                  <Calendar className="h-4 w-4 inline mr-2 text-slate-500" />{" "}
                  <span className="text-slate-400">Created:</span>{" "}
                  <span className="text-white ml-2">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const colSpan = isAllReportsView ? 5 : 4;

  return (
    <>
      <tr className="hover:bg-slate-800/50 transition-colors duration-200 border-b border-slate-700/30">
        {renderBasicInfo()}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <button
            onClick={() => toggleExpanded(index)}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50 transition-all duration-300"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {isExpanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={colSpan} className="p-0">
            {renderExpandedInfo()}
          </td>
        </tr>
      )}
    </>
  );
};

// Generic Reports Table Component
const ReportsTable = ({
  reports,
  reportType,
  isLoading,
  searchTerm,
  statusFilter,
  tableHeaders,
  isAllReportsView = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState([]);
  const reportsPerPage = 10;

  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      Object.values(report).some((val) =>
        String(val).toLowerCase().includes(searchLower)
      );
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + reportsPerPage
  );

  const toggleExpanded = (indexInPage) => {
    const reportId = paginatedReports[indexInPage].id;
    setExpandedRows((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows([]);
  }, [searchTerm, statusFilter, reports]);

  if (isLoading) {
    return <LoadingSpinner message={`Loading ${reportType} reports...`} />;
  }

  const getEmptyState = () => {
    const icons = {
      Harvest: <Users className="h-16 w-16 text-slate-500 mx-auto mb-4" />,
      Manufacturing: (
        <Factory className="h-16 w-16 text-slate-500 mx-auto mb-4" />
      ),
      Lab: <FlaskConical className="h-16 w-16 text-slate-500 mx-auto mb-4" />,
      All: <History className="h-16 w-16 text-slate-500 mx-auto mb-4" />,
    };
    return (
      <div className="text-center py-12">
        {icons[reportType]}
        <p className="text-slate-500 text-lg mb-2">
          No {reportType.toLowerCase()} reports found
        </p>
        <p className="text-slate-400 text-sm">
          No data matches your current filters.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!isAllReportsView && (
        <SectionTitle
          title={`${reportType} Reports (${filteredReports.length})`}
        />
      )}
      {filteredReports.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400">
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/40 text-slate-300 divide-y divide-slate-700/50">
                {paginatedReports.map((report, index) => (
                  <ExpandableReportRow
                    key={report.id || index}
                    report={report}
                    expandedRows={expandedRows.filter((id) => id === report.id)}
                    toggleExpanded={() => toggleExpanded(index)}
                    index={report.id}
                    isAllReportsView={isAllReportsView}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        getEmptyState()
      )}
    </div>
  );
};

// Admin Profile Component
const AdminProfile = ({ profile, user, isLoading, onRefresh }) => {
  if (isLoading || (!user && isLoading)) {
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
          <p className="text-slate-500 text-lg mb-2">Profile Not Found</p>
          <p className="text-slate-400 text-sm mb-4">
            Unable to load your profile information.
          </p>
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

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Admin Profile" />
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600/50 transition-all duration-300"
        >
          <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-6 text-slate-300">
        <div className="bg-slate-800/30 p-4 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-3">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <span className="text-sm text-slate-400">Full Name:</span>
              <br />
              <span className="font-medium text-white">{user.fullName}</span>
            </p>
            <p>
              <span className="text-sm text-slate-400">Email:</span>
              <br />
              <span className="font-medium text-white">{user.email}</span>
            </p>
            <p>
              <span className="text-sm text-slate-400">Role:</span>
              <br />
              <span className="font-medium text-white capitalize">
                Administrator
              </span>
            </p>
            <p>
              <span className="text-sm text-slate-400">Member Since:</span>
              <br />
              <span className="font-medium text-white">
                {formatDate(user.createdAt)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-4 bg-slate-700/50 border border-slate-600">
            <User className="h-12 w-12 text-[#34d399]" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">
              System Administrator
            </h4>
            <p className="text-sm text-slate-400">
              Platform Administrator with full access
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Profile ID: {profile?.id || "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#10b981]/20 to-blue-600/20 p-4 border border-[#34d399]/30">
          <h4 className="text-lg font-semibold text-white mb-2">
            Administrator Privileges
          </h4>
          <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>View all harvest, manufacturing, and lab reports</li>
            <li>Access to complete system analytics</li>
            <li>User management capabilities</li>
            <li>System configuration access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("reports");
  const [activeReportType, setActiveReportType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [harvestReports, setHarvestReports] = useState([]);
  const [manufacturingReports, setManufacturingReports] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [allReports, setAllReports] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const logout = useAuthStore((state) => state.logout);
  const getProfile = useAuthStore((state) => state.getProfile);
  const authenticatedFetch = useAuthStore((state) => state.authenticatedFetch);

  // Select the specific state values your component needs.
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const profileLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // FIX: Was setLoading
      try {
        await fetchAllReports();
        await getProfile();
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast.error("Could not load dashboard data.");
      } finally {
        setIsLoading(false); // FIX: Was setLoading
      }
    };

    loadData();
  }, []);

  const fetchAllReports = async () => {
    setIsLoading(true);
    try {
      const [harvestRes, manuRes, labRes] = await Promise.allSettled([
        authenticatedFetch("/api/admin/harvests"),
        authenticatedFetch("/api/admin/manufacturing_reports"),
        authenticatedFetch("/api/admin/lab_reports"),
      ]);

      const harvestData =
        harvestRes.status === "fulfilled" ? harvestRes.value?.data || [] : [];
      const manuData =
        manuRes.status === "fulfilled" ? manuRes.value?.data || [] : [];
      const labData =
        labRes.status === "fulfilled" ? labRes.value?.data || [] : [];

      if (harvestRes.status === "rejected")
        toast.error("Failed to fetch harvest reports");
      if (manuRes.status === "rejected")
        toast.error("Failed to fetch manufacturing reports");
      if (labRes.status === "rejected")
        toast.error("Failed to fetch lab reports");

      const formattedHarvest = harvestData.map((r) => ({
        ...r,
        type: "Harvest",
      }));
      const formattedManu = manuData.map((r) => ({
        ...r,
        type: "Manufacturing",
      }));
      const formattedLab = labData.map((r) => ({ ...r, type: "Lab" }));

      setHarvestReports(formattedHarvest);
      setManufacturingReports(formattedManu);
      setLabReports(formattedLab);
      setAllReports(
        [...formattedHarvest, ...formattedManu, ...formattedLab].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );

      const total = harvestData.length + manuData.length + labData.length;
      if (total > 0) {
        toast.success(`Loaded ${total} reports successfully`);
      } else {
        toast.error("No reports found or failed to load reports");
      }
    } catch (error) {
      console.error("Error in fetchAllReports:", error);
      toast.error("An unexpected error occurred while fetching reports");
      setHarvestReports([]);
      setManufacturingReports([]);
      setLabReports([]);
      setAllReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderReportsSection = () => {
    const commonProps = { isLoading, searchTerm, statusFilter };
    // Updated table headers without the Value column
    const tableHeaders = {
      all: ["Type", "Identifier / Batch ID", "Details", "Status"],
      harvest: ["Identifier", "Herb Species", "Status"],
      manufacturing: ["Batch ID", "Herb Used", "Status"],
      lab: ["Identifier", "Test Type", "Status"],
    };

    switch (activeReportType) {
      case "harvest":
        return (
          <ReportsTable
            reports={harvestReports}
            reportType="Harvest"
            tableHeaders={tableHeaders.harvest}
            {...commonProps}
          />
        );
      case "manufacturing":
        return (
          <ReportsTable
            reports={manufacturingReports}
            reportType="Manufacturing"
            tableHeaders={tableHeaders.manufacturing}
            {...commonProps}
          />
        );
      case "lab":
        return (
          <ReportsTable
            reports={labReports}
            reportType="Lab"
            tableHeaders={tableHeaders.lab}
            {...commonProps}
          />
        );
      default:
        return (
          <ReportsTable
            reports={allReports}
            reportType="All"
            tableHeaders={tableHeaders.all}
            isAllReportsView={true}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <Toaster />
      <div className="container mx-auto max-w-7xl">
        <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-700/50">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitoring {allReports.length} reports across the platform
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
            <button
              onClick={() => setActiveSection("profile")}
              className="flex items-center gap-2 px-4 py-2 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white cursor-pointer"
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
                  onClick={() => {
                    setActiveSection("reports");
                    setActiveReportType("all");
                  }}
                  className={`w-full flex items-center gap-4 p-4 transition-all duration-300 cursor-pointer hover:bg-green-600/20 ${
                    activeSection === "reports"
                      ? "bg-green-600/30 border-l-4 border-green-500 text-white"
                      : "text-slate-400"
                  }`}
                >
                  <History className="h-5 w-5" />
                  <div className="text-left">
                    <div>All Reports</div>
                    <div className="text-xs text-slate-500">
                      {allReports.length} total
                    </div>
                  </div>
                </button>
              </nav>
            </Card>

            <Card>
              <SectionTitle title="Platform Stats" />
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveSection("reports");
                    setActiveReportType("harvest");
                  }}
                  className={`w-full flex items-center justify-between p-3 border transition-all duration-300 ${
                    activeReportType === "harvest" &&
                    activeSection === "reports"
                      ? "bg-[#34d399]/20 border-[#34d399]"
                      : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Users className="h-5 w-5 text-green-400" /> Harvest Reports
                  </div>
                  <span className="text-white font-semibold">
                    {harvestReports.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection("reports");
                    setActiveReportType("manufacturing");
                  }}
                  className={`w-full flex items-center justify-between p-3 border transition-all duration-300 ${
                    activeReportType === "manufacturing" &&
                    activeSection === "reports"
                      ? "bg-[#34d399]/20 border-[#34d399]"
                      : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Factory className="h-5 w-5 text-blue-400" /> Manufacturing
                  </div>
                  <span className="text-white font-semibold">
                    {manufacturingReports.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection("reports");
                    setActiveReportType("lab");
                  }}
                  className={`w-full flex items-center justify-between p-3 border transition-all duration-300 ${
                    activeReportType === "lab" && activeSection === "reports"
                      ? "bg-[#34d399]/20 border-[#34d399]"
                      : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <FlaskConical className="h-5 w-5 text-purple-400" /> Lab
                    Reports
                  </div>
                  <span className="text-white font-semibold">
                    {labReports.length}
                  </span>
                </button>
              </div>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              {activeSection === "reports" ? (
                <>
                  <ReportsFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                  />
                  {renderReportsSection()}
                </>
              ) : (
                <AdminProfile
                  profile={profile}
                  user={user}
                  isLoading={profileLoading}
                  onRefresh={getProfile}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
