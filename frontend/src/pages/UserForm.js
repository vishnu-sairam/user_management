import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/users/${id}`);
          setFormData({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone || '',
            role: response.data.role || 'user'
          });
          setLoading(false);
        } catch (err) {
          setSubmitError('Error loading user data');
          setLoading(false);
        }
      };
      
      fetchUser();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.phone && !/^[0-9\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitError('');
      
      if (isEdit) {
        await axios.put(`/api/users/${id}`, formData);
      } else {
        await axios.post('/api/users', formData);
      }
      
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error saving user';
      setSubmitError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="form-container">
      <h2 className="form-title">
        {isEdit ? 'Edit User' : 'Add New User'}
      </h2>
      
      {submitError && (
        <div className="alert alert-error">
          <p>{submitError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isEdit}
            className={`form-control ${errors.email ? 'error' : ''} ${isEdit ? 'disabled' : ''}`}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`form-control ${errors.phone ? 'error' : ''}`}
          />
          {errors.phone && <p className="error-message">{errors.phone}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-control"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {isEdit ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
