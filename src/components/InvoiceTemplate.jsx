import React, { forwardRef, useEffect } from 'react';
import './InvoiceTemplate.css';
import { numberToWords } from '../utils/numberToWords';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
};

const InvoiceTemplate = forwardRef(({ data = {}, bankData = null, forPDF = false }, ref) => {
  useEffect(() => {
    console.log('InvoiceTemplate mounted and ready');
  }, [data, bankData]);

  const buyerDataToUse = data?.buyerData || data?.selectedBuyer || {};

  const {
    invoiceNumber = '',
    number = '',
    date = new Date(),
    products = [],
    supplierData = {},
    otherDetails = {},
    gstType = 'auto',
    discountPercent = 0
  } = data || {};

  const isInterState = supplierData?.state !== buyerDataToUse?.state;

  let showIGST = false;
  let showSGST = false;

  if (gstType === 'auto') {
    showIGST = isInterState;
    showSGST = !isInterState;
  } else if (gstType === 'igst') {
    showIGST = true;
    showSGST = false;
  } else if (gstType === 'sgst') {
    showIGST = false;
    showSGST = true;
  } else if (gstType === 'both') {
    showIGST = true;
    showSGST = true;
  }

  const safeCalculate = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const totalQuantity = products.reduce((sum, product) => sum + safeCalculate(product?.quantity), 0);
  
  let subTotal = 0;
  let totalGST = 0;
  let totalIGSTAmount = 0;
  let totalCGSTAmount = 0;
  let totalSGSTAmount = 0;

  products.forEach(product => {
    const qty = safeCalculate(product?.quantity);
    const rawRate = safeCalculate(product?.salePrice);
    const gstRate = safeCalculate(product?.gst);
    const cessRate = safeCalculate(product?.cess || 0);

    let rate = rawRate;
    let amount = 0;
    let gstAmount = 0;

    if (product.taxType === 'inclusive') {
      const totalTaxRate = gstRate + cessRate;
      rate = rawRate / (1 + (totalTaxRate / 100));
      amount = qty * rate;
      gstAmount = amount * (gstRate / 100);
    } else {
      amount = qty * rate;
      gstAmount = amount * (gstRate / 100);
    }
    
    subTotal += amount;
    totalGST += gstAmount;
    
    if (showIGST) totalIGSTAmount += gstAmount;
    if (showSGST) {
        totalCGSTAmount += gstAmount / 2;
        totalSGSTAmount += gstAmount / 2;
    }
  });

  const totalWithTax = subTotal + totalGST;
  const discountAmount = totalWithTax * (safeCalculate(discountPercent) / 100);
  const grandTotal = totalWithTax - discountAmount;
  const roundOffValue = Math.round(grandTotal) - grandTotal;
  const finalInvoiceAmount = Math.round(grandTotal);

  return (
    <div className="invoice-wrapper" ref={ref}>
      <div className="invoice-container text-sm text-black">
        {/* Top Note */}
        <div className="text-center italic py-1 text-xs border-b border-black">
          <span className="inline-flex items-center">
            <svg style={{ width: '12px', height: '12px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path></svg>
            Thank you for doing business with us
          </span>
        </div>
        
        {/* MainHeader */}
        <header className="p-4 border-b border-black flex items-center" style={{ minHeight: '100px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            {supplierData?.logo && (
              <div className="bg-black p-2 inline-block">
                <img alt="Logo" className="h-16 w-16 object-contain grayscale invert" src={supplierData.logo} />
              </div>
            )}
          </div>
          
          <div className="text-center" style={{ flex: 2 }}>
            <h1 className="text-xl font-bold tracking-wider uppercase">{supplierData?.name || supplierData?.companyName || 'MAYDIV INFOTECH'}</h1>
            <p className="text-xs font-semibold">{[supplierData?.address, supplierData?.city, supplierData?.state, supplierData?.pincode].filter(Boolean).join(', ')}</p>
            <p className="text-xs mt-1">
              {supplierData?.phone && <span className="inline-flex items-center mr-3">📞 {supplierData.phone}</span>}
              {supplierData?.email && <span className="inline-flex items-center">✉️ {supplierData.email}</span>}
            </p>
            <p className="text-xs mt-1">
              GSTIN : {supplierData?.gstin} 
              {supplierData?.stateCode && <span className="border border-black px-1 ml-1 text-xxs">State Code : {supplierData.stateCode}</span>}
            </p>
          </div>

          <div style={{ flex: 1 }}></div>
        </header>

        {/* InvoiceTitle */}
        <div className="bg-invoice-blue border-b border-black py-1 px-4 flex justify-between items-center">
          <div className="w-1/3"></div>
          <h2 className="text-lg font-bold w-1/3 text-center uppercase">{data.invoiceType === 'bill-of-supply' ? 'BILL OF SUPPLY' : 'TAX INVOICE'}</h2>
          <div className="w-1/3 text-right italic text-xxs">Original For Recipient</div>
        </div>

        {/* InvoiceDetails */}
        <div className="p-2 space-y-0.5 border-b border-black text-xs">
          <div className="flex justify-between"><span>Invoice Number</span><span className="font-bold">{invoiceNumber || number}</span></div>
          <div className="flex justify-between"><span>Invoice Date</span><span className="font-bold">{formatDate(date)}</span></div>
          <div className="flex justify-between"><span>State</span><span className="font-bold">{supplierData?.state}</span></div>
          <div className="flex justify-between"><span>Reverse Charge</span><span className="font-bold">{otherDetails?.reverseCharge ? 'YES' : 'NO'}</span></div>
        </div>

        {/* BilledToSection */}
        <div className="bg-invoice-blue border-b border-black py-1 px-2 text-center font-bold text-xs">
          Details of Receiver | Billed to
        </div>
        <div className="p-3 border-b border-black space-y-1">
          <p className="text-xs"><span className="font-bold">Name:</span> {buyerDataToUse?.companyName || 'Not specified'}</p>
          <p className="text-xs-tight"><span className="font-bold">Address:</span> {buyerDataToUse?.address} {buyerDataToUse?.city} {buyerDataToUse?.state} {buyerDataToUse?.pincode}</p>
          <p className="text-xs">
            <span className="font-bold">GSTIN:</span> {buyerDataToUse?.gstin || 'Not specified'}
            {buyerDataToUse?.stateCode && <span className="border border-black px-1 ml-2 text-xxs">State Code : {buyerDataToUse.stateCode}</span>}
          </p>
          <p className="text-xs"><span className="font-bold">State:</span> {buyerDataToUse?.state}</p>
        </div>

        {/* ItemsTable */}
        <div className="border-b border-black break-inside-avoid flex-grow">
          <table className="w-full text-center border-collapse">
            <thead className="bg-invoice-blue text-xxs font-bold">
              <tr>
                <th className="border-r border-black py-1 w-8">Sr. No.</th>
                <th className="border-r border-black py-1 px-2 text-left">Name of Product</th>
                <th className="border-r border-black py-1 w-12">HSN/SAC</th>
                <th className="border-r border-black py-1 w-8">QTY</th>
                <th className="border-r border-black py-1 w-8">Unit</th>
                <th className="border-r border-black py-1" style={{width:'3rem'}}>Rate</th>
                <th className="border-r border-black py-1" style={{width:'4rem'}}>Taxable Value</th>
                {showIGST && (
                  <th className="border-r border-black py-1" colSpan="2" style={{width:'5rem'}}>
                    <div className="border-b border-black pb-0.5">IGST</div>
                    <div style={{display:'flex'}}><span style={{width:'50%',borderRight:'1px solid #000',display:'block',textAlign:'center'}}>Rate</span><span style={{width:'50%',display:'block',textAlign:'center'}}>Amount</span></div>
                  </th>
                )}
                {showSGST && (
                  <>
                    <th className="border-r border-black py-1" colSpan="2" style={{width:'5rem'}}>
                      <div className="border-b border-black pb-0.5">CGST</div>
                      <div style={{display:'flex'}}><span style={{width:'50%',borderRight:'1px solid #000',display:'block',textAlign:'center'}}>Rate</span><span style={{width:'50%',display:'block',textAlign:'center'}}>Amount</span></div>
                    </th>
                    <th className="border-r border-black py-1" colSpan="2" style={{width:'5rem'}}>
                      <div className="border-b border-black pb-0.5">SGST</div>
                      <div style={{display:'flex'}}><span style={{width:'50%',borderRight:'1px solid #000',display:'block',textAlign:'center'}}>Rate</span><span style={{width:'50%',display:'block',textAlign:'center'}}>Amount</span></div>
                    </th>
                  </>
                )}
                <th className="py-1" style={{width:'4rem'}}>Total</th>
              </tr>
            </thead>
            <tbody className="text-xxs">
              {products.map((product, index) => {
                const quantity = safeCalculate(product?.quantity);
                const rawRate = safeCalculate(product?.salePrice);
                const gstRate = safeCalculate(product?.gst);
                const cessRate = safeCalculate(product?.cess || 0);

                let rate = rawRate;
                let amount = 0;
                let gstAmount = 0;

                if (product?.taxType === 'inclusive') {
                  const totalTaxRate = gstRate + cessRate;
                  rate = rawRate / (1 + (totalTaxRate / 100));
                  amount = quantity * rate;
                  gstAmount = amount * (gstRate / 100);
                } else {
                  amount = quantity * rate;
                  gstAmount = amount * (gstRate / 100);
                }

                const cgstAmount = gstAmount / 2;
                const sgstAmount = gstAmount / 2;

                return (
                  <tr key={index} className="border-t border-black" style={{height:'2rem'}}>
                    <td className="border-r border-black">{index + 1}</td>
                    <td className="border-r border-black px-2 text-left">
                      <span className="font-semibold block">{product?.name}</span>
                      {product?.description && <span className="italic block text-gray-600">{product.description}</span>}
                    </td>
                    <td className="border-r border-black">{product?.hsn}</td>
                    <td className="border-r border-black">{quantity}</td>
                    <td className="border-r border-black">{product?.unit}</td>
                    <td className="border-r border-black">{rate.toFixed(2)}</td>
                    <td className="border-r border-black bg-invoice-blue font-bold">{amount.toFixed(2)}</td>
                    
                    {showIGST && (
                      <>
                        <td className="border-r border-black" style={{textAlign:'center'}}>{gstRate.toFixed(2)}%</td>
                        <td className="border-r border-black" style={{textAlign:'center'}}>{gstAmount.toFixed(2)}</td>
                      </>
                    )}
                    {showSGST && (
                      <>
                        <td className="border-r border-black">{(gstRate / 2).toFixed(2)}%</td>
                        <td className="border-r border-black">{cgstAmount.toFixed(2)}</td>
                        <td className="border-r border-black">{(gstRate / 2).toFixed(2)}%</td>
                        <td className="border-r border-black">{sgstAmount.toFixed(2)}</td>
                      </>
                    )}
                    <td className="font-bold">₹ {(amount + gstAmount).toFixed(2)}</td>
                  </tr>
                );
              })}
              
              {/* Calculate empty rows to fill space */}
              {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-t border-black" style={{height:'2rem'}}>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black bg-invoice-blue"></td>
                  {showIGST && <><td className="border-r border-black"></td><td className="border-r border-black"></td></>}
                  {showSGST && <><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td></>}
                  <td></td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-t border-black font-bold text-xxs">
                <td className="border-r border-black" colSpan="3">Total</td>
                <td className="border-r border-black">{totalQuantity}</td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black bg-invoice-blue">₹ {subTotal.toFixed(2)}</td>
                {showIGST && (
                  <>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black">₹ {totalIGSTAmount.toFixed(2)}</td>
                  </>
                )}
                {showSGST && (
                  <>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black">₹ {totalCGSTAmount.toFixed(2)}</td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black">₹ {totalSGSTAmount.toFixed(2)}</td>
                  </>
                )}
                <td>₹ {totalWithTax.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CalculationsFooter */}
        <div className="grid grid-cols-2 break-inside-avoid">
          {/* Left side: Words */}
          <div className="border-r border-black flex flex-col justify-center items-center p-2 text-center">
            <p className="text-[0.6rem] font-bold uppercase mb-1">Total Invoice Amount in words</p>
            <p className="text-[0.65rem] font-bold italic">{numberToWords(finalInvoiceAmount)} Rupees Only /-</p>
          </div>
          {/* Right side: Calculation Breakdown */}
          <div className="text-xxs font-bold">
            <div className="flex border-b border-black bg-invoice-blue">
              <div className="w-3/5 p-1 border-r border-black text-left">Total Amount Before Tax</div>
              <div className="w-2/5 p-1 text-right">₹ {subTotal.toFixed(2)}</div>
            </div>
            {showIGST && (
              <div className="flex border-b border-black bg-invoice-blue">
                <div className="w-3/5 p-1 border-r border-black text-right">Add : IGST</div>
                <div className="w-2/5 p-1 text-right">₹ {totalIGSTAmount.toFixed(2)}</div>
              </div>
            )}
            {showSGST && (
              <>
                <div className="flex border-b border-black bg-invoice-blue">
                  <div className="w-3/5 p-1 border-r border-black text-right">Add : CGST</div>
                  <div className="w-2/5 p-1 text-right">₹ {totalCGSTAmount.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black bg-invoice-blue">
                  <div className="w-3/5 p-1 border-r border-black text-right">Add : SGST</div>
                  <div className="w-2/5 p-1 text-right">₹ {totalSGSTAmount.toFixed(2)}</div>
                </div>
              </>
            )}
            <div className="flex border-b border-black bg-invoice-blue">
              <div className="w-3/5 p-1 border-r border-black text-left">Total Tax Amount</div>
              <div className="w-2/5 p-1 text-right">₹ {totalGST.toFixed(2)}</div>
            </div>
            {discountPercent > 0 && (
              <div className="flex border-b border-black">
                <div className="w-3/5 p-1 border-r border-black text-left">Discount Amount ({discountPercent}%)</div>
                <div className="w-2/5 p-1 text-right">-₹ {discountAmount.toFixed(2)}</div>
              </div>
            )}
            <div className="flex border-b border-black bg-invoice-blue">
              <div className="w-3/5 p-1 border-r border-black text-left">Round Off Value</div>
              <div className="w-2/5 p-1 text-right">₹ {roundOffValue > 0 ? '+' : ''}{roundOffValue.toFixed(2)}</div>
            </div>
            <div className="flex border-b border-black bg-invoice-blue">
              <div className="w-3/5 p-1 border-r border-black text-left">Final Invoice Amount</div>
              <div className="w-2/5 p-1 text-right">₹ {finalInvoiceAmount.toFixed(2)}</div>
            </div>
            <div className="flex border-b border-black bg-invoice-blue">
              <div className="w-3/5 p-1 border-r border-black text-left">Balance Due</div>
              <div className="w-2/5 p-1 text-right">₹ {finalInvoiceAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* BankDetailsSection */}
        {bankData && bankData.bankName && (
          <div className="border-y border-black p-2 bg-white break-inside-avoid">
            <div className="flex items-center text-invoice-blue font-bold text-xs mb-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2 .712V17a1 1 0 001 1z"></path></svg>
              Bank and Payment Details
            </div>
            <div className="w-1/2 text-xxs space-y-0.5 ml-2 mt-2 pr-4">
              <div className="flex justify-between"><span className="font-semibold">Account Name</span><span className="font-bold">{bankData.accountHolderName || supplierData?.name || supplierData?.companyName}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Account No.</span><span className="font-bold">{bankData.accountNumber}</span></div>
              <div className="flex justify-between"><span className="font-semibold">IFSC Code</span><span className="font-bold">{bankData.ifscCode}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Bank Name</span><span className="font-bold">{bankData.bankName}</span></div>
              {bankData.branchName && (
                <div className="flex justify-between"><span className="font-semibold">Branch Name</span><span className="font-bold uppercase">{bankData.branchName}</span></div>
              )}
            </div>
          </div>
        )}

        {/* TermsAndSignature */}
        <div className="grid grid-cols-2 min-h-[140px] break-inside-avoid mt-auto">
          <div className="border-r border-black p-2">
            <h4 className="text-xxs font-bold underline mb-1">Terms And Conditions</h4>
            <p className="text-[0.6rem]">1. This is an electronically generated document. 2. All disputes are subject to {supplierData?.city || 'Local'} jurisdiction.</p>
          </div>
          <div className="p-2 flex flex-col justify-between text-center relative">
            <div>
              <p className="text-[0.6rem]">Certified that the particular given above are true and correct</p>
              <p className="text-xs font-bold mt-1">For, {supplierData?.name || supplierData?.companyName || 'MAYDIV INFOTECH'}</p>
            </div>
            {data.includeSignature && data.signatureImage && (
              <div className="flex justify-center items-center my-2">
                 <img src={data.signatureImage} alt="Signature" style={{ maxHeight: '60px' }} />
              </div>
            )}
            <div className="border-t border-black w-2/3 mx-auto mt-16 pt-1">
              <p className="text-xxs font-bold">Authorised Signatory</p>
            </div>
          </div>
        </div>

        {/* Final Small Note */}
        <div className="text-center italic text-xxs py-1 border-t border-black">
          Thank you for your business
        </div>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
