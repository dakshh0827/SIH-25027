import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Copy,
  Smartphone,
  Info,
  ExternalLink,
} from "lucide-react";
import { usePublicStore } from "../stores/usePublicStore";
import toast from "react-hot-toast";

const QRScannerModal = ({ qrData, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const { shareReportURL } = usePublicStore();

  // Hardcoded ngrok URL for reliable linking
  const API_BASE_URL = "https://ayurtrace.onrender.com";
  const reportUrl = `${API_BASE_URL}/api/qr/report/${qrData.qrCode}`;
  const shareableUrl = reportUrl; // Use the same URL for sharing

  // Client-side QR generation as a reliable fallback
  const generateClientSideQR = (size = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      shareableUrl
    )}&ecc=H&margin=10`;
  };

  const imageUrlsToTry = [
    `${API_BASE_URL}/api/public/qr/${qrData.qrCode}/scanner`,
    qrData.qrImageUrl && !qrData.qrImageUrl.includes("localhost")
      ? qrData.qrImageUrl
      : null,
    generateClientSideQR(300),
  ].filter(Boolean);

  useEffect(() => {
    if (imageUrlsToTry.length > 0) {
      setCurrentImageUrl(imageUrlsToTry[0]);
    }
  }, [qrData.qrCode]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDownload = async () => {
    try {
      const downloadUrl = generateClientSideQR(512); // Higher res for download
      const response = await fetch(downloadUrl);
      if (!response.ok)
        throw new Error("Failed to fetch QR image for download");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `traceability-qr-${
        qrData.productName?.replace(/\s+/g, "-") || qrData.qrCode
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("QR code downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code.");
    }
  };

  const handleShare = () => shareReportURL(qrData.qrCode, qrData.productName);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Report URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL.");
    }
  };

  const handleViewReport = () => {
    window.open(reportUrl, "_blank");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    if (retryAttempt < imageUrlsToTry.length - 1) {
      const nextAttempt = retryAttempt + 1;
      setRetryAttempt(nextAttempt);
      setCurrentImageUrl(imageUrlsToTry[nextAttempt]);
      setImageLoaded(false);
      setImageError(false);
    } else {
      setImageError(true);
      toast.error("Failed to load QR scanner image.");
    }
  };

  const handleImageLoad = () => setImageLoaded(true);

  // Helper function to get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      INITIALIZED: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      MANUFACTURING: "bg-orange-600/20 text-orange-400 border-orange-600/30",
      TESTING: "bg-purple-600/20 text-purple-400 border-purple-600/30",
      COMPLETED: "bg-green-600/20 text-green-400 border-green-600/30",
      PUBLIC: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
    };

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold border rounded-full ${
          statusStyles[status] ||
          "bg-gray-600/20 text-gray-400 border-gray-600/30"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 max-w-3xl w-full relative transform animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left Column: QR Code & Product Info */}
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-white p-4 border-4 border-slate-700 shadow-lg">
              {!imageLoaded && !imageError && (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-200 animate-pulse text-slate-500">
                  Loading QR...
                </div>
              )}
              {imageError ? (
                <div className="w-64 h-64 flex items-center justify-center bg-red-100 text-red-600">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="font-semibold">Error Loading Image</div>
                  </div>
                </div>
              ) : (
                <img
                  src={currentImageUrl}
                  alt={`QR Scanner for ${qrData.productName}`}
                  className="w-64 h-64 object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoaded ? "block" : "none" }}
                  crossOrigin="anonymous"
                  key={`${qrData.qrCode}-${retryAttempt}`}
                />
              )}
            </div>
            <div className="bg-slate-800/50 p-4 border border-slate-700 w-full text-center">
              <h3 className="font-bold text-lg text-white mb-2">
                {qrData.productName}
              </h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>
                  <span className="font-semibold text-emerald-400">Herb:</span>{" "}
                  {qrData.herbSpecies}
                </p>
                <p>
                  <span className="font-semibold text-emerald-400">
                    Harvest ID:
                  </span>{" "}
                  {qrData.harvestIdentifier}
                </p>
                {qrData.batchId && (
                  <p>
                    <span className="font-semibold text-emerald-400">
                      Batch ID:
                    </span>{" "}
                    {qrData.batchId}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="font-semibold text-emerald-400">
                    Status:
                  </span>
                  {getStatusBadge(qrData.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex flex-col space-y-6">
            <div className="pr-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Traceability Report
              </h2>
              <p className="text-slate-400">
                Scan with your phone or use the actions below to view the
                product's journey from harvest to completion.
              </p>

              {/* Status-based information */}
              {qrData.status === "INITIALIZED" && (
                <div className="mt-3 p-3 bg-blue-600/10 border border-blue-600/20 rounded">
                  <p className="text-blue-400 text-sm">
                    <Info className="w-4 h-4 inline mr-2" />
                    This product has been harvested and recorded in the system.
                  </p>
                </div>
              )}
              {qrData.status === "MANUFACTURING" && (
                <div className="mt-3 p-3 bg-orange-600/10 border border-orange-600/20 rounded">
                  <p className="text-orange-400 text-sm">
                    <Info className="w-4 h-4 inline mr-2" />
                    This product is currently being processed by manufacturers.
                  </p>
                </div>
              )}
              {qrData.status === "TESTING" && (
                <div className="mt-3 p-3 bg-purple-600/10 border border-purple-600/20 rounded">
                  <p className="text-purple-400 text-sm">
                    <Info className="w-4 h-4 inline mr-2" />
                    This product has completed manufacturing and is undergoing
                    laboratory testing.
                  </p>
                </div>
              )}
              {(qrData.status === "COMPLETED" ||
                qrData.status === "PUBLIC") && (
                <div className="mt-3 p-3 bg-green-600/10 border border-green-600/20 rounded">
                  <p className="text-green-400 text-sm">
                    <Info className="w-4 h-4 inline mr-2" />
                    This product has completed all stages and is ready for
                    consumers.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-800/30 p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 text-emerald-400 mb-3">
                <Smartphone className="w-6 h-6" />
                <span className="font-semibold text-lg">How to Scan</span>
              </div>
              <ol className="text-slate-300 space-y-1 list-decimal list-inside">
                <li>Open your phone's camera app.</li>
                <li>Point it at the QR code on the left.</li>
                <li>Tap the link that appears on your screen.</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleViewReport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200 active:scale-95"
              >
                <ExternalLink className="w-4 h-4" /> View Report
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900 font-medium transition-colors duration-200 active:scale-95"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-medium transition-colors duration-200 active:scale-95"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-medium transition-colors duration-200 active:scale-95"
              >
                <Copy className="w-4 h-4" /> Copy URL
              </button>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 p-4 text-xs text-slate-400">
              <p className="font-semibold text-blue-400 mb-1">QR Code:</p>
              <p className="font-mono break-all">{qrData.qrCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
