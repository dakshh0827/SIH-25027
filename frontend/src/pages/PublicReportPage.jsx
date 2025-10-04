import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Loader } from "lucide-react";
import toast from "react-hot-toast";

const PublicReportPage = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect directly to the PDF report
    const redirectToPdf = async () => {
      try {
        setIsLoading(true);

        // Check if QR code exists and is public first
        const checkResponse = await fetch(
          `https://ayurtrace-sepia.vercel.app/api/public/qr/${qrCode}/preview`
        );

        if (!checkResponse.ok) {
          if (checkResponse.status === 404) {
            setError("QR code not found or not publicly available");
            return;
          }
          throw new Error("Failed to verify QR code");
        }

        // If QR code is valid, redirect to PDF
        const pdfUrl = `hhttps://ayurtrace-sepia.vercel.app/api/qr/report/${qrCode}`;
        window.location.href = pdfUrl;

        // Show success message
        toast.success("Opening traceability report...", {
          duration: 2000,
          position: "top-center",
        });
      } catch (error) {
        console.error("Error accessing report:", error);
        setError(error.message || "Failed to access report");
        toast.error("Failed to load report", {
          duration: 4000,
          position: "top-center",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (qrCode) {
      redirectToPdf();
    } else {
      setError("Invalid QR code");
      setIsLoading(false);
    }
  }, [qrCode]);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleDownloadDirect = () => {
    const pdfUrl = `https://ayurtrace-sepia.vercel.app/api/qr/report/${qrCode}`;
    window.open(pdfUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Loading Report</h2>
            <p className="text-slate-400">
              Verifying QR code and preparing your traceability report...
            </p>
            <div className="text-sm text-emerald-400 font-mono">
              QR Code: {qrCode}
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              If your browser blocks the download, please allow pop-ups for this
              site
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-900/20 border-2 border-red-700/50 rounded-full flex items-center justify-center mx-auto">
            <div className="text-3xl">⚠️</div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Report Not Available
            </h2>
            <p className="text-slate-400">{error}</p>
            <div className="text-sm text-slate-500 font-mono">
              QR Code: {qrCode}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={handleDownloadDirect}
              className="w-full px-6 py-3 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900 font-medium transition-colors"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Direct Download
            </button>

            <button
              onClick={handleBackToHome}
              className="w-full px-6 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Home
            </button>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-4">
            <p className="text-xs text-slate-500">
              This QR code may not be publicly available yet or may have been
              scanned incorrectly. Please contact the product provider if you
              believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // This shouldn't normally be reached due to redirect, but just in case
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Redirecting to Report
          </h2>
          <p className="text-slate-400">
            You should be redirected to the PDF report automatically.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownloadDirect}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4 inline mr-2" />
            Open Report Manually
          </button>

          <button
            onClick={handleBackToHome}
            className="block mx-auto px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicReportPage;
