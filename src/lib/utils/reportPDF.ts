import jsPDF from 'jspdf';

interface ReportData {
  id: number;
  vehicle: string;
  receipt: string;
  amount: string;
  collection: string;
  date?: string;
  time?: string;
}

export const generateCollectionReportPDF = async (reports: ReportData[]) => {
  const doc = new jsPDF();
  
  // Get current date and time
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);
  const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
  
  // Convert ordinal day (e.g., 1st, 2nd, 3rd, etc.)
  const day = now.getDate();
  const ordinalSuffix = (day: number) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return day + "st";
    if (j === 2 && k !== 12) return day + "nd";
    if (j === 3 && k !== 13) return day + "rd";
    return day + "th";
  };
  
  const ordinalDate = formattedDate.replace(day.toString(), ordinalSuffix(day));
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const greenColor = '#15803d'; // green-700 equivalent
  
  // Add logo (placeholder for now - will be replaced with actual logo)
  doc.setFillColor(0, 0, 0);
  doc.rect(20, 20, 15, 15, 'F');
  
   // Add company name - aligned with logo horizontally
   doc.setFontSize(24);
   doc.setFont('helvetica', 'bold');
   doc.text('TEST SACCO', 40, 27); // Same Y position as logo center
   
   // Add report title and date/time on next row
   doc.setFontSize(16);
   doc.setFont('helvetica', 'bold');
   doc.text('Collection Report', 20, 37); // Start from beginning, no padding
   
   // Add date and time - right aligned on same row as Collection Report with same small font
   doc.setFontSize(10);
   doc.setFont('helvetica', 'normal');
   doc.text(`${ordinalDate} ${formattedTime}`, pageWidth - 20, 37, { align: 'right' });
  
  // Table setup - adjusted to match PDF spacing
  const tableTop = 45; // Closer spacing like in PDF
  const tableLeft = 20;
  const tableWidth = pageWidth - 40; // Full width minus margins
  
  // Adjusted column widths to match PDF proportions
  const colWidths = [10, 30, 35, 25, 35, 40];
  const rowHeight = 8; // Slightly taller rows like in PDF
  
  // Table header
  doc.setFillColor(greenColor);
  doc.rect(tableLeft, tableTop, tableWidth, rowHeight, 'F');
  
  // Header text - white and centered
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['#', 'VEHICLE', 'RECEIPT', 'AMOUNT', 'COLLECTION', 'DATE TIME'];
  let currentX = tableLeft;
  
   headers.forEach((header, index) => {
     const align = index === 0 ? 'center' : 'left'; // Match row data alignment
     doc.text(header, currentX + (index === 0 ? colWidths[index] / 2 : 2), tableTop + 5, { align });
     currentX += colWidths[index];
   });
  
  // Table body
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal'); // Using helvetica instead of courier
  doc.setFontSize(8); // Slightly larger font
  
  let currentY = tableTop + rowHeight;
  
  reports.forEach((report, index) => {
    // No alternate row colors in the PDF
    const rowData = [
      (index + 1).toString(),
      report.vehicle,
      report.receipt,
      report.amount,
      report.collection,
      report.date && report.time ? `${report.date} ${report.time}` : '13-08-2025 09:00'
    ];
    
    currentX = tableLeft;
    rowData.forEach((data, colIndex) => {
      const align = colIndex === 0 ? 'center' : 'left'; // Only numbers centered
      doc.text(data, currentX + (colIndex === 0 ? colWidths[colIndex] / 2 : 2), currentY + 5, { align });
      currentX += colWidths[colIndex];
    });
    
    currentY += rowHeight;
  });
  
  // Total section - positioned properly
  const totalY = currentY + 12; // More spacing above total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  
  const totalAmount = reports.reduce((sum, report) => {
    const amount = parseInt(report.amount.replace(/[^\d]/g, ''));
    return sum + amount;
  }, 0);
  
  // Format total with comma like in PDF
  const formattedTotal = `KES ${totalAmount.toLocaleString()}`;
  
   // Calculate position for total amount to align with AMOUNT column
   const amountColumnStart = tableLeft + colWidths[0] + colWidths[1] + colWidths[2]; // Start of AMOUNT column
   
   doc.text('TOTAL', tableLeft, totalY);
   doc.text(formattedTotal, amountColumnStart + 2, totalY); // Position below AMOUNT column
  
  // Footer - positioned at bottom
  const footerY = pageHeight - 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Page 1', tableLeft, footerY);
  doc.text('Powered by www.iguru.co.ke', pageWidth - 20, footerY, { align: 'right' });
  
  // Generate PDF blob and open in new tab
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  
  // Clean up the URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

