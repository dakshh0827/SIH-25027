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
  const {
    getScannerImageUrl,
    downloadScannerQR,
    shareReportURL,
    getReportUrl,
  } = usePublicStore();

  // Force the correct ngrok URL directly
  const API_BASE_URL = "https://cfacb9603025.ngrok-free.app";
  const reportUrl = `${API_BASE_URL}/api/qr/report/${qrData.qrCode}`;
  const shareableUrl = `${API_BASE_URL}/api/qr/report/${qrData.qrCode}`;

  // Client-side QR generation function using QR Server API
  const generateClientSideQR = (size = 256) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      shareableUrl
    )}&ecc=H&margin=10`;
  };

  // Alternative endpoints to try
  const imageUrlsToTry = [
    `${API_BASE_URL}/api/public/qr/${qrData.qrCode}/scanner`,
    qrData.qrImageUrl && !qrData.qrImageUrl.includes("localhost")
      ? qrData.qrImageUrl
      : null,
    generateClientSideQR(256), // Client-side generated QR
  ].filter(Boolean);

  // Set initial image URL
  useEffect(() => {
    if (imageUrlsToTry.length > 0) {
      setCurrentImageUrl(imageUrlsToTry[0]);
    }
  }, [qrData.qrCode]);

  // Debug logging
  console.log("QRScannerModal Debug:", {
    qrCode: qrData.qrCode,
    currentImageUrl,
    reportUrl,
    shareableUrl,
    retryAttempt,
    imageUrlsToTry,
  });

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDownload = async () => {
    try {
      // For download, always use a working QR generation
      const downloadUrl = generateClientSideQR(512); // Higher resolution for download

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch QR image");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qr-scanner-${qrData.qrCode}-${
        qrData.productName?.replace(/\s+/g, "-") || "product"
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

      toast.success("QR code downloaded successfully!", {
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleShare = async () => {
    try {
      await shareReportURL(qrData.qrCode, qrData.productName);
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Report URL copied to clipboard!", {
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      toast.error("Failed to copy URL", {
        duration: 2000,
        position: "top-right",
      });
    }
  };

  const handleViewReport = () => {
    window.open(reportUrl, "_blank");
    toast.success(`Opening report for ${qrData.productName}`, {
      duration: 2000,
      position: "top-right",
    });
  };

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    console.error("QR Image failed to load:", currentImageUrl);

    // Try next image URL if available
    if (retryAttempt < imageUrlsToTry.length - 1) {
      const nextAttempt = retryAttempt + 1;
      const nextUrl = imageUrlsToTry[nextAttempt];
      console.log(`Trying fallback image ${nextAttempt + 1}:`, nextUrl);

      setRetryAttempt(nextAttempt);
      setCurrentImageUrl(nextUrl);
      setImageLoaded(false);
      setImageError(false);
      return;
    }

    // All URLs failed - this should not happen with client-side generation as fallback
    setImageError(true);
    toast.error("Failed to load QR scanner image", {
      duration: 3000,
      position: "top-right",
    });
  };

  const handleImageLoad = () => {
    console.log("QR Image loaded successfully:", currentImageUrl);
    setImageLoaded(true);
  };

  // Get source type for display
  const getImageSourceType = () => {
    if (currentImageUrl.includes("api.qrserver.com")) {
      return "Generated QR Code";
    } else if (currentImageUrl.includes("/api/public/qr/")) {
      return "Backend QR Service";
    } else if (currentImageUrl.startsWith("data:")) {
      return "Stored QR Image";
    }
    return "Unknown Source";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="pr-10">
            <h2 className="text-xl font-bold text-white mb-2">
              QR Scanner Code
            </h2>
            <p className="text-sm text-slate-400">
              Scan this QR code with your phone camera to access the full
              traceability report
            </p>
          </div>

          {/* Product Info */}
          <div className="bg-slate-800/50 p-4 space-y-2">
            <h3 className="font-semibold text-white">{qrData.productName}</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <p>
                <span className="text-emerald-400">Herb:</span>{" "}
                {qrData.herbSpecies}
              </p>
              <p>
                <span className="text-emerald-400">Harvest ID:</span>{" "}
                {qrData.harvestIdentifier}
              </p>
              {qrData.batchId && (
                <p>
                  <span className="text-emerald-400">Batch ID:</span>{" "}
                  {qrData.batchId}
                </p>
              )}
            </div>
          </div>

          {/* QR Code Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-6 border-2 border-slate-600 relative">
              {!imageLoaded && !imageError && (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-200 animate-pulse">
                  <div className="text-slate-500">Loading QR Code...</div>
                </div>
              )}

              {imageError ? (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-200 text-slate-600">
                  <div className="text-center">
                    <div className="text-lg mb-2">⚠️</div>
                    <div className="text-sm">Failed to load QR code</div>
                    <div className="text-xs mt-2 text-slate-500">
                      All fallback sources failed
                    </div>
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

            {/* QR Status Info */}
            <div className="text-xs text-center text-slate-400">
              <p>Source: {getImageSourceType()}</p>
              <p>Points to: {shareableUrl}</p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/30 p-4 text-center space-y-2 border border-slate-700/50">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">How to scan</span>
              </div>
              <div className="text-sm text-slate-300 space-y-1">
                <p>1. Open your phone's camera app</p>
                <p>2. Point the camera at the QR code above</p>
                <p>3. Tap the notification that appears</p>
                <p>4. View the complete traceability report</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleViewReport}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              View Report
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900 font-medium transition-colors duration-200 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-medium transition-colors duration-200 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <button
              onClick={handleCopyUrl}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-medium transition-colors duration-200 active:scale-95"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-600/10 border border-blue-600/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Info className="w-4 h-4" />
              <span className="font-medium text-sm">
                Additional Information
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p>
                • This QR code provides access to the complete supply chain
                traceability report
              </p>
              <p>
                • The report includes harvest, manufacturing, and lab testing
                information
              </p>
              <p>• All data is verified and stored securely on our platform</p>
              <p>
                • QR Code:{" "}
                <span className="font-mono text-emerald-400">
                  {qrData.qrCode}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
