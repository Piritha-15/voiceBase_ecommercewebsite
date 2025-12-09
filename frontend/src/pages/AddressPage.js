import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AddressPage.css';

function AddressPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    address_type: 'home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/accounts/addresses/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingId
      ? `http://localhost:8000/api/accounts/addresses/${editingId}/`
      : 'http://localhost:8000/api/accounts/addresses/';
    
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchAddresses();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      address_type: address.address_type,
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/accounts/addresses/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/addresses/${id}/set_default/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      address_type: 'home',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="address-page">
        <div className="container">
          <h1>My Addresses</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="address-page">
      <div className="container">
        <div className="address-header">
          <h1>My Addresses</h1>
          {!showForm && (
            <button className="add-button" onClick={() => setShowForm(true)}>
              ➕ Add New Address
            </button>
          )}
        </div>

        {showForm && (
          <div className="address-form-card">
            <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-group">
                <label>Address Type</label>
                <select name="address_type" value={formData.address_type} onChange={handleChange}>
                  <option value="home">🏠 Home</option>
                  <option value="work">💼 Work</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="House No., Building Name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  placeholder="Road Name, Area, Colony"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                  />
                  Set as default address
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  💾 {editingId ? 'Update' : 'Save'} Address
                </button>
                <button type="button" className="cancel-button" onClick={resetForm}>
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h2>No addresses saved</h2>
            <p>Add your delivery address to make checkout faster</p>
          </div>
        ) : (
          <div className="address-grid">
            {addresses.map((address) => (
              <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                {address.is_default && (
                  <div className="default-badge">✓ Default</div>
                )}
                
                <div className="address-type">
                  {address.address_type === 'home' && '🏠 Home'}
                  {address.address_type === 'work' && '💼 Work'}
                  {address.address_type === 'other' && '📍 Other'}
                </div>

                <h3>{address.full_name}</h3>
                <p className="address-phone">📞 {address.phone}</p>
                
                <div className="address-details">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>

                <div className="address-actions">
                  {!address.is_default && (
                    <button
                      className="action-btn default-btn"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(address)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(address.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddressPage;
