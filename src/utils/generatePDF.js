import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom';
import InvoiceTemplate from '../components/InvoiceTemplate';

/**
 * Generate a PDF invoice — always fits on ONE single portrait A4 page
 * @param {Object} invoice - The invoice data object
 */
export const generatePDF = async (invoice) => {
  try {
    console.log('Starting PDF generation with invoice:', invoice);

    // A4 Portrait: 210mm wide x 297mm tall
    // At 96 DPI: 210mm ≈ 794px
    const A4_WIDTH_PX = 794;

    // Create a temporary off-screen container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-10000px';
    tempContainer.style.top = '0';
    tempContainer.style.width = `${A4_WIDTH_PX}px`;
    tempContainer.style.margin = '0';
    tempContainer.style.padding = '0';
    tempContainer.style.background = 'white';
    tempContainer.style.overflow = 'visible';
    document.body.appendChild(tempContainer);

    // Override styles so there's no screen-page padding
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .invoice-wrapper {
        padding: 0 !important;
        background-color: white !important;
        display: block !important;
      }
      .invoice-container {
        box-shadow: none !important;
        border: 1px solid #000 !important;
        width: 100% !important;
        min-height: unset !important;
        margin: 0 !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .bg-invoice-blue {
        background-color: transparent !important;
        box-shadow: inset 0 0 0 1000px #cce4f7 !important;
      }
      .border-b, .border-t, .border-r, .border-y, .border {
        border-color: #000 !important;
        border-width: 1px !important;
        border-style: solid !important;
      }
    `;
    tempContainer.appendChild(styleElement);

    // Render the invoice template
    await new Promise(resolve => {
      ReactDOM.render(
        <InvoiceTemplate
          data={invoice}
          bankData={invoice.bankData}
          forPDF={true}
        />,
        tempContainer,
        () => {
          setTimeout(resolve, 1200);
        }
      );
    });

    console.log('Template rendering complete');

    // Capture at 3x resolution for sharpness
    const canvas = await html2canvas(tempContainer, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: 'white',
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
      windowWidth: A4_WIDTH_PX,
    });

    console.log(`Canvas: ${canvas.width}px x ${canvas.height}px`);

    // A4 Portrait dimensions in mm
    const PDF_WIDTH_MM  = 210;
    const PDF_HEIGHT_MM = 297;

    // Create PDF (portrait A4)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Scale canvas proportionally to fit BOTH width AND height of one A4 page
    // We determine how many canvas-pixels = 1mm, then check both directions
    const scaleByWidth  = PDF_WIDTH_MM  / canvas.width;   // mm per px based on width
    const scaleByHeight = PDF_HEIGHT_MM / canvas.height;  // mm per px based on height

    // Use the smaller scale so the image fits within both dimensions
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const imgWidthMm  = canvas.width  * scale;
    const imgHeightMm = canvas.height * scale;

    // Center horizontally if narrower than page, align to top
    const xMm = (PDF_WIDTH_MM - imgWidthMm) / 2;
    const yMm = 0;

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      xMm,
      yMm,
      imgWidthMm,
      imgHeightMm,
    );

    pdf.save(`Invoice-${invoice.invoiceNo || invoice.number || '1'}.pdf`);

    console.log('PDF generated successfully — single page portrait');

    // Cleanup
    document.body.removeChild(tempContainer);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF generation failed: ' + error.message);
    return false;
  }
};
