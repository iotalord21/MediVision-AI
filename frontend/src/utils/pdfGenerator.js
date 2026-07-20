import jsPDF from 'jspdf';

export const generatePdfReport = ({ user, diseaseName, result, inputData }) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleString();

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(34, 211, 238); // Cyan
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MediVision AI', 14, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Explainable Healthcare Intelligence Report', 14, 30);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${dateStr}`, 140, 30);

  // Patient Info Section
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 46, 196, 46);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient & Session Details', 14, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Patient Name: ${user?.full_name || 'N/A'}`, 14, 63);
  doc.text(`Email Address: ${user?.email || 'N/A'}`, 14, 70);
  doc.text(`Diagnostic Module: ${diseaseName.toUpperCase()} PREDICTION`, 14, 77);

  // Result Card Box
  const isPositive = result?.status === 'Positive';
  if (isPositive) {
    doc.setFillColor(254, 242, 242); // Light Red
    doc.setDrawColor(248, 113, 113);
  } else {
    doc.setFillColor(240, 253, 244); // Light Green
    doc.setDrawColor(74, 222, 128);
  }
  doc.roundedRect(14, 85, 182, 35, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPositive ? 153 : 21, isPositive ? 27 : 128, isPositive ? 27 : 61);
  doc.text(`PREDICTION RESULT: ${result?.status?.toUpperCase() || 'UNKNOWN'} RISK`, 20, 97);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const confidence = result?.probability ? (result.probability * 100).toFixed(1) : 'N/A';
  doc.text(`Model Confidence Score: ${confidence}%`, 20, 106);
  doc.text(`Clinical Risk Level: ${isPositive ? 'HIGH - Further Evaluation Advised' : 'LOW - Normal Range'}`, 20, 113);

  // Clinical Inputs Summary Table
  let currentY = 130;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Clinical Input Features Submitted', 14, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  if (inputData) {
    Object.entries(inputData).forEach(([key, val]) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setTextColor(100, 116, 139);
      doc.text(`${key.replace(/_/g, ' ').toUpperCase()}:`, 18, currentY);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(String(val), 110, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 7;
    });
  }

  // SHAP Explanations Section
  if (result?.shap_explanations && result.shap_explanations.length > 0) {
    currentY += 8;
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Top Clinical Risk Drivers (SHAP XAI Explanation)', 14, currentY);

    currentY += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    result.shap_explanations.slice(0, 5).forEach((item) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      const impactText = item.impact === 'positive' ? '[+] Increases Risk' : '[-] Decreases Risk';
      doc.setTextColor(item.impact === 'positive' ? 225 : 16, item.impact === 'positive' ? 29 : 185, item.impact === 'positive' ? 72 : 129);
      doc.text(`${item.feature_name} (${item.feature_value}): ${impactText} (SHAP Score: ${item.shap_value})`, 18, currentY);
      currentY += 6;
    });
  }

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('CONFIDENTIAL MEDICAL SUMMARY - FOR DEMONSTRATION & CLINICAL ASSISTANCE ONLY', 14, 285);

  // Save PDF
  const filename = `MediVision_${diseaseName}_${Date.now()}.pdf`;
  doc.save(filename);
};
