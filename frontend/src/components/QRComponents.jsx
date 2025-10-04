import React, { useState, useEffect } from "react";
import {
  QrCode,
  Eye,
  Share2,
  Download,
  ExternalLink,
  Calendar,
  MapPin,
  Factory,
  Tractor,
  TestTubeDiagonal,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

// QR Code Display Component for dashboards
const QRCodeDisplay = ({
  qrCode,
  qrImageUrl,
  publicUrl,
  productName,
  onShare,
}) => {
  const handleDownload = () => {
    if (qrImageUrl) {
      const link = document.createElement("a");
      link.href = qrImageUrl;
      link.download = `QR_${qrCode}.png`;
      link.click();
      toast.success("QR code downloaded!");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Track ${productName || "Product"}`,
        text: `Track the journey of this Ayurvedic product from farm to shelf`,
        url: publicUrl,
      });
    } else {
      navigator.clipboard.writeText(publicUrl);
      toast.success("Tracking link copied to clipboard!");
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Product QR Code</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
            title="Download QR Code"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
            title="Share Tracking Link"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {qrImageUrl && (
        <div className="flex justify-center">
          <img
            src={qrImageUrl}
            alt={`QR Code for ${qrCode}`}
            className="w-48 h-48 border-2 border-slate-600"
          />
        </div>
      )}

      <div className="text-center space-y-2">
        <p className="text-sm text-slate-400">QR Code: {qrCode}</p>
        <p className="text-xs text-slate-500">
          Scan to track product journey or visit:
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 ml-1"
          >
            {publicUrl}
          </a>
        </p>
      </div>
    </div>
  );
};

// Public Product Journey Display Component
const ProductJourney = ({ journeyData }) => {
  const getStageIcon = (stage) => {
    switch (stage) {
      case "Harvest":
        return Tractor;
      case "Manufacturing":
        return Factory;
      case "Lab Testing":
        return TestTubeDiagonal;
      default:
        return CheckCircle;
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Harvest":
        return "text-green-400 border-green-500";
      case "Manufacturing":
        return "text-blue-400 border-blue-500";
      case "Lab Testing":
        return "text-purple-400 border-purple-500";
      default:
        return "text-emerald-400 border-emerald-500";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Product Journey</h2>
        <p className="text-slate-400">
          Track the complete lifecycle from farm to shelf
        </p>
      </div>

      <div className="relative">
        {/* Journey Timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

        {journeyData.map((stage, index) => {
          const Icon = getStageIcon(stage.stage);
          const colorClasses = getStageColor(stage.stage);

          return (
            <div
              key={index}
              className="relative flex items-start space-x-6 pb-8"
            >
              {/* Stage Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-16 h-16 bg-slate-900 border-2 ${colorClasses} rounded-full`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Stage Content */}
              <div className="flex-1 bg-slate-900/40 border border-slate-700/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    {stage.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(stage.date)}
                  </div>
                </div>

                <p className="text-slate-300">{stage.details}</p>

                {stage.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{stage.location}</span>
                  </div>
                )}

                {stage.batchId && (
                  <div className="text-sm text-slate-400">
                    <span className="font-medium">Batch ID:</span>{" "}
                    {stage.batchId}
                  </div>
                )}

                {/* Additional Data Display */}
                {stage.data && (
                  <div className="mt-4 p-4 bg-slate-800/50 border border-slate-600/30 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-200">
                      Details:
                    </h4>
                    {Object.entries(stage.data).map(([key, value]) => {
                      if (value && key !== "id") {
                        return (
                          <div key={key} className="text-sm text-slate-400">
                            <span className="capitalize font-medium">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>{" "}
                            {value}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Public QR Tracking Page Component
const PublicQRTracker = ({ qrCode }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://ayurtrace.onrender.com/api/qr/public/${qrCode}`
        );

        if (!response.ok) {
          throw new Error("Product not found or not yet available");
        }

        const result = await response.json();
        setTrackingData(result.data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchTrackingData();
    }
  }, [qrCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <p className="text-sm text-slate-500">
            This product may not be ready for public tracking yet, or the QR
            code may be invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="container mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <QrCode className="w-10 h-10 text-emerald-400" />
            <h1 className="text-4xl font-bold text-white">
              Product Authenticity Verified
            </h1>
          </div>

          <div className="bg-slate-900/40 border border-slate-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-emerald-400">
              {trackingData.productName}
            </h2>
            <div className="flex justify-center items-center gap-4 text-sm text-slate-400">
              <span>QR Code: {trackingData.qrCode}</span>
              <span>•</span>
              <span>Batch ID: {trackingData.batchId}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Verified Authentic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Journey */}
        <ProductJourney journeyData={trackingData.journey} />

        {/* Footer */}
        <div className="mt-12 text-center py-8 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Powered by AyurTrace - Transparent Supply Chain Tracking
          </p>
        </div>
      </div>
    </div>
  );
};

// Public QR Browser Component for Landing Page
const PublicQRBrowser = () => {
  const [publicProducts, setPublicProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProducts = async () => {
      try {
        const response = await fetch(
          "https://ayurtrace.onrender.com/api/qr/public?limit=6"
        );
        const result = await response.json();
        setPublicProducts(result.data || []);
      } catch (error) {
        console.error("Error fetching public products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProducts();
  }, []);

  const handleProductClick = (qrCode) => {
    window.open(`/track/${qrCode}`, "_blank");
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400">Loading verified products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          Recently Verified Products
        </h3>
        <p className="text-slate-400">
          Click on any product to see its complete journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicProducts.map((product) => (
          <div
            key={product.qrCode}
            onClick={() => handleProductClick(product.qrCode)}
            className="bg-slate-900/40 border border-slate-700/50 p-4 cursor-pointer transition-all duration-300 hover:bg-slate-800/50 hover:border-emerald-400/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white text-sm">
                  {product.productName}
                </h4>
              </div>
              <Eye className="w-4 h-4 text-slate-400" />
            </div>

            <p className="text-xs text-slate-400 mb-2">
              Batch: {product.batchId}
            </p>
            <p className="text-xs text-slate-500">
              Verified: {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {publicProducts.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No verified products available yet.
        </div>
      )}
    </div>
  );
};

export { QRCodeDisplay, ProductJourney, PublicQRTracker, PublicQRBrowser };
