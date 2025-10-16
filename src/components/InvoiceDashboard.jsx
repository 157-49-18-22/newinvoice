import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiMoreVertical, FiDownload } from 'react-icons/fi';
import { BsCashStack } from 'react-icons/bs';
import DottedArrow from './DottedArrow';
import InvoiceTemplate from './InvoiceTemplate';
import ReactDOM from 'react-dom/client';
import { generatePDF } from '../utils/generatePDF';
import './InvoiceDashboard.css';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('₹', '₹ ');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
};

const InvoiceDashboard = (props) => {
  // Destructure necessary props
  const {
    onFilterClick, 
    onTabChange, 
    activeTab, 
    onCreateInvoice, 
    invoices, 
    onEditInvoice, 
    onDuplicateInvoice, 
    onUpdateStatus,
    onSendEmail,
    onSendReminder,
    onCancelInvoice
  } = props;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const invoiceTemplateRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'e-invoices', label: 'E-Invoices' },
    { id: 'bill-of-supply', label: 'Bill Of Supply' },
  ];

  const handleTabClick = (tabId) => {
    if (props.onTabChange) {
      props.onTabChange(tabId);
    }
  };

  // Event handlers - all unchanged
  const handleEdit = (invoice) => {
    console.log(`Action: Edit Invoice ${invoice.id}`);
    if (props.onEditInvoice) {
        props.onEditInvoice(invoice);
    }
    setOpenMenuId(null);
  };

  const handleSendEmail = (invoiceId) => {
    console.log(`Action: Send Email ${invoiceId}`);
    if (props.onSendEmail) {
      props.onSendEmail(invoiceId);
    }
    setOpenMenuId(null);
  };

  const handleSendReminder = (invoiceId) => {
    console.log(`Action: Send Reminder ${invoiceId}`);
    if (props.onSendReminder) {
      props.onSendReminder(invoiceId);
    }
    setOpenMenuId(null);
  };

  const handleDuplicatePdf = (invoiceId) => {
    console.log(`Action: Duplicate PDF ${invoiceId}`);
    setOpenMenuId(null);
  };

  const handleTriplicatePdf = (invoiceId) => {
    console.log(`Action: Triplicate PDF ${invoiceId}`);
    setOpenMenuId(null);
  };

  const handleCancel = (invoiceId) => {
    console.log(`Action: Cancel Invoice ${invoiceId}`);
    if (window.confirm('Are you sure you want to cancel this invoice? This cannot be undone.')) {
        if (props.onCancelInvoice) {
            props.onCancelInvoice(invoiceId);
        }
    }
    setOpenMenuId(null);
  };

  const handleDelete = (invoiceId) => {
    console.log(`Action: Delete Invoice ${invoiceId}`);
    if (window.confirm('Are you sure you want to permanently delete this invoice? This cannot be undone.')) {
      if (props.onDeleteInvoice && typeof props.onDeleteInvoice === 'function') {
        props.onDeleteInvoice(invoiceId);
      }
    }
    setOpenMenuId(null);
  };

  const handleDuplicate = (invoice) => {
    console.log(`Action: Duplicate Invoice ${invoice.id}`);
    if (props.onDuplicateInvoice) {
      props.onDuplicateInvoice(invoice);
    }
    setOpenMenuId(null);
  };
  
  const handleViewHistory = (invoiceId) => {
    console.log(`Action: View History ${invoiceId}`);
    setOpenMenuId(null);
  };

  // Handle clicking outside of menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.more-options-button')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Filter invoices based on active tab
  const filteredInvoices = invoices.filter(invoice => {
    if (activeTab === 'all') {
      return true;
    } else if (activeTab === 'bill-of-supply') {
      return invoice.type === 'bill-of-supply';
    } else if (activeTab === 'e-invoices') {
      return invoice.type === 'e-invoice';
    }
    return false;
  });

  const getInvoiceTitle = (invoice) => {
    if (invoice.selectedBuyer?.companyName) {
      return invoice.selectedBuyer.companyName;
    }
    return invoice.type === 'bill-of-supply' ? 'Bill of Supply' : 'Cash Sale';
  };

  // Render component
  return (
    <div className="invoice-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-button">←</button>
          <h1>Invoices</h1>
        </div>
        <button className="create-new-button" onClick={props.onCreateInvoice}>
          <FiPlus /> Create New
        </button>
      </header>

      <div className="search-bar">
        <div className="search-input">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-button" onClick={props.onFilterClick}>
          <FiFilter />
        </button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${props.activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            {/* Empty state illustration */}
          </div>
          <h2>Create your first Invoice</h2>
          <DottedArrow />
          <button className="create-invoice-button" onClick={props.onCreateInvoice}>
            <FiPlus /> Create Invoice
          </button>
        </div>
      ) : (
        <div className="invoice-list">
          {filteredInvoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="invoice-card"
            >
              <div className="invoice-main" style={{ cursor: 'default' }}>
                <div className="invoice-title">
                  <h3>{getInvoiceTitle(invoice)}</h3>
                  <span className="amount">{formatAmount(invoice.amount)}</span>
                </div>
                <div className="invoice-details">
                  <div className="invoice-number">{invoice.number || invoice.id}</div>
                  <div className="invoice-date">{formatDate(invoice.date)}</div>
                </div>
                <div className="invoice-status">
                  <span className={`status ${(invoice.status || 'Unpaid').toLowerCase()}`}>
                    {invoice.status || 'Unpaid'}
                  </span>
                </div>
              </div>

              <div className="invoice-actions">
                <button 
                  className="download-pdf-button" 
                  onClick={() => generatePDF(invoice)}
                  title="Download PDF"
                >
                  <FiDownload /> Download PDF
                </button>
                <button className="record-payment">
                  <BsCashStack /> Record Payment
                </button>
                <div className="more-options-container">
                  <button
                    className="more-options-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === invoice.id ? null : invoice.id);
                    }}
                  >
                    <FiMoreVertical />
                  </button>
                  {openMenuId === invoice.id && (
                    <div className="invoice-action-menu" ref={menuRef}>
                      <ul>
                        <li onClick={(e) => { e.stopPropagation(); handleEdit(invoice); }}>Edit Invoice</li>
                        <li onClick={(e) => { e.stopPropagation(); handleSendEmail(invoice.id); }}>Send Email</li>
                        <li onClick={(e) => { e.stopPropagation(); handleSendReminder(invoice.id); }}>Send Reminder</li>
                        <li onClick={(e) => { e.stopPropagation(); handleDuplicatePdf(invoice.id); }}>Duplicate PDF</li>
                        <li onClick={(e) => { e.stopPropagation(); handleTriplicatePdf(invoice.id); }}>Triplicate PDF</li>
                        <li onClick={(e) => { e.stopPropagation(); handleCancel(invoice.id); }} className="action-cancel">Cancel Invoice</li>
                        <li onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id); }} className="action-delete">Delete Invoice</li>
                        <li onClick={(e) => { e.stopPropagation(); handleDuplicate(invoice); }}>Duplicate Invoice</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard; 
