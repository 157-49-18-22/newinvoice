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
  const {
    invoiceNumber = '',
    number = '',
    date = new Date(),
    products = [],
    supplierData = {},
    buyerData = {},
    selectedBuyer = {},
    transportData = {},
    otherDetails = {}
  } = data || {};

  // Use selectedBuyer if buyerData is not available
  const buyerInfo = buyerData && Object.keys(buyerData).length > 0 ? buyerData : selectedBuyer;

  // Debug logs
  console.log('InvoiceTemplate rendered with data:', data);
  console.log('InvoiceTemplate bank data:', bankData);
  
  // Add effect to log when component is fully mounted
  useEffect(() => {
    console.log('InvoiceTemplate mounted and ready');
    console.log('Products in template:', data?.products?.length || 0);
    console.log('Supplier data:', data?.supplierData);
    console.log('Buyer data:', data?.buyerData);
    console.log('Selected buyer:', data?.selectedBuyer);
    console.log('Buyer info (final):', buyerInfo);
    
    // Validate that crucial data exists
    if (!data?.products || data.products.length === 0) {
      console.warn('WARNING: No products in invoice data');
    }
    if (!data?.supplierData?.companyName) {
      console.warn('WARNING: No supplier company name');
    }
    if (!buyerInfo?.companyName) {
      console.warn('WARNING: No buyer company name');
    }
  }, [data, bankData, buyerInfo]);

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
      width: '210mm',
      padding: '8mm',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt'
    },
    table: {
      width: '100%',
      tableLayout: 'fixed',
      fontSize: '8pt'
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
      {/* Top Thank You OUTSIDE */}
      <div className="thank-you-top">Thank-you for doing business with us</div>

      <div className="page">
        {/* Company Section */}
        <div className="company-section">
        <div className="company-logo">
          {supplierData?.logo && <img src={supplierData.logo} alt="Company Logo" />}
        </div>
        <div className="company-info">
            <div className="company-name">{supplierData?.name || supplierData?.companyName}</div>
            <div className="company-address">{supplierData?.address} {supplierData?.city} {supplierData?.state} {supplierData?.pincode}</div>
            <div className="company-contact">{supplierData?.phone} | {supplierData?.email}</div>
            <div className="gstin-line"><b>GSTIN:</b> <b>{supplierData?.gstin}</b> | <b>State Code:</b> <b>{supplierData?.stateCode || '06'}</b></div>
          </div>
        </div>

        {/* Title */}
        <div className="invoice-title1">TAX INVOICE</div>
        <div className="subtitle">Original For Recipient</div>

        {/* Invoice Info */}
        <div className="invoice-info-section">
          <div className="invoice-info-left">
            <div className="info-row"><span className="info-label">Invoice Number:</span><span className="info-value">{invoiceNumber || number}</span></div>
            <div className="info-row"><span className="info-label">Invoice Date:</span><span className="info-value">{formatDate(date)}</span></div>
          </div>
          <div className="invoice-info-right">
            <div className="info-row"><span className="info-label">State:</span><span className="info-value">{supplierData?.state}</span></div>
            <div className="info-row"><span className="info-label">Reverse Charge:</span><span className="info-value">{otherDetails?.reverseCharge ? 'YES' : 'NO'}</span></div>
          </div>
        </div>
        <div className="clear"></div>

        {/* Addresses */}
        <div className="address-container">
          <div className="address-block">
            <div className="address-header">Details of Receiver | Billed to</div>
            <div className="address-detail"><b>Name:</b> {buyerInfo?.companyName}<br/><b>Address:</b> {buyerInfo?.address} {buyerInfo?.city} {buyerInfo?.state} {buyerInfo?.pincode}<br/><b>GSTIN:</b> <b>{buyerInfo?.gstin}</b> | <b>State:</b> <b>{buyerInfo?.state}</b></div>
          </div>
          <div className="address-block">
            <div className="address-header">Details of Consignee | Shipped to</div>
            <div className="address-detail"><b>Name:</b> {buyerInfo?.companyName}<br/><b>Address:</b> {buyerInfo?.address} {buyerInfo?.city} {buyerInfo?.state} {buyerInfo?.pincode}<br/><b>GSTIN:</b> <b>{buyerInfo?.gstin}</b> | <b>State:</b> <b>{buyerInfo?.state}</b></div>
        </div>
      </div>

        {/* Products */}
        <table className="product-table">
        <thead>
            <tr>
              <th>Sr. No.</th><th>Name of Product</th><th>HSN/SAC</th><th>QTY</th><th>Unit</th><th>Rate</th><th>Taxable Value</th><th>IGST Rate</th><th>IGST Amt</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const quantity = safeCalculate(product?.quantity);
            const rate = safeCalculate(product?.salePrice);
            const amount = quantity * rate;
            const gstRate = safeCalculate(product?.gst);
            const gstAmount = (amount * gstRate) / 100;
            
            return (
                <tr key={index}>
                  <td>{index + 1}</td><td>{product?.name}</td><td>{product?.hsn}</td><td>{quantity}</td><td>{product?.unit || '-'}</td><td>{rate.toFixed(2)}</td><td>{amount.toFixed(2)}</td><td>{gstRate.toFixed(0)}%</td><td><b>{gstAmount.toFixed(2)}</b></td><td><b>₹{(amount + gstAmount).toFixed(2)}</b></td>
              </tr>
            );
          })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3"><b>Total</b></td><td>{totalQuantity}</td><td>-</td><td>-</td><td>{subTotal.toFixed(2)}</td><td>-</td><td><b>{totalGST.toFixed(2)}</b></td><td><b>{grandTotal.toFixed(2)}</b></td>
          </tr>
          </tfoot>
      </table>

        {/* Amount Words */}
        <div className="amount-words-box">
          <div className="amount-words-label">Total Invoice Amount in words</div>
          <div className="amount-words-value">{numberToWords(grandTotal)} /-</div>
        </div>

        {/* Two Column */}
        <div className="two-column-layout">
          <div className="left-column">
            <div className="bank-details-box">
              <div className="bank-details-header">Bank and Payment Details</div>
              {bankData && (
                <>
                  <div className="bank-detail-row"><b>Account Name:</b> {supplierData?.name || supplierData?.companyName}</div>
                  <div className="bank-detail-row"><b>Account No.:</b> {bankData.accountNumber}</div>
                  <div className="bank-detail-row"><b>IFSC Code:</b> {bankData.ifscCode}</div>
                  <div className="bank-detail-row"><b>Bank:</b> {bankData.bankName}</div>
                  <div className="bank-detail-row"><b>Branch:</b> {bankData.branchName || 'N/A'}</div>
                </>
              )}
          </div>
          </div>
          <div className="right-column">
            <div className="summary-details-right">
             
              <table className="summary-table">
                <tbody>
                  <tr>
                    <td className="summary-label">Total Before Tax</td>
                    <td className="summary-value">₹{subTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="summary-label">Add: IGST</td>
                    <td className="summary-value"><b>₹{totalGST.toFixed(2)}</b></td>
                  </tr>
                  <tr className="highlight-row">
                    <td className="summary-label">Total Tax</td>
                    <td className="summary-value"><b>₹{totalGST.toFixed(2)}</b></td>
                  </tr>
                  <tr className="total-row final-amount-row">
                    <td className="summary-label final-amount-label">Final Amount</td>
                    <td className="summary-value final-amount-value">₹{grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr className="highlight-row">
                    <td className="summary-label">Balance Due</td>
                    <td className="summary-value">₹{grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>

        {/* Terms */}
        <div className="terms-section">
          <div className="terms-header">Terms And Conditions</div>
          <div className="terms-text">
            1. This is an electronically generated document.<br/>
            2. All disputes are subject to Faridabad jurisdiction.
          </div>
          <div className="certification-text">Certified that the particulars given above are true and correct</div>
          <div className="signature-section">
            <div className="for-company">For, {supplierData?.name || supplierData?.companyName}</div>
            <div className="signature-line">Authorised Signatory</div>
          </div>
        </div>
      </div>
      
      {/* Bottom Thank You OUTSIDE */}
      <div className="thank-you-bottom">Thank you for your business</div>
    </div>
  );
});

export default InvoiceTemplate; 






