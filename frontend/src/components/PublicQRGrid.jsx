import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { usePublicStore } from "../stores/usePublicStore";
import QRCodeCard from "./QRCodeCard";
import toast from "react-hot-toast";

const PublicQRGrid = () => {
  const {
    publicQRCodes,
    isLoading,
    error,
    pagination,
    searchTerm,
    fetchPublicQRCodes,
    searchPublicQRCodes,
    loadNextPage,
    loadPreviousPage,
    refreshCurrentPage,
    setSearchTerm,
  } = usePublicStore();

  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    // Initial load
    fetchPublicQRCodes();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim() !== searchTerm) {
      searchPublicQRCodes(localSearchTerm.trim());
    }
  };

  const handleSearchClear = () => {
    setLocalSearchTerm("");
    if (searchTerm !== "") {
      searchPublicQRCodes("");
    }
  };

  const handleRefresh = () => {
    refreshCurrentPage();
    toast.success("QR codes refreshed!", {
      duration: 2000,
      position: "top-right",
    });
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
      <span className="ml-3 text-slate-400">Loading QR codes...</span>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12 space-y-4">
      <div className="w-20 h-20 bg-slate-800 mx-auto flex items-center justify-center">
        <Grid className="w-10 h-10 text-slate-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {searchTerm
            ? "No matching QR codes found"
            : "No public QR codes available"}
        </h3>
        <p className="text-slate-400">
          {searchTerm
            ? `Try adjusting your search term "${searchTerm}"`
            : "Check back later for new public traceability reports"}
        </p>
        {searchTerm && (
          <button
            onClick={handleSearchClear}
            className="mt-4 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-12 space-y-4">
      <div className="w-20 h-20 bg-red-900/20 border border-red-700/50 mx-auto flex items-center justify-center">
        <div className="text-2xl">⚠️</div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Failed to load QR codes
        </h3>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const PaginationControls = () => (
    <div className="flex items-center justify-between bg-slate-900/40 px-6 py-4 border border-slate-800">
      <div className="text-sm text-slate-400">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} QR codes
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-400">
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadPreviousPage}
            disabled={!pagination.hasPrev || isLoading}
            className="p-2 border border-slate-600 disabled:border-slate-800 disabled:text-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={loadNextPage}
            disabled={!pagination.hasNext || isLoading}
            className="p-2 border border-slate-600 disabled:border-slate-800 disabled:text-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Public QR Codes
            </h2>
            <p className="text-slate-400">
              Browse verified traceability reports from our network
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex border border-slate-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by product name, herb species, or harvest ID..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium transition-colors disabled:cursor-not-allowed"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="px-4 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Active Search Indicator */}
        {searchTerm && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              Searching for:{" "}
              <span className="text-emerald-400 font-medium">
                "{searchTerm}"
              </span>
            </span>
            <button
              onClick={handleSearchClear}
              className="text-slate-500 hover:text-slate-300 ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : isLoading && publicQRCodes.length === 0 ? (
        <LoadingSpinner />
      ) : publicQRCodes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* QR Cards Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {publicQRCodes.map((qrData) => (
              <QRCodeCard key={qrData.qrCode} qrData={qrData} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && <PaginationControls />}

          {/* Loading overlay for pagination */}
          {isLoading && publicQRCodes.length > 0 && (
            <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 px-4 py-2 flex items-center gap-3 shadow-lg">
              <div className="animate-spin w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
              <span className="text-sm text-white">Loading...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicQRGrid;
