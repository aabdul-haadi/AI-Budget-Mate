import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(elementId: string, filename: string = 'budget-report.pdf', options: { 
  title?: string; 
  subtitle?: string; 
  addHeader?: boolean;
  addFooter?: boolean;
} = {}) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  try {
    // Add temporary styling for better PDF output
    const originalStyle = element.style.cssText;
    element.style.backgroundColor = '#ffffff';
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    // Restore original styling
    element.style.cssText = originalStyle;
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    let currentY = 20;
    
    // Add header if requested
    if (options.addHeader) {
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text(options.title || 'Budget Tracker Report', pdfWidth / 2, currentY, { align: 'center' });
      
      if (options.subtitle) {
        currentY += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(107, 114, 128); // Gray color
        pdf.text(options.subtitle, pdfWidth / 2, currentY, { align: 'center' });
      }
      
      currentY += 15;
      
      // Add a line separator
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, currentY, pdfWidth - 20, currentY);
      currentY += 10;
    }
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const availableHeight = pdfHeight - currentY - (options.addFooter ? 20 : 10);
    const imgY = currentY;
    
    // Scale image to fit available space
    const finalRatio = Math.min(ratio, availableHeight / (imgHeight * ratio));
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * finalRatio, imgHeight * finalRatio);
    
    // Add footer if requested
    if (options.addFooter) {
      const footerY = pdfHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-PK')}`, 20, footerY);
      
      // Add branding
      pdf.setFontSize(7);
      pdf.text('Powered by BudgetMate', pdfWidth - 20, footerY - 5, { align: 'right' });
      pdf.text('Developed by Abdul Haadi', pdfWidth - 20, footerY, { align: 'right' });
    }
    
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}