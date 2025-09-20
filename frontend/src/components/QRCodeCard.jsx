import React, { useState } from "react";
import {
  QrCode,
  Download,
  Share2,
  Eye,
  MapPin,
  Scale,
  User,
  Building,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { usePublicStore } from "../stores/usePublicStore";
import QRScannerModal from "./QRScannerModal";
import toast from "react-hot-toast";

const QRCodeCard = ({ qrData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const {
    downloadScannerQR,
    shareReportURL,
    getReportUrl,
    getScannerImageUrl,
  } = usePublicStore();

  const handleDownloadQR = async (e) => {
    e.stopPropagation();
    try {
      await downloadScannerQR(qrData.qrCode, qrData.productName);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleShareReport = async (e) => {
    e.stopPropagation();
    try {
      await shareReportURL(qrData.qrCode, qrData.productName);
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleViewReport = (e) => {
    e.stopPropagation();
    const reportUrl = getReportUrl(qrData.qrCode);
    window.open(reportUrl, "_blank");

    toast.success(`Opening report for ${qrData.productName}`, {
      duration: 2000,
      position: "top-right",
    });
  };

  const handleShowScanner = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown Date";
    }
  };

  const formatWeight = (weight) => {
    if (!weight) return "N/A";
    return `${parseFloat(weight).toFixed(1)} kg`;
  };

  return (
    <>
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-emerald-400/50 transition-all duration-300 group cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]">
        <div className="p-6 space-y-4">
          {/* Header with QR Preview */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {qrData.productName}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                <span className="font-medium text-emerald-400">
                  {qrData.herbSpecies}
                </span>
              </p>
            </div>

            {/* QR Code Preview */}
            <div className="flex-shrink-0 ml-4">
              {qrData.qrImageUrl && !imageError ? (
                <img
                  src={qrData.qrImageUrl}
                  alt="QR Code"
                  className="w-16 h-16 border border-slate-700 bg-white p-1 hover:border-emerald-400 transition-colors"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-emerald-400 transition-colors">
                  <QrCode className="w-8 h-8 text-slate-500" />
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="truncate">
                {qrData.farmerName || "Unknown Farmer"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="truncate">
                {qrData.harvestSeason || "Unknown Season"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="truncate">
                {qrData.harvestLocation || "Unknown Location"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>{formatWeight(qrData.harvestWeight)}</span>
            </div>
          </div>

          {/* Harvest ID and Date */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Harvest ID:</span>
              <span className="text-emerald-400 font-mono">
                {qrData.harvestIdentifier}
              </span>
            </div>

            {qrData.batchId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Batch ID:</span>
                <span className="text-emerald-400 font-mono">
                  {qrData.batchId}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Updated:</span>
              <span className="text-slate-400">
                {formatDate(qrData.updatedAt)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              {qrData.status}
            </span>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">
                {formatDate(qrData.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleViewReport}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors duration-200 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              View Report
            </button>

            <button
              onClick={handleShowScanner}
              className="flex items-center justify-center px-3 py-2 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900 text-sm font-medium transition-colors duration-200 active:scale-95"
              title="Show QR Scanner"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center px-3 py-2 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white text-sm font-medium transition-colors duration-200 active:scale-95"
              title="Download QR Code"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleShareReport}
              className="flex items-center justify-center px-3 py-2 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white text-sm font-medium transition-colors duration-200 active:scale-95"
              title="Share Report"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {isModalOpen && (
        <QRScannerModal qrData={qrData} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default QRCodeCard;
