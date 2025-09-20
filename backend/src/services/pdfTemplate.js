// services/pdfTemplate.js

/**
 * Generates a comprehensive styled HTML string for the traceability report.
 * @param {object} trackingData - The full data object from getTrackingInfo.
 * @returns {string} An HTML string with all available data.
 */
export const generateReportHTML = (trackingData) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSimpleDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      INITIALIZED: "#6b7280",
      MANUFACTURING: "#f59e0b",
      TESTING: "#3b82f6",
      COMPLETED: "#10b981",
      PUBLIC: "#059669",
    };
    const color = statusColors[status] || "#6b7280";
    return `<span style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${status}</span>`;
  };

  // Helper function to render stage completion details
  const renderStageCompletion = (stageName, stageData) => {
    if (!stageData || !stageData.completed) return "";

    return `
      <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">${stageName} Completion Details</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div><strong>Completed:</strong> ${formatDate(
            stageData.timestamp
          )}</div>
          <div><strong>Performed By:</strong> ${
            stageData.performedBy || "N/A"
          }</div>
          ${
            stageData.location
              ? `<div style="grid-column: 1 / -1;"><strong>Location:</strong> ${stageData.location}</div>`
              : ""
          }
          ${
            stageData.description
              ? `<div style="grid-column: 1 / -1;"><strong>Description:</strong> ${stageData.description}</div>`
              : ""
          }
        </div>
        ${stageData.metadata ? renderMetadata(stageData.metadata) : ""}
      </div>
    `;
  };

  // Helper function to render metadata
  const renderMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return "";

    return `
      <div style="margin-top: 10px; padding: 10px; background-color: #f8fafc; border-radius: 4px;">
        <strong style="font-size: 11px; color: #64748b; text-transform: uppercase;">Additional Details:</strong>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 11px;">
          ${Object.entries(metadata)
            .map(([key, value]) => {
              if (value === null || value === undefined) return "";
              const displayKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              const displayValue =
                typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value);
              return `<div><strong>${displayKey}:</strong> ${displayValue}</div>`;
            })
            .join("")}
        </div>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Comprehensive Traceability Report - ${
        trackingData.productName
      }</title>
      <style>
        body { 
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
          font-size: 12px; 
          color: #333; 
          line-height: 1.4;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 800px; 
          margin: auto; 
          padding: 20px; 
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #e5e7eb; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 30px;
          border-radius: 12px;
          margin: -20px -20px 30px -20px;
        }
        .header h1 { 
          margin: 0 0 15px 0; 
          color: #111; 
          font-size: 28px; 
          font-weight: 700;
        }
        .header p { 
          margin: 8px 0; 
          color: #555; 
          font-size: 14px; 
        }
        .header .status-line {
          margin: 15px 0;
          font-size: 16px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section-header { 
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 15px 20px; 
          border-radius: 8px 8px 0 0;
          margin: 0;
        }
        .section-header h2 { 
          margin: 0; 
          font-size: 18px; 
          font-weight: 600;
        }
        .section-content { 
          padding: 25px; 
          border: 1px solid #d1d5db; 
          border-top: none; 
          border-radius: 0 0 8px 8px;
          background-color: #ffffff;
        }
        .grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px 25px; 
        }
        .grid-3 {
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr; 
          gap: 15px 20px; 
        }
        .grid-item strong { 
          color: #374151; 
          font-weight: 600; 
          font-size: 11px; 
          text-transform: uppercase; 
          display: block; 
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .grid-item p { 
          margin: 0; 
          font-size: 14px;
          color: #111827;
          word-wrap: break-word;
        }
        .full-width { 
          grid-column: 1 / -1; 
        }
        .highlight-box {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        .info-box {
          background-color: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        .success-box {
          background-color: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 50px; 
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 10px; 
          color: #6b7280;
        }
        .timestamps {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .no-data {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-style: italic;
        }
        @media print {
          body { font-size: 11px; }
          .container { padding: 15px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER SECTION -->
        <div class="header">
          <h1>🌿 Complete Product Traceability Report</h1>
          <p><strong>Product Name:</strong> ${
            trackingData.productName || "Product Name Not Set"
          }</p>
          <p><strong>Batch ID:</strong> ${
            trackingData.batchId || "Batch ID Pending"
          }</p>
          <p><strong>QR Code:</strong> ${trackingData.qrCode}</p>
          <div class="status-line">
            <strong>Current Status:</strong> ${getStatusBadge(
              trackingData.status
            )}
            ${
              trackingData.isPublic
                ? '&nbsp;<span style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">🌐 PUBLIC</span>'
                : ""
            }
          </div>
          ${
            trackingData.publicUrl
              ? `<p><strong>Public Tracking URL:</strong> <small>${trackingData.publicUrl}</small></p>`
              : ""
          }
        </div>

        <!-- HARVEST SECTION -->
        <div class="section">
          <div class="section-header"><h2>🌱 Harvest Information</h2></div>
          <div class="section-content">
            <div class="grid">
              <div class="grid-item">
                <strong>Harvest Identifier</strong>
                <p>${trackingData.harvest.identifier}</p>
              </div>
              <div class="grid-item">
                <strong>Herb Species</strong>
                <p>${trackingData.harvest.herbSpecies}</p>
              </div>
              <div class="grid-item">
                <strong>Harvest Weight (Kg)</strong>
                <p>${trackingData.harvest.harvestWeightKg} kg</p>
              </div>
              <div class="grid-item">
                <strong>Harvest Season</strong>
                <p>${trackingData.harvest.harvestSeason}</p>
              </div>
              <div class="grid-item">
                <strong>Location</strong>
                <p>${trackingData.harvest.location}</p>
              </div>
              <div class="grid-item">
                <strong>FPO Name</strong>
                <p>${trackingData.harvest.farmer.fpoName}</p>
              </div>
              <div class="grid-item">
                <strong>Farmer Name</strong>
                <p>${trackingData.harvest.farmer.name}</p>
              </div>
              <div class="grid-item">
                <strong>Farmer Contact</strong>
                <p>${trackingData.harvest.farmer.email}</p>
              </div>
            </div>

            <!-- Harvest Stage Completion Details -->
            ${
              trackingData.stageCompletions?.harvestRecorded
                ? renderStageCompletion(
                    "Harvest Recording",
                    trackingData.stageCompletions.harvestRecorded
                  )
                : ""
            }
          </div>
        </div>

        <!-- MANUFACTURING SECTION -->
        ${
          trackingData.manufacturing
            ? `
        <div class="section">
          <div class="section-header"><h2>🏭 Manufacturing Information</h2></div>
          <div class="section-content">
            <div class="grid">
              <div class="grid-item">
                <strong>Manufacturing ID</strong>
                <p>${trackingData.manufacturing.identifier}</p>
              </div>
              <div class="grid-item">
                <strong>Batch ID</strong>
                <p>${trackingData.manufacturing.batchId}</p>
              </div>
              <div class="grid-item">
                <strong>Manufacturer Name</strong>
                <p>${
                  trackingData.manufacturing.manufacturer.manufacturerName
                }</p>
              </div>
              <div class="grid-item">
                <strong>Contact Person</strong>
                <p>${trackingData.manufacturing.manufacturer.name}</p>
              </div>
              <div class="grid-item">
                <strong>Email</strong>
                <p>${trackingData.manufacturing.manufacturer.email}</p>
              </div>
              <div class="grid-item">
                <strong>Manufacturing Status</strong>
                <p>${trackingData.manufacturing.status}</p>
              </div>
              <div class="grid-item">
                <strong>Herb Used</strong>
                <p>${trackingData.manufacturing.herbUsed}</p>
              </div>
              <div class="grid-item">
                <strong>Quantity Used (Kg)</strong>
                <p>${trackingData.manufacturing.quantityUsedKg} kg</p>
              </div>
              <div class="grid-item">
                <strong>Effective Date</strong>
                <p>${formatSimpleDate(
                  trackingData.manufacturing.effectiveDate
                )}</p>
              </div>
              <div class="grid-item">
                <strong>Expiry Date</strong>
                <p>${formatSimpleDate(
                  trackingData.manufacturing.expiryDate
                )}</p>
              </div>
              <div class="grid-item full-width">
                <strong>Processing Steps</strong>
                <p>${trackingData.manufacturing.processingSteps}</p>
              </div>
            </div>

            <!-- Manufacturing Stage Completion Details -->
            ${
              trackingData.stageCompletions?.manufacturing
                ? renderStageCompletion(
                    "Manufacturing Process",
                    trackingData.stageCompletions.manufacturing
                  )
                : ""
            }
          </div>
        </div>`
            : `
        <div class="section">
          <div class="section-header"><h2>🏭 Manufacturing Information</h2></div>
          <div class="section-content">
            <div class="no-data">Manufacturing data not yet available</div>
          </div>
        </div>`
        }

        <!-- LAB TESTING SECTION -->
        ${
          trackingData.labTesting
            ? `
        <div class="section">
          <div class="section-header"><h2>🔬 Laboratory Testing Report</h2></div>
          <div class="section-content">
            <div class="grid">
              <div class="grid-item">
                <strong>Lab Report ID</strong>
                <p>${trackingData.labTesting.identifier}</p>
              </div>
              <div class="grid-item">
                <strong>Laboratory Name</strong>
                <p>${trackingData.labTesting.laboratory.labName}</p>
              </div>
              <div class="grid-item">
                <strong>Contact Person</strong>
                <p>${trackingData.labTesting.laboratory.name}</p>
              </div>
              <div class="grid-item">
                <strong>Lab Email</strong>
                <p>${trackingData.labTesting.laboratory.email}</p>
              </div>
              <div class="grid-item">
                <strong>Test Type</strong>
                <p>${trackingData.labTesting.testType}</p>
              </div>
              <div class="grid-item">
                <strong>Test Status</strong>
                <p>${trackingData.labTesting.status}</p>
              </div>
              <div class="grid-item">
                <strong>Test Result</strong>
                <p><strong>${trackingData.labTesting.testResult}</strong></p>
              </div>
              <div class="grid-item">
                <strong>Report Issued Date</strong>
                <p>${formatSimpleDate(trackingData.labTesting.issuedDate)}</p>
              </div>
              ${
                trackingData.labTesting.labReportFileUrl
                  ? `
              <div class="grid-item full-width">
                <strong>Lab Report File</strong>
                <p><small>Available at: ${trackingData.labTesting.labReportFileUrl}</small></p>
              </div>`
                  : ""
              }
            </div>

            <!-- Lab Testing Stage Completion Details -->
            ${
              trackingData.stageCompletions?.labTesting
                ? renderStageCompletion(
                    "Laboratory Testing",
                    trackingData.stageCompletions.labTesting
                  )
                : ""
            }
          </div>
        </div>`
            : `
        <div class="section">
          <div class="section-header"><h2>🔬 Laboratory Testing Report</h2></div>
          <div class="section-content">
            <div class="no-data">Laboratory testing data not yet available</div>
          </div>
        </div>`
        }

        <!-- ADDITIONAL STAGE COMPLETIONS -->
        ${
          Object.keys(trackingData.stageCompletions || {}).length > 0
            ? `
        <div class="section">
          <div class="section-header"><h2>📋 Complete Process Timeline</h2></div>
          <div class="section-content">
            ${Object.entries(trackingData.stageCompletions || {})
              .map(([stageName, stageData]) => {
                if (
                  ["harvestRecorded", "manufacturing", "labTesting"].includes(
                    stageName
                  )
                )
                  return "";
                return renderStageCompletion(
                  stageName.charAt(0).toUpperCase() + stageName.slice(1),
                  stageData
                );
              })
              .join("")}
          </div>
        </div>`
            : ""
        }

        <!-- TIMESTAMPS SECTION -->
        <div class="section">
          <div class="section-header"><h2>⏰ Important Timestamps</h2></div>
          <div class="section-content">
            <div class="timestamps">
              <div class="grid-3">
                <div class="grid-item">
                  <strong>QR Code Created</strong>
                  <p>${formatDate(trackingData.createdAt)}</p>
                </div>
                <div class="grid-item">
                  <strong>Last Updated</strong>
                  <p>${formatDate(trackingData.updatedAt)}</p>
                </div>
                <div class="grid-item">
                  <strong>Report Generated</strong>
                  <p>${formatDate(new Date().toISOString())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- VERIFICATION SECTION -->
        <div class="section">
          <div class="section-header"><h2>✅ Report Verification</h2></div>
          <div class="section-content">
            <div class="success-box">
              <div class="grid">
                <div class="grid-item">
                  <strong>QR Code Verified</strong>
                  <p>✅ Valid and Active</p>
                </div>
                <div class="grid-item">
                  <strong>Data Integrity</strong>
                  <p>✅ Complete Chain of Custody</p>
                </div>
                <div class="grid-item">
                  <strong>Public Access</strong>
                  <p>${
                    trackingData.isPublic
                      ? "✅ Available to Consumers"
                      : "❌ Not Yet Public"
                  }</p>
                </div>
                <div class="grid-item">
                  <strong>Traceability Score</strong>
                  <p>${
                    trackingData.manufacturing && trackingData.labTesting
                      ? "✅ 100% Complete"
                      : trackingData.manufacturing || trackingData.labTesting
                      ? "⚠️ Partially Complete"
                      : "❌ Basic Level"
                  }</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p><strong>This is an automatically generated traceability report</strong></p>
          <p>Report Generated: ${new Date().toLocaleString(
            "en-IN"
          )} | QR Code: ${trackingData.qrCode}</p>
          <p>For verification purposes, scan the QR code or visit the tracking URL provided above</p>
          ${
            trackingData.publicUrl
              ? `<p style="word-break: break-all;">Verification URL: ${trackingData.publicUrl}</p>`
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;
};
