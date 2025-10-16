import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom';
import InvoiceTemplate from '../components/InvoiceTemplate';

/**
 * Generate a PDF invoice from the invoice data using the original InvoiceTemplate design
 * @param {Object} invoice - The invoice data object
 */
export const generatePDF = async (invoice) => {
  try {
    console.log('Starting PDF generation with invoice:', invoice);
    
    // Create a temporary container for rendering the invoice template
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    // Using width that fits in portrait A4
    tempContainer.style.width = '210mm'; 
    tempContainer.style.margin = '0';
    tempContainer.style.padding = '0';
    tempContainer.style.background = 'white';
    document.body.appendChild(tempContainer);
    
    // Inject CSS styles from InvoiceTemplate.css directly
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* PDF-specific styles */
      .invoice-template {
        font-family: Arial, sans-serif;
        color: black;
        background-color: white;
        padding: 10mm;
        width: 210mm;
        box-sizing: border-box;
        margin: 0 auto;
      }
      .company-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
      }
      .company-info h1 {
        font-size: 16px;
        margin: 0 0 3px 0;
      }
      .company-info p {
        margin: 1px 0;
        font-size: 9px;
      }
      .invoice-title {
        text-align: center;
        margin-bottom: 15px;
      }
      .invoice-title h2 {
        font-size: 14px;
        margin: 0;
      }
      .invoice-type-checkboxes {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 8px;
      }
      .detail-item {
        margin-bottom: 3px;
        font-size: 9px;
      }
      .invoice-details-box, .party-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        border: 1px solid #ddd;
        padding: 8px;
      }
      .party-details {
        display: flex;
        gap: 15px;
      }
      .billed-to, .shipped-to {
        flex: 1;
        border: 1px solid #ddd;
        padding: 8px;
      }
      .product-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        table-layout: fixed;
      }
      .product-table th, .product-table td {
        border: 1px solid #ddd;
        padding: 3px;
        text-align: left;
        font-size: 8px;
      }
      .product-table th {
        background-color: #f5f5f5;
        font-size: 8px;
      }
      .amount-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
      }
      .amount-breakdown {
        border: 1px solid #ddd;
        padding: 8px;
        width: 40%;
      }
      .amount-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
        font-size: 9px;
      }
      .amount-item.total {
        font-weight: bold;
        border-top: 1px solid #ddd;
        padding-top: 3px;
      }
      .footer-section {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
      .signatory {
        margin-top: 30px;
      }
      .terms h4, .bank-details h4 {
        font-size: 10px;
        margin: 5px 0;
      }
      .terms ol {
        padding-left: 15px;
        margin: 5px 0;
      }
      .terms ol li, .bank-details p {
        font-size: 8px;
        margin: 2px 0;
      }
    `;
    tempContainer.appendChild(styleElement);
    
    console.log('Created temporary container for rendering');
    
    // Use a Promise to handle the rendering
    await new Promise(resolve => {
      // Render the invoice template to the container using ReactDOM
      ReactDOM.render(
        <InvoiceTemplate 
          data={invoice} 
          bankData={invoice.bankData}
          forPDF={true}
        />,
        tempContainer,
        () => {
          console.log('Rendered InvoiceTemplate to container');
          // Add a short delay to ensure all styles are applied
          setTimeout(resolve, 1000);
        }
      );
    });
    
    console.log('Template rendering complete');
    
    // Convert the rendered template to a canvas using html2canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: 'white',
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
      windowWidth: tempContainer.scrollWidth,
      windowHeight: tempContainer.scrollHeight
    });
    
    console.log('Canvas created successfully');
    
    // Create a new PDF in PORTRAIT orientation
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // A4 portrait dimensions
    const pdfWidth = 210; // A4 width in portrait (mm)
    const pdfHeight = 297; // A4 height in portrait (mm)
    
    // Calculate margins to center the content
    const margin = 10; // 10mm margin
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    // Calculate the scaling ratio to fit the canvas onto the PDF page with margins
    const scaleWidth = contentWidth / canvas.width;
    const scaleHeight = contentHeight / canvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    // Calculate the dimensions of the image on the PDF
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;
    
    // Calculate positioning to center the image
    const x = margin + (contentWidth - imgWidth) / 2;
    const y = margin + (contentHeight - imgHeight) / 2;
    
    console.log(`Canvas dimensions: ${canvas.width}px x ${canvas.height}px`);
    console.log(`PDF dimensions: ${pdfWidth}mm x ${pdfHeight}mm`);
    console.log(`Scaled image dimensions: ${imgWidth}mm x ${imgHeight}mm`);
    
    // Add the canvas image to the PDF
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      x,
      y,
      imgWidth,
      imgHeight
    );
    
    // Save the PDF
    pdf.save(`Invoice-${invoice.number || '1'}.pdf`);
    console.log('PDF generated successfully');
    
    // Clean up the temporary container
    document.body.removeChild(tempContainer);
    console.log('Removed temporary container');
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF generation failed: ' + error.message);
    return false;
  }
}; 