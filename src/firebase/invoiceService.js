// Firebase service for invoice operations
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './config';

const INVOICES_COLLECTION = 'invoices';

// Add a new invoice
export const addInvoice = async (invoiceData) => {
  try {
    console.log('🔥 Firebase: Attempting to add invoice to Firestore...');
    console.log('🔥 Firebase: Database object:', db);
    console.log('🔥 Firebase: Invoice data:', invoiceData);
    
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Firebase: Invoice added successfully with ID: ', docRef.id);
    return { id: docRef.id, ...invoiceData };
  } catch (error) {
    console.error('❌ Firebase: Error adding invoice: ', error);
    console.error('❌ Firebase: Error details:', error.message);
    throw error;
  }
};

// Update an existing invoice
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: new Date()
    });
    console.log('Invoice updated successfully');
    return { id: invoiceId, ...invoiceData };
  } catch (error) {
    console.error('Error updating invoice: ', error);
    throw error;
  }
};

// Delete an invoice
export const deleteInvoice = async (invoiceId) => {
  try {
    await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    console.log('Invoice deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting invoice: ', error);
    throw error;
  }
};

// Get all invoices
export const getAllInvoices = async () => {
  try {
    const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    return invoices;
  } catch (error) {
    console.error('Error getting invoices: ', error);
    throw error;
  }
};

// Real-time listener for invoices
export const subscribeToInvoices = (callback) => {
  const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    callback(invoices);
  }, (error) => {
    console.error('Error listening to invoices: ', error);
  });
};
