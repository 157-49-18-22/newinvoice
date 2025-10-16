import React, { useState, useEffect } from 'react';
import InvoiceDashboard from './components/InvoiceDashboard';
import InvoiceFilter from './components/InvoiceFilter';
import CreateInvoice from './components/CreateInvoice';
import { addInvoice, updateInvoice, deleteInvoice, subscribeToInvoices } from './firebase/invoiceService';
import './App.css';

function App() {
  const [showFilter, setShowFilter] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Load invoices from Firebase when app starts
  useEffect(() => {
    console.log('🔥 Setting up Firebase real-time listener for invoices...');
    
    const unsubscribe = subscribeToInvoices((firebaseInvoices) => {
      console.log('🔥 Firebase: Received invoices from Firestore:', firebaseInvoices);
      setInvoices(firebaseInvoices);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔥 Cleaning up Firebase subscription...');
      unsubscribe();
    };
  }, []);

  const handleFilterApply = (filters) => {
    setShowFilter(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowCreateInvoice(true);
  };

  // Add delete invoice handler
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      console.log(`🔥 [App] Deleting invoice with ID: ${invoiceId} from Firebase...`);
      await deleteInvoice(invoiceId);
      console.log('✅ [App] Invoice deleted successfully from Firebase');
    } catch (error) {
      console.error('❌ [App] Error deleting invoice from Firebase:', error);
      alert('Error deleting invoice. Please try again.');
    }
  };

  // Add cancel invoice handler
  const handleCancelInvoice = async (invoiceId) => {
    try {
      console.log(`🔥 [App] Cancelling invoice with ID: ${invoiceId} in Firebase...`);
      const invoiceToUpdate = invoices.find(invoice => invoice.id === invoiceId);
      if (invoiceToUpdate) {
        await updateInvoice(invoiceId, { ...invoiceToUpdate, status: 'cancelled' });
        console.log('✅ [App] Invoice cancelled successfully in Firebase');
      }
    } catch (error) {
      console.error('❌ [App] Error cancelling invoice in Firebase:', error);
      alert('Error cancelling invoice. Please try again.');
    }
  };

  // Add duplicate invoice handler
  const handleDuplicateInvoice = async (invoice) => {
    try {
      console.log(`🔥 [App] Duplicating invoice with ID: ${invoice.id} in Firebase...`);
      
      // Create a new invoice based on the existing one
      const newInvoiceData = {
        ...invoice,
        number: `${invoice.number || invoice.id}-copy`,
        date: new Date().toLocaleDateString('en-IN'),
        status: 'unpaid'
      };
      
      // Remove the id so Firebase can generate a new one
      delete newInvoiceData.id;
      
      await addInvoice(newInvoiceData);
      console.log('✅ [App] Invoice duplicated successfully in Firebase');
    } catch (error) {
      console.error('❌ [App] Error duplicating invoice in Firebase:', error);
      alert('Error duplicating invoice. Please try again.');
    }
  };
  
  // Add edit invoice handler
  const handleEditInvoice = (invoice) => {
    console.log(`[App handleEditInvoice] Editing invoice with ID: ${invoice.id}`);
    setEditingInvoice(invoice);
    setShowCreateInvoice(true);
  };

  // Add status update handler
  const handleUpdateStatus = async (invoiceId, status) => {
    try {
      console.log(`🔥 [App] Updating status for invoice ID: ${invoiceId} to ${status} in Firebase...`);
      const invoiceToUpdate = invoices.find(invoice => invoice.id === invoiceId);
      if (invoiceToUpdate) {
        await updateInvoice(invoiceId, { ...invoiceToUpdate, status });
        console.log('✅ [App] Invoice status updated successfully in Firebase');
      }
    } catch (error) {
      console.error('❌ [App] Error updating invoice status in Firebase:', error);
      alert('Error updating invoice status. Please try again.');
    }
  };

  // Email and reminder handlers (mock functionality)
  const handleSendEmail = (invoiceId) => {
    console.log(`[App handleSendEmail] Would send email for invoice ID: ${invoiceId}`);
    alert(`Email would be sent for invoice ${invoiceId} in a real application`);
  };
  
  const handleSendReminder = (invoiceId) => {
    console.log(`[App handleSendReminder] Would send reminder for invoice ID: ${invoiceId}`);
    alert(`Payment reminder would be sent for invoice ${invoiceId} in a real application`);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      console.log('🔥 [App] Starting to save invoice to Firebase...');
      console.log('🔥 [App] Invoice data:', invoiceData);
      console.log('🔥 [App] Editing invoice:', editingInvoice);
      
      if (editingInvoice) {
        // Update existing invoice in Firebase
        console.log('🔥 [App] Updating existing invoice in Firebase...');
        const updatedInvoiceData = {
          ...invoiceData,
          type: invoiceData.invoiceType || 'tax-invoice',
          amount: invoiceData.amount || 0,
          number: invoiceData.invoiceNo || String(invoices.length + 1),
          date: invoiceData.date || new Date().toLocaleDateString('en-IN'),
          status: editingInvoice.status || 'unpaid',
          selectedBuyer: invoiceData.selectedBuyer || {},
          supplierData: invoiceData.supplierData || {},
          products: invoiceData.products || [],
          transportData: invoiceData.transportData || {},
          otherData: invoiceData.otherData || {},
          bankData: invoiceData.bankData || {},
          includeSignature: invoiceData.includeSignature || false,
          signatureImage: invoiceData.signatureImage || null
        };
        
        await updateInvoice(editingInvoice.id, updatedInvoiceData);
        console.log('✅ [App] Invoice updated successfully in Firebase');
      } else {
        // Create new invoice in Firebase
        console.log('🔥 [App] Creating new invoice in Firebase...');
        const newInvoiceData = {
          type: invoiceData.invoiceType || 'tax-invoice',
          amount: invoiceData.amount || 0,
          number: invoiceData.invoiceNo || String(invoices.length + 1),
          date: invoiceData.date || new Date().toLocaleDateString('en-IN'),
          status: 'unpaid',
          selectedBuyer: invoiceData.selectedBuyer || {},
          supplierData: invoiceData.supplierData || {},
          products: invoiceData.products || [],
          transportData: invoiceData.transportData || {},
          otherData: invoiceData.otherData || {},
          bankData: invoiceData.bankData || {},
          includeSignature: invoiceData.includeSignature || false,
          signatureImage: invoiceData.signatureImage || null
        };
        
        await addInvoice(newInvoiceData);
        console.log('✅ [App] Invoice created successfully in Firebase');
      }
      
      // Close the create invoice modal
      setShowCreateInvoice(false);
      setEditingInvoice(null);
      
    } catch (error) {
      console.error('❌ [App] Error saving invoice to Firebase:', error);
      alert('Error saving invoice. Please try again.');
    }
  };

  return (
    <div className="app">
      {!showCreateInvoice && (
        <InvoiceDashboard 
          onFilterClick={() => setShowFilter(true)}
          onTabChange={handleTabChange}
          activeTab={activeTab}
          onCreateInvoice={handleCreateInvoice}
          invoices={invoices}
          onDeleteInvoice={handleDeleteInvoice}
          onCancelInvoice={handleCancelInvoice}
          onDuplicateInvoice={handleDuplicateInvoice}
          onEditInvoice={handleEditInvoice}
          onUpdateStatus={handleUpdateStatus}
          onSendEmail={handleSendEmail}
          onSendReminder={handleSendReminder}
        />
      )}
      
      {showFilter && (
        <InvoiceFilter
          onClose={() => setShowFilter(false)}
          onApply={handleFilterApply}
        />
      )}

      {showCreateInvoice && (
        <CreateInvoice
          onClose={() => {
            setShowCreateInvoice(false);
            setEditingInvoice(null);
          }}
          onSave={handleSaveInvoice}
          initialInvoiceData={editingInvoice}
        />
      )}
    </div>
  );
}

export default App;
