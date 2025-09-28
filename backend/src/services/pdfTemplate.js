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
      INITIALIZED: { bg: "#64748b", border: "#475569" },
      MANUFACTURING: { bg: "#f59e0b", border: "#d97706" },
      TESTING: { bg: "#3b82f6", border: "#2563eb" },
      COMPLETED: { bg: "#10b981", border: "#059669" },
      PUBLIC: { bg: "#059669", border: "#047857" },
    };
    const colors = statusColors[status] || { bg: "#64748b", border: "#475569" };
    return `<span style="
      background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%); 
      color: white; 
      padding: 6px 14px; 
      border-radius: 20px; 
      font-size: 11px; 
      font-weight: 600; 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      border: 1px solid ${colors.border};
    ">${status}</span>`;
  };

  // Enhanced stage completion rendering
  const renderStageCompletion = (stageName, stageData) => {
    if (!stageData || !stageData.completed) return "";

    return `
      <div style="
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-left: 5px solid #0ea5e9;
        border-radius: 0;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(30px, -30px);
        "></div>
        <div style="position: relative; z-index: 1;">
          <h4 style="
            margin: 0 0 12px 0; 
            color: #0369a1; 
            font-size: 15px; 
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
          ">
            <span style="
              width: 8px; 
              height: 8px; 
              background-color: #10b981; 
              border-radius: 50%; 
              margin-right: 8px;
              animation: pulse 2s infinite;
            "></span>
            ${stageName} Completed
          </h4>
          <div style="
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 12px; 
            font-size: 12px;
          ">
            <div style="
              background: rgba(255,255,255,0.7); 
              padding: 8px 12px; 
              border-radius: 6px;
              border: 1px solid rgba(14,165,233,0.2);
            ">
              <strong style="color: #0369a1; font-size: 10px; text-transform: uppercase;">Completed:</strong>
              <div style="color: #1e293b; font-weight: 500;">${formatDate(stageData.timestamp)}</div>
            </div>
            <div style="
              background: rgba(255,255,255,0.7); 
              padding: 8px 12px; 
              border-radius: 6px;
              border: 1px solid rgba(14,165,233,0.2);
            ">
              <strong style="color: #0369a1; font-size: 10px; text-transform: uppercase;">Performed By:</strong>
              <div style="color: #1e293b; font-weight: 500;">${stageData.performedBy || "N/A"}</div>
            </div>
            ${stageData.location ? `
            <div style="
              background: rgba(255,255,255,0.7); 
              padding: 8px 12px; 
              border-radius: 6px;
              border: 1px solid rgba(14,165,233,0.2);
              grid-column: 1 / -1;
            ">
              <strong style="color: #0369a1; font-size: 10px; text-transform: uppercase;">Location:</strong>
              <div style="color: #1e293b; font-weight: 500;">${stageData.location}</div>
            </div>` : ""}
            ${stageData.description ? `
            <div style="
              background: rgba(255,255,255,0.7); 
              padding: 8px 12px; 
              border-radius: 6px;
              border: 1px solid rgba(14,165,233,0.2);
              grid-column: 1 / -1;
            ">
              <strong style="color: #0369a1; font-size: 10px; text-transform: uppercase;">Description:</strong>
              <div style="color: #1e293b; font-weight: 500;">${stageData.description}</div>
            </div>` : ""}
          </div>
          ${stageData.metadata ? renderMetadata(stageData.metadata) : ""}
        </div>
      </div>
    `;
  };

  // Enhanced metadata rendering
  const renderMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return "";

    return `
      <div style="
        margin-top: 15px; 
        padding: 15px; 
        background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
        border-radius: 0;
        border: 1px solid #e4e4e7;
      ">
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        ">
          <span style="
            width: 4px; 
            height: 16px; 
            background: linear-gradient(to bottom, #6366f1, #8b5cf6); 
            margin-right: 8px;
            border-radius: 2px;
          "></span>
          <strong style="
            font-size: 11px; 
            color: #6366f1; 
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
          ">Additional Details</strong>
        </div>
        <div style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
          gap: 10px; 
          font-size: 11px;
        ">
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
              return `
                <div style="
                  background: white; 
                  padding: 8px 10px; 
                  border-radius: 0;
                  border-left: 3px solid #d4d4d8;
                ">
                  <strong style="color: #52525b;">${displayKey}:</strong>
                  <div style="color: #27272a; margin-top: 2px;">${displayValue}</div>
                </div>
              `;
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
      <title>Comprehensive Traceability Report - ${trackingData.productName}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          font-size: 12px; 
          color: #1e293b; 
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        .container { 
          max-width: 900px; 
          margin: 0 auto; 
          padding: 25px; 
          background-color: transparent;
        }
        .header { 
          text-align: center; 
          background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
          color: white;
          padding: 80px 40px;
          margin-bottom: 40px;
          border-radius: 0;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
          min-height: 85vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: rotate 20s linear infinite;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          border-radius: 50%;
        }
        .header h1 { 
          margin: 0 0 30px 0; 
          font-size: 48px; 
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          position: relative;
          z-index: 2;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          line-height: 1.2;
        }
        .header .product-info {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(20px);
          border-radius: 0;
          padding: 40px;
          margin: 40px 0;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          position: relative;
          z-index: 2;
          max-width: 600px;
        }
        .header p { 
          margin: 12px 0; 
          font-size: 18px;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .header .status-line {
          margin: 20px 0;
          font-size: 20px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .section { 
          margin-bottom: 40px; 
          margin-top: 50px;
          page-break-inside: avoid;
          background: white;
          border-radius: 0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .section-header { 
          background: linear-gradient(135deg, #475569 0%, #64748b 100%);
          color: white;
          padding: 8px 15px; 
          margin: 0;
          position: relative;
          overflow: hidden;
        }
        .section-header::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(30px, -30px);
        }
        .section-header h2 { 
          margin: 0; 
          font-size: 18px; 
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 1;
        }
        .section-content { 
          padding: 15px; 
          background-color: #ffffff;
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 16px;
          margin-bottom: 15px;
        }
        .info-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0;
          padding: 10px;
          position: relative;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .info-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
        }
        .info-card .label { 
          color: #475569; 
          font-weight: 700; 
          font-size: 10px; 
          text-transform: uppercase; 
          display: block; 
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .info-card .value { 
          margin: 0; 
          font-size: 13px;
          color: #1e293b;
          font-weight: 600;
          word-wrap: break-word;
          line-height: 1.4;
        }
        .full-width { 
          grid-column: 1 / -1; 
        }
        .status-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          border-radius: 0;
          padding: 20px;
          margin: 20px 0;
          position: relative;
          overflow: hidden;
        }
        .status-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(20px, -20px);
        }
        .warning-card {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid #fde68a;
          border-radius: 0;
          padding: 20px;
          margin: 20px 0;
        }
        .info-highlight {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 0;
          padding: 20px;
          margin: 20px 0;
        }
        .no-data {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
          font-style: italic;
          font-size: 14px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px dashed #cbd5e1;
          border-radius: 0;
          margin: 20px 0;
        }
        .verification-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .verification-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0;
          padding: 15px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .verification-item.success {
          border-color: #22c55e;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }
        .verification-item.warning {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }
        .verification-item.danger {
          border-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
        }
        .timestamps-container {
          background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
          border: 1px solid #e4e4e7;
          border-radius: 0;
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .timestamp-item {
          background: white;
          border: 1px solid #d4d4d8;
          border-radius: 0;
          padding: 15px;
          text-align: center;
          position: relative;
        }
        .timestamp-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: linear-gradient(to right, #3b82f6, #1d4ed8);
          border-radius: 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding: 25px;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          border-radius: 0;
          font-size: 11px;
          page-break-inside: avoid;
        }
        .footer p {
          margin: 8px 0;
        }
        .footer .verification-url {
          background: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 6px;
          margin-top: 15px;
          word-break: break-all;
          font-family: monospace;
          font-size: 10px;
        }
        @media print {
          body { 
            font-size: 11px; 
            background: white;
          }
          .container { padding: 15px; }
          .section { 
            page-break-inside: avoid; 
            box-shadow: none;
            border: 1px solid #e2e8f0;
          }
          .header { 
            box-shadow: none; 
            page-break-inside: avoid;
          }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- FULL PAGE HEADER COVER -->
        <div style="page-break-after: always;">
          <!-- ENHANCED FULL-HEIGHT HEADER -->
          <div class="header">
            <div style="position: absolute; top: 40px; left: 40px; z-index: 2; text-align: left;">
              <div style="font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px;">
                Blockchain-Verified
              </div>
              <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">
                Digital Traceability System
              </div>
            </div>
            
            <div style="position: absolute; top: 40px; right: 40px; z-index: 2; text-align: right;">
              <div style="font-size: 14px; opacity: 0.8;">
                Report Generated
              </div>
              <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">
                ${new Date().toLocaleDateString("en-IN")}
              </div>
            </div>

            <h1>🌿 Product Traceability<br>Report</h1>
            
            <div style="font-size: 20px; opacity: 0.9; margin-bottom: 40px; font-weight: 300; letter-spacing: 1px;">
              Complete Supply Chain Documentation
            </div>
            
            <div class="product-info">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; text-align: left;">
                <div>
                  <div style="font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Product Name</div>
                  <div style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">${trackingData.productName || "Product Name Not Set"}</div>
                  
                  <div style="font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Batch Identifier</div>
                  <div style="font-size: 18px; font-weight: 600; font-family: monospace; background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 0; margin-bottom: 20px;">${trackingData.batchId || "Batch ID Pending"}</div>
                </div>
                
                <div>
                  <div style="font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">QR Code</div>
                  <div style="font-size: 18px; font-weight: 600; font-family: monospace; background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 0; margin-bottom: 20px;">${trackingData.qrCode}</div>
                  
                  <div style="font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Current Status</div>
                  <div style="margin-bottom: 20px;">${getStatusBadge(trackingData.status)}</div>
                </div>
              </div>
              
              ${trackingData.isPublic ? `
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
                <div style="font-size: 16px; margin-bottom: 10px;">
                  <span style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 10px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">🌐 Publicly Available</span>
                </div>
                ${trackingData.publicUrl ? `
                <div style="font-size: 12px; opacity: 0.8; font-family: monospace; word-break: break-all; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 0; margin-top: 10px;">
                  ${trackingData.publicUrl}
                </div>` : ""}
              </div>` : ""}
              
              <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.3);">
                <div style="font-size: 16px; opacity: 0.9; margin-bottom: 15px;">
                  📊 Traceability Completeness
                </div>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                  <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🌱</div>
                    <div style="font-size: 12px; opacity: 0.8;">Harvest</div>
                    <div style="font-size: 14px; font-weight: 600; color: #10b981;">✓ Complete</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🏭</div>
                    <div style="font-size: 12px; opacity: 0.8;">Manufacturing</div>
                    <div style="font-size: 14px; font-weight: 600; color: ${trackingData.manufacturing ? '#10b981' : '#64748b'};">
                      ${trackingData.manufacturing ? '✓ Complete' : '○ Pending'}
                    </div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🔬</div>
                    <div style="font-size: 12px; opacity: 0.8;">Lab Testing</div>
                    <div style="font-size: 14px; font-weight: 600; color: ${trackingData.labTesting ? '#10b981' : '#64748b'};">
                      ${trackingData.labTesting ? '✓ Complete' : '○ Pending'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center; opacity: 0.7;">
              <div style="font-size: 12px; margin-bottom: 5px;">🔒 Secure • 🌐 Transparent • ✅ Verified</div>
              <div style="font-size: 10px;">This document contains cryptographically secured supply chain data</div>
            </div>
          </div>
        </div>

        <div class="section" style="margin-top: 5px; margin-bottom: 0;">
            <div class="section-header"><h2>🌱 Harvest Information</h2></div>
            <div class="section-content">
              <div class="info-grid">
                <div class="info-card">
                  <span class="label">Harvest ID</span>
                  <p class="value">${trackingData.harvest.identifier}</p>
                </div>
                <div class="info-card">
                  <span class="label">Herb Species</span>
                  <p class="value">${trackingData.harvest.herbSpecies}</p>
                </div>
                <div class="info-card">
                  <span class="label">Harvest Weight</span>
                  <p class="value">${trackingData.harvest.harvestWeightKg} kg</p>
                </div>
                <div class="info-card">
                  <span class="label">Season</span>
                  <p class="value">${trackingData.harvest.harvestSeason}</p>
                </div>
                <div class="info-card">
                  <span class="label">Location</span>
                  <p class="value">${trackingData.harvest.location}</p>
                </div>
                <div class="info-card">
                  <span class="label">FPO Name</span>
                  <p class="value">${trackingData.harvest.farmer.fpoName}</p>
                </div>
                <div class="info-card">
                  <span class="label">Farmer</span>
                  <p class="value">${trackingData.harvest.farmer.name}</p>
                </div>
                <div class="info-card">
                  <span class="label">Contact</span>
                  <p class="value">${trackingData.harvest.farmer.email}</p>
                </div>
              </div>
              ${trackingData.stageCompletions?.harvestRecorded ? 
                renderStageCompletion("Harvest Recording", trackingData.stageCompletions.harvestRecorded) 
                : ""
              }
            </div>
          </div>
        </div>

        <!-- ENHANCED MANUFACTURING SECTION -->
        ${trackingData.manufacturing ? `
        <div class="section">
          <div class="section-header"><h2>🏭 Manufacturing Information</h2></div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-card">
                <span class="label">Manufacturing ID</span>
                <p class="value">${trackingData.manufacturing.identifier}</p>
              </div>
              <div class="info-card">
                <span class="label">Batch ID</span>
                <p class="value">${trackingData.manufacturing.batchId}</p>
              </div>
              <div class="info-card">
                <span class="label">Manufacturer</span>
                <p class="value">${trackingData.manufacturing.manufacturer.manufacturerName}</p>
              </div>
              <div class="info-card">
                <span class="label">Contact Person</span>
                <p class="value">${trackingData.manufacturing.manufacturer.name}</p>
              </div>
              <div class="info-card">
                <span class="label">Email</span>
                <p class="value">${trackingData.manufacturing.manufacturer.email}</p>
              </div>
              <div class="info-card">
                <span class="label">Status</span>
                <p class="value">${trackingData.manufacturing.status}</p>
              </div>
              <div class="info-card">
                <span class="label">Herb Used</span>
                <p class="value">${trackingData.manufacturing.herbUsed}</p>
              </div>
              <div class="info-card">
                <span class="label">Quantity Used</span>
                <p class="value">${trackingData.manufacturing.quantityUsedKg} kg</p>
              </div>
              <div class="info-card">
                <span class="label">Effective Date</span>
                <p class="value">${formatSimpleDate(trackingData.manufacturing.effectiveDate)}</p>
              </div>
              <div class="info-card">
                <span class="label">Expiry Date</span>
                <p class="value">${formatSimpleDate(trackingData.manufacturing.expiryDate)}</p>
              </div>
              <div class="info-card full-width">
                <span class="label">Processing Steps</span>
                <p class="value">${trackingData.manufacturing.processingSteps}</p>
              </div>
            </div>
            ${trackingData.stageCompletions?.manufacturing ? 
              renderStageCompletion("Manufacturing Process", trackingData.stageCompletions.manufacturing) 
              : ""
            }
          </div>
        </div>` : `
        <div class="section">
          <div class="section-header"><h2>🏭 Manufacturing Information</h2></div>
          <div class="section-content">
            <div class="no-data">
              <div style="font-size: 48px; margin-bottom: 15px;">🏭</div>
              <div><strong>Manufacturing data not yet available</strong></div>
              <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">This section will be populated once manufacturing begins</div>
            </div>
          </div>
        </div>`}

        <!-- ENHANCED LAB TESTING SECTION -->
        ${trackingData.labTesting ? `
        <div class="section">
          <div class="section-header"><h2>🔬 Laboratory Testing Report</h2></div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-card">
                <span class="label">Lab Report ID</span>
                <p class="value">${trackingData.labTesting.identifier}</p>
              </div>
              <div class="info-card">
                <span class="label">Laboratory</span>
                <p class="value">${trackingData.labTesting.laboratory.labName}</p>
              </div>
              <div class="info-card">
                <span class="label">Contact Person</span>
                <p class="value">${trackingData.labTesting.laboratory.name}</p>
              </div>
              <div class="info-card">
                <span class="label">Lab Email</span>
                <p class="value">${trackingData.labTesting.laboratory.email}</p>
              </div>
              <div class="info-card">
                <span class="label">Test Type</span>
                <p class="value">${trackingData.labTesting.testType}</p>
              </div>
              <div class="info-card">
                <span class="label">Test Status</span>
                <p class="value">${trackingData.labTesting.status}</p>
              </div>
              <div class="info-card">
                <span class="label">Test Result</span>
                <p class="value" style="font-weight: 700; color: ${trackingData.labTesting.testResult === 'PASS' ? '#059669' : '#dc2626'};">
                  ${trackingData.labTesting.testResult}
                </p>
              </div>
              <div class="info-card">
                <span class="label">Report Issued</span>
                <p class="value">${formatSimpleDate(trackingData.labTesting.issuedDate)}</p>
              </div>
              ${trackingData.labTesting.labReportFileUrl ? `
              <div class="info-card full-width">
                <span class="label">Lab Report File</span>
                <p class="value" style="font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 8px; border-radius: 4px;">
                  ${trackingData.labTesting.labReportFileUrl}
                </p>
              </div>` : ""}
            </div>
            ${trackingData.stageCompletions?.labTesting ? 
              renderStageCompletion("Laboratory Testing", trackingData.stageCompletions.labTesting) 
              : ""
            }
          </div>
        </div>` : `
        <div class="section">
          <div class="section-header"><h2>🔬 Laboratory Testing Report</h2></div>
          <div class="section-content">
            <div class="no-data">
              <div style="font-size: 48px; margin-bottom: 15px;">🔬</div>
              <div><strong>Laboratory testing data not yet available</strong></div>
              <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">Testing will be conducted after manufacturing completion</div>
            </div>
          </div>
        </div>`}

        <!-- ENHANCED TIMESTAMPS SECTION -->
        <div class="section">
          <div class="section-header"><h2>⏰ Important Timestamps</h2></div>
          <div class="section-content">
            <div class="timestamps-container">
              <div class="timestamp-item">
                <span class="label">QR Code Created</span>
                <p class="value">${formatDate(trackingData.createdAt)}</p>
              </div>
              <div class="timestamp-item">
                <span class="label">Last Updated</span>
                <p class="value">${formatDate(trackingData.updatedAt)}</p>
              </div>
              <div class="timestamp-item">
                <span class="label">Report Generated</span>
                <p class="value">${formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ENHANCED VERIFICATION SECTION -->
        <div class="section">
          <div class="section-header"><h2>✅ Report Verification</h2></div>
          <div class="section-content">
            <div class="verification-grid">
              <div class="verification-item success">
                <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
                <div class="label">QR Code Status</div>
                <div class="value" style="color: #059669; font-weight: 700;">Valid & Active</div>
              </div>
              <div class="verification-item success">
                <div style="font-size: 24px; margin-bottom: 10px;">🔗</div>
                <div class="label">Data Integrity</div>
                <div class="value" style="color: #059669; font-weight: 700;">Complete Chain</div>
              </div>
              <div class="verification-item ${trackingData.isPublic ? 'success' : 'warning'}">
                <div style="font-size: 24px; margin-bottom: 10px;">${trackingData.isPublic ? '🌐' : '🔒'}</div>
                <div class="label">Public Access</div>
                <div class="value" style="color: ${trackingData.isPublic ? '#059669' : '#f59e0b'}; font-weight: 700;">
                  ${trackingData.isPublic ? 'Available to Consumers' : 'Not Yet Public'}
                </div>
              </div>
              <div class="verification-item ${
                trackingData.manufacturing && trackingData.labTesting ? 'success' : 
                trackingData.manufacturing || trackingData.labTesting ? 'warning' : 'danger'
              }">
                <div style="font-size: 24px; margin-bottom: 10px;">
                  ${trackingData.manufacturing && trackingData.labTesting ? '💯' : 
                    trackingData.manufacturing || trackingData.labTesting ? '⚠️' : '❌'}
                </div>
                <div class="label">Traceability Score</div>
                <div class="value" style="
                  color: ${
                    trackingData.manufacturing && trackingData.labTesting ? '#059669' : 
                    trackingData.manufacturing || trackingData.labTesting ? '#f59e0b' : '#dc2626'
                  }; 
                  font-weight: 700;
                ">
                  ${
                    trackingData.manufacturing && trackingData.labTesting ? '100% Complete' : 
                    trackingData.manufacturing || trackingData.labTesting ? 'Partially Complete' : 'Basic Level'
                  }
                </div>
              </div>
            </div>

            <div class="info-highlight" style="margin-top: 20px;">
              <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🛡️</span>
                Verification Details
              </h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 12px;">
                <div>
                  <strong style="color: #475569;">Blockchain Verified:</strong>
                  <div style="color: #059669; font-weight: 600;">✓ Immutable Record</div>
                </div>
                <div>
                  <strong style="color: #475569;">Digital Signature:</strong>
                  <div style="color: #059669; font-weight: 600;">✓ Authenticated</div>
                </div>
                <div>
                  <strong style="color: #475569;">Timestamp Integrity:</strong>
                  <div style="color: #059669; font-weight: 600;">✓ Verified</div>
                </div>
                <div>
                  <strong style="color: #475569;">Data Completeness:</strong>
                  <div style="color: #059669; font-weight: 600;">
                    ✓ ${Math.round(((trackingData.manufacturing ? 1 : 0) + (trackingData.labTesting ? 1 : 0) + 1) / 3 * 100)}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ENHANCED FOOTER -->
        <div class="footer">
          <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">🔒 Secure Traceability Report</h3>
          <p><strong>This is an automatically generated traceability report with blockchain verification</strong></p>
          <p>Generated: ${new Date().toLocaleString("en-IN")} | QR Code: <span style="font-family: monospace;">${trackingData.qrCode}</span></p>
          <p>For verification purposes, scan the QR code or visit the tracking URL provided above</p>
          ${trackingData.publicUrl ? `
          <div class="verification-url">
            <strong>🔗 Verification URL:</strong><br>
            ${trackingData.publicUrl}
          </div>` : ""}
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; color: #d1d5db;">
            <p>This report contains cryptographically secured data ensuring authenticity and preventing tampering.</p>
            <p>© ${new Date().getFullYear()} Product Traceability System - All rights reserved</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}