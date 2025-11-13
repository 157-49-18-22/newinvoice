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
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const INVOICES_COLLECTION = 'invoices';

// Helper function to convert Firestore data to plain JS objects
const convertTimestamps = (data) => {
  if (data === null || typeof data !== 'object') return data;
  
  // Convert Firestore Timestamp to Date
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }
  
  // Handle objects
  const result = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      result[key] = convertTimestamps(data[key]);
    }
  }
  return result;
};

// Add a new invoice
export const addInvoice = async (invoiceData) => {
  try {
    console.log('🔥 Firebase: Attempting to add invoice to Firestore...');
    
    // Prepare the invoice data
    const invoiceToAdd = {
      ...invoiceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), invoiceToAdd);
    console.log('✅ Firebase: Invoice added successfully with ID: ', docRef.id);
    
    // Return the saved invoice with the new ID
    return { 
      id: docRef.id, 
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
    const updateData = {
      ...invoiceData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(invoiceRef, updateData);
    console.log('✅ Firebase: Invoice updated successfully');
    
    return { 
      id: invoiceId, 
      ...invoiceData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Firebase: Error updating invoice: ', error);
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
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...convertTimestamps(data)
      };
    });
  } catch (error) {
    console.error('❌ Firebase: Error getting invoices: ', error);
    throw error;
  }
};

// Real-time listener for invoices
export const subscribeToInvoices = (callback) => {
  const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const invoices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    }));
    callback(invoices);
  }, (error) => {
    console.error('Error listening to invoices:', error);
  });
};
