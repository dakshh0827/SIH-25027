import React, { useState, useEffect } from "react";
import {
  QrCode,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const AdminQRManagement = () => {
  const [qrTrackers, setQRTrackers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const { authenticatedFetch } = useAuthStore();

  useEffect(() => {
    fetchQRTrackers();
  }, [filter]);

  const fetchQRTrackers = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === "all"
          ? "/api/qr/admin/all"
          : `/api/qr/admin/all?status=${filter}`;

      const response = await authenticatedFetch(endpoint);
      setQRTrackers(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch QR trackers");
    } finally {
      setLoading(false);
    }
  };

  const makeQRPublic = async (qrCode) => {
    try {
      await authenticatedFetch(`/api/qr/make-public/${qrCode}`, {
        method: "PUT",
      });

      toast.success(`QR code ${qrCode} is now public!`);
      await fetchQRTrackers(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to make QR code public");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "INITIALIZED":
        return "bg-blue-600/30 text-blue-400";
      case "MANUFACTURING":
        return "bg-yellow-600/30 text-yellow-400";
      case "TESTING":
        return "bg-purple-600/30 text-purple-400";
      case "COMPLETED":
        return "bg-green-600/30 text-green-400";
      case "PUBLIC":
        return "bg-emerald-600/30 text-emerald-400";
      default:
        return "bg-gray-600/30 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return CheckCircle;
      case "PUBLIC":
        return Eye;
      default:
        return Clock;
    }
  };

  const canMakePublic = (tracker) => {
    return tracker.status === "COMPLETED" && !tracker.isPublic;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading QR trackers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">QR Code Management</h2>
          <p className="text-slate-400">Monitor and publish product QR codes</p>
        </div>
        <button
          onClick={fetchQRTrackers}
          className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          "all",
          "INITIALIZED",
          "MANUFACTURING",
          "TESTING",
          "COMPLETED",
          "PUBLIC",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* QR Trackers Table */}
      <div className="bg-slate-900/40 border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">
                  QR Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">
                  Created
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">
                  Stages
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {qrTrackers.map((tracker) => {
                const StatusIcon = getStatusIcon(tracker.status);
                const stages = tracker.stageCompletions || {};

                return (
                  <tr
                    key={tracker.qrCode}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-white">
                          {tracker.productName || "Product Name TBD"}
                        </div>
                        <div className="text-sm text-slate-400">
                          Batch: {tracker.batchId || "N/A"}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-sm text-slate-300">
                        {tracker.qrCode}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            tracker.status
                          )}`}
                        >
                          {tracker.status.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-sm text-slate-400">
                      {new Date(tracker.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            stages.harvest?.completed
                              ? "bg-green-400"
                              : "bg-slate-600"
                          }`}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            stages.manufacturing?.completed
                              ? "bg-green-400"
                              : "bg-slate-600"
                          }`}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            stages.labTesting?.completed
                              ? "bg-green-400"
                              : "bg-slate-600"
                          }`}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        H • M • L
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {canMakePublic(tracker) && (
                          <button
                            onClick={() => makeQRPublic(tracker.qrCode)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-colors"
                            title="Make Public"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {tracker.isPublic && (
                          <a
                            href={tracker.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-400/10 transition-colors"
                          title="View Details"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {qrTrackers.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500">No QR trackers found</p>
            <p className="text-slate-600 text-sm">
              QR codes will appear here as products move through the supply
              chain
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-700/50 p-4">
          <div className="text-sm text-slate-400">Total QR Codes</div>
          <div className="text-2xl font-bold text-white">
            {qrTrackers.length}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-700/50 p-4">
          <div className="text-sm text-slate-400">Public</div>
          <div className="text-2xl font-bold text-emerald-400">
            {qrTrackers.filter((t) => t.isPublic).length}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-700/50 p-4">
          <div className="text-sm text-slate-400">Completed</div>
          <div className="text-2xl font-bold text-green-400">
            {qrTrackers.filter((t) => t.status === "COMPLETED").length}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-700/50 p-4">
          <div className="text-sm text-slate-400">Ready to Publish</div>
          <div className="text-2xl font-bold text-yellow-400">
            {qrTrackers.filter((t) => canMakePublic(t)).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQRManagement;