export const generateCollectionReportPDFWithLogo = async (reports: ReportData[]) => {
  const doc = new jsPDF();
  
  // Get current date and time
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);
  const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
  
  // Convert ordinal day (e.g., 1st, 2nd, 3rd, etc.)
  const day = now.getDate();
  const ordinalSuffix = (day: number) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return day + "st";
    if (j === 2 && k !== 12) return day + "nd";
    if (j === 3 && k !== 13) return day + "rd";
    return day + "th";
  };
  
  const ordinalDate = formattedDate.replace(day.toString(), ordinalSuffix(day));
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const greenColor = '#15803d'; // green-700 equivalent
  
  // Add logo
  try {
    // Try to load the actual logo image
    const logoResponse = await fetch('/icollection_logo.png');
    if (logoResponse.ok) {
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
      
      doc.addImage(logoBase64, 'PNG', 20, 18, 12, 12);
    } else {
      throw new Error('Logo not found');
    }
  } catch (error) {
    console.warn('Could not load logo, using placeholder:', error);
    // Fallback to simple rectangle with text
    doc.setFillColor(0, 0, 0);
    doc.rect(20, 18, 12, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('LOGO', 26, 24, { align: 'center' });
  }
  
   // Add company name - aligned with logo horizontally
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(24);
   doc.setFont('helvetica', 'bold');
   doc.text('TEST SACCO', 40, 27); // Same Y position as logo center
   
   // Add report title and date/time on next row
   doc.setFontSize(16);
   doc.setFont('helvetica', 'bold');
   doc.text('Collection Report', 20, 37); // Start from beginning, no padding
   
   // Add date and time - right aligned on same row as Collection Report with same small font
   doc.setFontSize(10);
   doc.setFont('helvetica', 'normal');
   doc.text(`${ordinalDate} ${formattedTime}`, pageWidth - 20, 37, { align: 'right' });
  
  // Table setup
  const tableTop = 45;
  const tableLeft = 20;
  const tableWidth = pageWidth - 40;
  const colWidths = [10, 30, 35, 25, 35, 40];
  const rowHeight = 8;
  
  // Table header
  doc.setFillColor(greenColor);
  doc.rect(tableLeft, tableTop, tableWidth, rowHeight, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['#', 'VEHICLE', 'RECEIPT', 'AMOUNT', 'COLLECTION', 'DATE TIME'];
  let currentX = tableLeft;
  
   headers.forEach((header, index) => {
     const align = index === 0 ? 'center' : 'left'; // Match row data alignment
     doc.text(header, currentX + (index === 0 ? colWidths[index] / 2 : 2), tableTop + 5, { align });
     currentX += colWidths[index];
   });
  
  // Table body
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  let currentY = tableTop + rowHeight;
  
  reports.forEach((report, index) => {
    const rowData = [
      (index + 1).toString(),
      report.vehicle,
      report.receipt,
      report.amount,
      report.collection,
      report.date && report.time ? `${report.date} ${report.time}` : '13-08-2025 09:00'
    ];
    
    currentX = tableLeft;
    rowData.forEach((data, colIndex) => {
      const align = colIndex === 0 ? 'center' : 'left';
      doc.text(data, currentX + (colIndex === 0 ? colWidths[colIndex] / 2 : 2), currentY + 5, { align });
      currentX += colWidths[colIndex];
    });
    
    currentY += rowHeight;
  });
  
  // Total section
  const totalY = currentY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  
  const totalAmount = reports.reduce((sum, report) => {
    const amount = parseInt(report.amount.replace(/[^\d]/g, ''));
    return sum + amount;
  }, 0);
  
  const formattedTotal = `KES ${totalAmount.toLocaleString()}`;
  
   // Calculate position for total amount to align with AMOUNT column
   const amountColumnStart = tableLeft + colWidths[0] + colWidths[1] + colWidths[2]; // Start of AMOUNT column
   
   doc.text('TOTAL', tableLeft, totalY);
   doc.text(formattedTotal, amountColumnStart + 2, totalY); // Position below AMOUNT column
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Page 1', tableLeft, footerY);
  doc.text('Powered by www.iguru.co.ke', pageWidth - 20, footerY, { align: 'right' });
  
  // Generate PDF blob and open in new tab
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  
  // Clean up the URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};