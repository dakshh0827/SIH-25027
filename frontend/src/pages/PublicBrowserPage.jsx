import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PublicQRGrid from "../components/PublicQRGrid";
import { usePublicStore } from "../stores/usePublicStore";

const PublicBrowsePage = () => {
  const navigate = useNavigate();
  const { stats, fetchPublicStats } = usePublicStore();

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div className="flex items-center gap-6">
              <div className="text-sm text-slate-400">
                Browse all public traceability reports
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      {stats && (
        <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border-b border-emerald-600/20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {stats.totalPublicReports}
                </div>
                <div className="text-sm text-slate-400">Public Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {stats.totalHarvests}
                </div>
                <div className="text-sm text-slate-400">Total Harvests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {stats.totalParticipants}
                </div>
                <div className="text-sm text-slate-400">Network Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {stats.totalFarmers}
                </div>
                <div className="text-sm text-slate-400">Farmers</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PublicQRGrid />
      </div>
    </div>
  );
};

export default PublicBrowsePage;
