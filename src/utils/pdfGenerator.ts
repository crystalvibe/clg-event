import jsPDF from "jspdf";
import { Event as CustomEvent } from "@/types/event";
import 'jspdf-autotable';

// Add type augmentation for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

// Helper function to load images with better error handling
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';  // Enable CORS
    
    img.onload = () => resolve(img);
    
    img.onerror = () => {
      console.warn(`Failed to load image: ${url}`);
      reject(new Error(`Failed to load image: ${url}`));
    };

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      img.src = '';
      reject(new Error('Image load timeout'));
    }, 10000);

    if (url.startsWith('data:')) {
      img.src = url;
    } else {
      // For regular URLs, try to proxy or use cache-busting
      img.src = `${url}?t=${new Date().getTime()}`;
    }

    // Clear timeout on successful load
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
  });
};

// Helper function to convert PDF to base64 URL
const getPdfUrl = async (pdfData: ArrayBuffer): Promise<string> => {
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

// Add this helper function at the top
const fetchBlobFromUrl = async (url: string): Promise<Blob> => {
  if (url.startsWith('blob:')) {
    try {
      const response = await fetch(url);
      return await response.blob();
    } catch (error) {
      console.error('Error fetching blob:', error);
      throw error;
    }
  }
  throw new Error('Invalid blob URL');
};

// Add this helper function for 0x0.st links
const get0x0stUrl = (url: string): string => {
  if (url.includes('0x0.st')) {
    return `https://0x0.st/${url.split('0x0.st/').pop()}`;
  }
  return url;
};

const COLLEGE_NAME = "SHRI DHARMASTHALA MANJUNATHESHWARA\nCOLLEGE OF ENGINEERING & TECHNOLOGY";
const COLLEGE_LOGO_PATH = "/image-removebg-preview.png";

export const generateEventPDF = async (event: CustomEvent) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;  // Initialize yPos
    const lineHeight = 12;  // Add lineHeight constant
    
    // Define docId here
    const docId = `D${event.id}-${new Date().getFullYear()}`; // Define docId
    
    // Logo dimensions and position - adjusted with proper spacing
    const logoWidth = 25;
    const logoHeight = 30;
    const logoX = margin + 8;  // Increased spacing from left border
    const logoY = margin + 5;  // Added top spacing from border
    
    // Add red border
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(margin, margin, pageWidth - (margin * 2), doc.internal.pageSize.height - (margin * 2));
    
    try {
      const logo = await loadImage(COLLEGE_LOGO_PATH);
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Text positioning - adjusted for new logo position
      const textX = logoX + logoWidth + 8;  // Increased spacing after logo
      const textWidth = pageWidth - textX - margin;
      
      // College name - adjusted Y positions for new logo position
      doc.setTextColor(139, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      
      doc.text("SHRI DHARMASTHALA MANJUNATHESHWARA", textX, logoY + 8);
      doc.text("COLLEGE OF ENGINEERING & TECHNOLOGY", textX, logoY + 14);
      
      // Rest of the text positions adjusted relative to new logoY
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      
      const line1 = "(An autonomous college under Visvesvaraya Technological University, Belagavi and Approved by All India Council";
      const line2 = "for Technical Education, New Delhi)(ACCREDITED BY NBA and NAAC with A grade)";
      doc.text(line1, textX, logoY + 20);
      doc.text(line2, textX, logoY + 24);
      
      doc.text("CET CODE: E034 | COMED-K CODE: E17", textX, logoY + 30);
      
      // Update yPos after header
      yPos = logoY + logoHeight + 20;
      
    } catch (logoError) {
      console.error('Error adding logo:', logoError);
      yPos = margin + 60; // Fallback position if logo fails
    }


    // Event details in paragraph form
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    
    // Calculate positions
    yPos = logoY + logoHeight + 25; // Add some space after header
    const textMargin = margin + 10;
    const contentWidth = pageWidth - (textMargin * 2);

    // Format dates
    const startDate = event.startDate ? new Date(event.startDate).toLocaleDateString() : '';
    const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString() : '';
    const datePhrase = endDate 
      ? `${startDate} to ${endDate}`
      : startDate;

    // Format dates - Fix the date format
    const formatTimeSlot = (timeSlot: string) => {
      if (!timeSlot) return 'N/A';
      // If AM/PM is already present, return as is
      if (timeSlot.includes('AM') || timeSlot.includes('PM')) return timeSlot;
      // Convert 24hr format to 12hr format with AM/PM
      const [hours, minutes] = timeSlot.split(':');
      const hr = parseInt(hours);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const hour12 = hr % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`; // Format as "HH:MM AM/PM"
    };

    // Format the date properly
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-GB'); // This will format as DD/MM/YYYY
    };

    // Main Content
    doc.setFontSize(11);
    doc.setFont("times", "normal");

    // Define column widths with reduced sizes
    const headerHeight = logoY + logoHeight + 35;
    const combinedColumnWidths = [45, 75, 40]; // Reduced column widths
    const combinedTableWidth = combinedColumnWidths.reduce((a, b) => a + b, 0);
    
    // Center table horizontally
    const combinedTableX = (pageWidth - combinedTableWidth) / 2;
    
    // Move table up
    const centerY = headerHeight - 10;

    // Add heading above the table
    doc.setFontSize(14); // Reduced heading font size
    doc.setFont("helvetica", "bold");
    doc.text("EVENT DETAILS", pageWidth / 2, centerY - 10, { align: "center" });

    // Separate media data from other details
    const mediaLinks = event.media?.length ? 
      event.media.map((media, index) => 
        `${index + 1}. ${media.name || `Media ${index + 1}`}`
      ).join('\n') 
      : 'No media attached';

    // Create table data with three columns
    const combinedTableData = [
      ["Document ID", docId, ""],
      ["Report Title", "Event Report", ""],
      ["Event Title", event.title || 'Untitled Event', ""],
      ["Category", event.category || 'N/A', "Media Links:"],
      ["Event Type", event.eventType || 'N/A', mediaLinks],
      ["Department", event.department || 'N/A', ""],
      ["Start Date", event.date ? formatDate(event.date) : formatDate(event.startDate || ''), ""],
      ["End Date", event.endDate ? formatDate(event.endDate) : 'N/A', ""],
      ["Time Slot", formatTimeSlot(event.timeSlot || ''), ""],
      ["Coordinators", event.coordinator || 'N/A', ""],
      ["Team Members", event.teamMembers || 'N/A', ""],
      ["Resource Persons", event.resourcePersons || 'N/A', ""],
      ["Participants Count", event.participantsCount || 'N/A', ""],
      ["External Participants", event.externalParticipants || 'N/A', ""],
      ["Sponsored By", event.sponsoredBy || 'N/A', ""],
      ["Total Expenses", event.totalExpenses ? `₹${event.totalExpenses}` : 'N/A', ""],
      ["Description", event.description || 'No description provided.', ""]
    ];

    // Calculate available space and table height after data is created
    const availableHeight = doc.internal.pageSize.height - headerHeight - (2 * margin);
    const tableHeight = (combinedTableData.length + 1) * 8;

    (doc as any).autoTable({
      head: [["Field", "Details", "Media"]],
      body: combinedTableData,
      startY: centerY,
      theme: 'striped',
      styles: { 
        fontSize: 8, // Reduced font size
        cellPadding: 2, // Reduced cell padding
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: 'left',
        minCellHeight: 6 // Added minimum cell height
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: combinedColumnWidths[0] },
        1: { cellWidth: combinedColumnWidths[1], cellPadding: 2 },
        2: { cellWidth: combinedColumnWidths[2], cellPadding: 2 }
      },
      margin: { left: combinedTableX, right: combinedTableX },
      didParseCell: (data: { cell: any }) => {
        data.cell.styles.lineColor = [0, 0, 0];
        data.cell.styles.lineWidth = 0.5;
      }
    });
    yPos += (combinedTableData.length + 1) * lineHeight; // Update yPos after the combined table

    // Handle media from database
    if (event.media?.length) {
      yPos += lineHeight;
      doc.setFontSize(13);
      doc.setFont("times", "bold");
      doc.text("Associated Media:", 20, yPos);
      yPos += lineHeight;

      doc.setFont("times", "normal");
      doc.setFontSize(11);

      event.media.forEach((media, index) => {
        yPos += lineHeight;
        doc.setTextColor(0, 0, 255); // Blue color for links
        
        if (media.url) {
          doc.textWithLink(`${media.name || `Media ${index + 1}`}`, 30, yPos, { 
            url: media.url 
          });
        } else if (media.data) {
          // For base64 data, create a blob URL
          const blob = dataURLtoBlob(media.data);
          const blobUrl = URL.createObjectURL(blob);
          doc.textWithLink(`${media.name || `Media ${index + 1}`}`, 30, yPos, { 
            url: blobUrl 
          });
        }
      });
    }

    // Save the PDF
    const filename = `${docId}-${event.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF report: ' + (error as Error).message);
  }
};

// Add the dataURLtoBlob helper from indexedDB.ts
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Update the generateAllEventsPDF function similarly
export const generateAllEventsPDF = async (events: CustomEvent[]) => {
  try {
    const doc = new jsPDF();
    let firstPage = true;

    for (const event of events) {
      try {
        if (!firstPage) {
          doc.addPage();
        }
        firstPage = false;

        // Generate single event report within the combined PDF
        let yPos = 20;
        const lineHeight = 10;
        const margin = 20;

        // Add header
        doc.setFontSize(16);
        doc.text("SDM College of Engineering & Technology", doc.internal.pageSize.width / 2, yPos, { align: "center" });
        yPos += lineHeight;
        
        doc.setFontSize(14);
        doc.text(`Event Report - ${event.title}`, doc.internal.pageSize.width / 2, yPos, { align: "center" });
        yPos += lineHeight * 2;

        // Add event details table
        const tableData = [
          ["Document ID", event.documentId || 'Not provided'],
          ["Event Name", event.title || 'Not provided'],
          ["Category", event.category || 'Not provided'],
          ["Event Type", event.eventType || 'Not provided'],
          ["Start Date", event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Not provided'],
          ["End Date", event.endDate ? new Date(event.endDate).toLocaleDateString() : 'Not provided'],
          ["Department", event.department || 'Not provided'],
          ["Venue", event.venue || 'Not provided'],
          ["Coordinator", event.coordinator || 'Not provided'],
          ["Team Members", event.teamMembers || 'Not provided'],
          ["Resource Persons", event.resourcePersons || 'Not provided'],
          ["Participants Count", event.participantsCount?.toString() || 'Not provided'],
          ["External Participants", event.externalParticipants?.toString() || 'Not provided'],
          ["Sponsored By", event.sponsoredBy || 'Not provided'],
          ["Total Expenses", event.totalExpenses ? `₹${event.totalExpenses}` : 'Not provided'],
          ["Description", event.description || 'Not provided']
        ];

        (doc as any).autoTable({
          startY: yPos,
          head: [],
          body: tableData,
          theme: 'striped',
          styles: { fontSize: 10, cellPadding: 5 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 120 }
          },
        });

      } catch (eventError) {
        console.warn(`Error processing event ${event.title}:`, eventError);
        continue;
      }
    }

    doc.save('all-events-report.pdf');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};