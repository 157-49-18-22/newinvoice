import React, { useState, useEffect, useRef } from 'react';
import './shared.css';
import './SupplierDetails.css';

const SUPPLIER_KEY = 'savedSuppliers';

const SupplierDetails = ({ onClose, onSave = () => {}, initialData, viewOnly = false }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showView, setShowView] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: '',
    contactPerson: '',
    notes: '',
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(initialData?.logo || null);

  // Load suppliers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SUPPLIER_KEY);
    if (saved) {
      try {
        setSuppliers(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved suppliers:', e);
      }
    }
  }, []);

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    if (suppliers.length > 0) {
      try {
        localStorage.setItem(SUPPLIER_KEY, JSON.stringify(suppliers));
      } catch (e) {
        console.error('Error saving suppliers:', e);
      }
    }
  }, [suppliers]);

  const handleAddNew = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      pan: '',
      contactPerson: '',
      notes: '',
      logo: null
    });
    setLogoPreview(null);
    setSelectedIndex(null);
    setEditing(true);
  };

  const handleEdit = (idx) => {
    setFormData(suppliers[idx]);
    setLogoPreview(suppliers[idx].logo || null);
    setSelectedIndex(idx);
    setEditing(true);
  };

  const handleView = (idx) => {
    setFormData(suppliers[idx]);
    setSelectedIndex(idx);
    setShowView(true);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers => suppliers.filter((_, i) => i !== idx));
      setShowView(false);
      setEditing(false);
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields.');
      return;
    }
    if (selectedIndex !== null) {
      // Edit existing
      setSuppliers(suppliers => suppliers.map((sup, i) => i === selectedIndex ? formData : sup));
    } else {
      // Add new
      setSuppliers(suppliers => [...suppliers, formData]);
    }
    setEditing(false);
    setShowView(false);
  };

  // Add logo upload handler
  const fileInputRef = useRef(null);
  const handleLogoClick = () => fileInputRef.current.click();
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // List view
  if (!editing && !showView) {
    return (
      <div className="details-page">
        <header className="details-header">
          <div className="header-left">
            <button className="back-button" onClick={onClose}>←</button>
            <h1>Suppliers</h1>
          </div>
          {!viewOnly && (
            <button className="add-button" onClick={handleAddNew} style={{background: '#FFD700', color: '#333', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Add New</button>
          )}
        </header>
        <div className="suppliers-list">
          {suppliers.length === 0 ? <div>No suppliers saved.</div> : (
            <ul style={{listStyle: 'none', padding: 0}}>
              {suppliers.map((sup, idx) => (
                <li key={idx} style={{marginBottom: 16, border: '1px solid #eee', borderRadius: 8, padding: 12}}>
                  <div><b>Name:</b> {sup.name}</div>
                  <div><b>Email:</b> {sup.email}</div>
                  <div><b>Phone:</b> {sup.phone}</div>
                  <div style={{marginTop: 8}}>
                    {onSave && (
                      <button className="select-button" onClick={() => { onSave(sup); onClose(); }} style={{background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Select</button>
                    )}
                    {!viewOnly && (
                      <>
                        <button className="edit-button" onClick={() => handleEdit(idx)} style={{marginLeft: 8, background: '#FFD700', color: '#333', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Edit</button>
                        <button className="delete-button" onClick={() => handleDelete(idx)} style={{marginLeft: 8, background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Delete</button>
                      </>
                    )}
                    <button className="see-button" onClick={() => handleView(idx)} style={{marginLeft: 8, background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>See</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // View modal
  if (showView) {
    return (
      <div className="details-page">
        <header className="details-header">
          <div className="header-left">
            <button className="back-button" onClick={() => setShowView(false)}>←</button>
            <h1>Supplier Details</h1>
          </div>
        </header>
        <div className="details-summary">
          <div className="summary-row"><span className="summary-label">Name:</span> <span className="summary-value">{formData.name}</span></div>
          <div className="summary-row"><span className="summary-label">Email:</span> <span className="summary-value">{formData.email}</span></div>
          <div className="summary-row"><span className="summary-label">Phone:</span> <span className="summary-value">{formData.phone}</span></div>
          {formData.address && <div className="summary-row"><span className="summary-label">Address:</span> <span className="summary-value">{formData.address}</span></div>}
          {formData.gstin && <div className="summary-row"><span className="summary-label">GSTIN:</span> <span className="summary-value">{formData.gstin}</span></div>}
          {formData.pan && <div className="summary-row"><span className="summary-label">PAN:</span> <span className="summary-value">{formData.pan}</span></div>}
          {formData.contactPerson && <div className="summary-row"><span className="summary-label">Contact Person:</span> <span className="summary-value">{formData.contactPerson}</span></div>}
          {formData.notes && <div className="summary-row"><span className="summary-label">Notes:</span> <span className="summary-value">{formData.notes}</span></div>}
        </div>
      </div>
    );
  }

  // Form view (add/edit)
  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button className="back-button" onClick={() => { setEditing(false); setSelectedIndex(null); }}>←</button>
          <h1>{selectedIndex !== null ? 'Edit Supplier' : 'Add Supplier'}</h1>
        </div>
        <button className="save-button" onClick={handleSave}>Save</button>
      </header>
      <form className="details-form" onSubmit={handleSave}>
        <div className="logo-section">
          <div 
            className="logo-upload" 
            onClick={handleLogoClick}
            style={{
              backgroundImage: logoPreview ? `url(${logoPreview})` : 'none'
            }}
          >
            {!logoPreview && (
              <div className="logo-placeholder">
                <span>+</span>
                <span>Add Logo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          {logoPreview && (
            <button
              type="button"
              className="remove-logo"
              onClick={() => {
                setLogoPreview(null);
                setFormData(prev => ({ ...prev, logo: null }));
              }}
            >
              Remove Logo
            </button>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="name">Name<span className="required">*</span></label>
          <input type="text" id="name" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Supplier Name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email<span className="required">*</span></label>
          <input type="email" id="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email Address" required />
        </div>
          <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone Number" />
        </div>
          <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea id="address" name="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Address" />
          </div>
          <div className="form-group">
            <label htmlFor="gstin">GSTIN</label>
          <input type="text" id="gstin" name="gstin" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} placeholder="GSTIN" />
          </div>
        <div className="form-group">
          <label htmlFor="pan">PAN</label>
          <input type="text" id="pan" name="pan" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} placeholder="PAN" />
        </div>
          <div className="form-group">
          <label htmlFor="contactPerson">Contact Person</label>
          <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="Contact Person" />
          </div>
          <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional Notes" />
        </div>
      </form>
      <button className="save-button-bottom" onClick={handleSave}>SAVE</button>
    </div>
  );
};

export default SupplierDetails; 
