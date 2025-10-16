import React, { forwardRef, useEffect } from 'react';
import './InvoiceTemplate.css';
import { numberToWords } from '../utils/numberToWords';
import { FiUser } from 'react-icons/fi';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
};

const InvoiceTemplate = forwardRef(({ data = {}, bankData = null, forPDF = false }, ref) => {
  // Debug logs
  console.log('InvoiceTemplate rendered with data:', data);
  console.log('InvoiceTemplate bank data:', bankData);
  
  // Add effect to log when component is fully mounted
  useEffect(() => {
    console.log('InvoiceTemplate mounted and ready');
    console.log('Products in template:', data?.products?.length || 0);
    console.log('Supplier data:', data?.supplierData);
    console.log('Buyer data:', data?.buyerData);
    
    // Validate that crucial data exists
    if (!data?.products || data.products.length === 0) {
      console.warn('WARNING: No products in invoice data');
    }
    if (!data?.supplierData?.companyName) {
      console.warn('WARNING: No supplier company name');
    }
    if (!data?.buyerData?.companyName) {
      console.warn('WARNING: No buyer company name');
    }
  }, [data, bankData]);

  const {
    invoiceNumber = '',
    number = '',
    date = new Date(),
    products = [],
    supplierData = {},
    buyerData = {},
    transportData = {},
    otherDetails = {}
  } = data || {};

  // Check if it's an inter-state transaction
  const isInterState = supplierData?.state !== buyerData?.state;

  // Safe calculation helper
  const safeCalculate = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Calculate totals with safe values
  const totalQuantity = products.reduce((sum, product) => sum + safeCalculate(product?.quantity), 0);
  const subTotal = products.reduce((sum, product) => sum + (safeCalculate(product?.quantity) * safeCalculate(product?.salePrice)), 0);
  const totalGST = products.reduce((sum, product) => {
    const amount = safeCalculate(product?.quantity) * safeCalculate(product?.salePrice);
    const gstRate = safeCalculate(product?.gst);
    return sum + (amount * (gstRate / 100));
  }, 0);
  const grandTotal = subTotal + totalGST;

  // Additional styles for PDF rendering
  const pdfStyles = forPDF ? {
    wrapper: {
      width: '180mm',
      padding: '5mm',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt'
    },
    table: {
      width: '100%',
      tableLayout: 'fixed',
      fontSize: '7pt'
    },
    tableCell: {
      padding: '2px',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'visible'
    },
    pageBreakAvoid: {
      pageBreakInside: 'avoid'
    }
  } : {};

  return (
    <div className="invoice-template" ref={ref} style={pdfStyles.wrapper}>
      {/* Company Header */}
      <div className="company-header">
        <div className="company-logo">
          {supplierData?.logo && <img src={supplierData.logo} alt="Company Logo" />}
        </div>
        <div className="company-info">
          <h1>{supplierData?.name}</h1>
          <p>{supplierData?.address}</p>
          {/* <p>{supplierData?.city}, {supplierData?.state}, {supplierData?.pincode}</p> */}
          <p>{supplierData?.phone}</p>
          <p>{supplierData?.email}</p>
          <p>GSTIN: {supplierData?.gstin}</p>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="invoice-title">
        <h2>TAX INVOICE</h2>
        <div className="invoice-type-checkboxes">
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Original for Recipient</label>
          </div>
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Duplicate for Transporter</label>
          </div>
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Triplicate for Supplier</label>
          </div>
        </div>
      </div>

      {/* Invoice Details Box */}
      <div className="invoice-details-box">
        <div className="detail-left">
          <div className="detail-item">
            <span className="detail-label">Reverse Charge:</span>
            <span className="detail-value">{otherDetails?.reverseCharge ? 'Yes' : 'No'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Invoice No.:</span>
            <span className="detail-value">{invoiceNumber || number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Invoice Date:</span>
            <span className="detail-value">{formatDate(date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">State:</span>
            <span className="detail-value">{supplierData?.state}</span>
            <span className="state-code">: {supplierData?.stateCode || '06'}</span>
          </div>
        </div>
        <div className="detail-right">
          <div className="detail-item">
            <span className="detail-label">Transportation Mode:</span>
            <span className="detail-value">{transportData?.transportMode || ''}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Vehicle No.:</span>
            <span className="detail-value">{transportData?.vehicleNumber || ''}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date of Supply:</span>
            <span className="detail-value">{formatDate(date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Place of Supply:</span>
            <span className="detail-value">{buyerData?.state || ''}</span>
          </div>
        </div>
      </div>

      {/* Party Details */}
      <div className="party-details">
        <div className="billed-to">
          <h3>Details of Receiver ( Billed to: )</h3>
          <div className="party-info">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value buyer-name-container">
                <FiUser className="buyer-icon" />
                <span>{buyerData?.companyName}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{buyerData?.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-value">{buyerData?.city}, {buyerData?.state}, {buyerData?.pincode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GSTIN:</span>
              <span className="detail-value">{buyerData?.gstin}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{buyerData?.state}</span>
              <span className="state-code">: {buyerData?.stateCode || '06'}</span>
            </div>
          </div>
        </div>
        <div className="shipped-to">
          <h3>Details of Consignee ( Shipped to: )</h3>
          <div className="party-info">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value buyer-name-container">
                <FiUser className="buyer-icon" />
                <span>{buyerData?.companyName}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{buyerData?.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-value">{buyerData?.city}, {buyerData?.state}, {buyerData?.pincode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GSTIN:</span>
              <span className="detail-value">{buyerData?.gstin}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{buyerData?.state}</span>
              <span className="state-code">: {buyerData?.stateCode || '06'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <table className="product-table" style={pdfStyles.pageBreakAvoid}>
        <thead>
          <tr className="header-row">
            <th style={forPDF ? pdfStyles.tableCell : {}}>Sr. No.</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Name of Product</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>HSN/SAC</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>QTY</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Unit</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Rate</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Taxable Value</th>
            {isInterState ? (
              <th style={forPDF ? pdfStyles.tableCell : {}} colSpan="2">IGST</th>
            ) : (
              <>
                <th style={forPDF ? pdfStyles.tableCell : {}} colSpan="2">CGST</th>
                <th style={forPDF ? pdfStyles.tableCell : {}} colSpan="2">SGST</th>
              </>
            )}
            <th style={forPDF ? pdfStyles.tableCell : {}}>Total</th>
          </tr>
          <tr className="sub-header-row">
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
            {isInterState ? (
              <>
                <th style={forPDF ? pdfStyles.tableCell : {}}>Rate</th>
                <th style={forPDF ? pdfStyles.tableCell : {}}>Amount</th>
              </>
            ) : (
              <>
                <th style={forPDF ? pdfStyles.tableCell : {}}>Rate</th>
                <th style={forPDF ? pdfStyles.tableCell : {}}>Amount</th>
                <th style={forPDF ? pdfStyles.tableCell : {}}>Rate</th>
                <th style={forPDF ? pdfStyles.tableCell : {}}>Amount</th>
              </>
            )}
            <th style={forPDF ? pdfStyles.tableCell : {}}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const quantity = safeCalculate(product?.quantity);
            const rate = safeCalculate(product?.salePrice);
            const amount = quantity * rate;
            const gstRate = safeCalculate(product?.gst);
            const gstAmount = (amount * gstRate) / 100;
            const cgstAmount = gstAmount / 2;
            const sgstAmount = gstAmount / 2;
            
            return (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : ''}>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{index + 1}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{product?.name}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{product?.hsn}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{quantity}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{product?.unit}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{rate.toFixed(2)}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{amount.toFixed(2)}</td>
                {isInterState ? (
                  <>
                    <td style={forPDF ? pdfStyles.tableCell : {}}>{gstRate.toFixed(1)}%</td>
                    <td style={forPDF ? pdfStyles.tableCell : {}}>{gstAmount.toFixed(2)}</td>
                  </>
                ) : (
                  <>
                    <td style={forPDF ? pdfStyles.tableCell : {}}>{(gstRate / 2).toFixed(1)}%</td>
                    <td style={forPDF ? pdfStyles.tableCell : {}}>{cgstAmount.toFixed(2)}</td>
                    <td style={forPDF ? pdfStyles.tableCell : {}}>{(gstRate / 2).toFixed(1)}%</td>
                    <td style={forPDF ? pdfStyles.tableCell : {}}>{sgstAmount.toFixed(2)}</td>
                  </>
                )}
                <td style={forPDF ? pdfStyles.tableCell : {}}>{(amount + gstAmount).toFixed(2)}</td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td style={forPDF ? pdfStyles.tableCell : {}} colSpan="3">Total Quantity</td>
            <td style={forPDF ? pdfStyles.tableCell : {}}>{totalQuantity}</td>
            <td style={forPDF ? pdfStyles.tableCell : {}} colSpan={isInterState ? "6" : "8"}></td>
          </tr>
        </tbody>
      </table>

      {/* Amount Section */}
      <div className="amount-section" style={pdfStyles.pageBreakAvoid}>
        <div className="amount-in-words">
          <p>Total Invoice Amount in Words:</p>
          <p>{numberToWords(grandTotal)}</p>
        </div>
        <div className="amount-breakdown">
          <div className="amount-item">
            <span>Total Amount Before Tax:</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="amount-item">
            <span>Tax Amount:</span>
            <span>₹{totalGST.toFixed(2)}</span>
          </div>
          <div className="amount-item total">
            <span>Total Amount With Tax:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Signature */}
      <div className="footer-section" style={pdfStyles.pageBreakAvoid}>
        <div className="terms">
          <h4>Terms and Conditions</h4>
          <ol>
            <li>This is an electronically generated document.</li>
            <li>All disputes are subject to {supplierData?.city} jurisdiction.</li>
          </ol>
          {bankData && (
            <div className="bank-details">
              <br />
              <h4>Bank Details:</h4>
             
              <p>Bank Name:{bankData.bankName}</p>
              <p>Account Number:{bankData.accountNumber}</p>
              <p>IFSC Code: {bankData.ifscCode}</p>
            </div>
          )}
        </div>
        <div className="signature-section">
        
          <div className="signature-line">
            <p>For, {supplierData?.companyName}</p>
            <p className="signatory">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoiceTemplate; 