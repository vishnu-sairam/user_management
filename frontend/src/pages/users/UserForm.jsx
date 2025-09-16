import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { userApi } from '../../services/api.js';
import { toast } from 'react-hot-toast';

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(
      /^[0-9\-\+\(\)\s]+$/,
      'Please enter a valid phone number'
    )
    .required('Phone is required'),
  company: Yup.string(),
  address: Yup.object({
    street: Yup.string(),
    city: Yup.string(),
    zip: Yup.string(),
    geo: Yup.object({
      lat: Yup.number().typeError('Latitude must be a number'),
      lng: Yup.number().typeError('Longitude must be a number'),
    }),
  }),
});

export default function UserForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with empty values
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: {
        street: '',
        city: '',
        zip: '',
        geo: {
          lat: '',
          lng: '',
        },
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        
        // Prepare the data for the API
        const userData = {
          ...values,
          // Convert empty strings to null for optional fields
          company: values.company || null,
          address: {
            street: values.address.street || null,
            city: values.address.city || null,
            zip: values.address.zip || null,
            geo: {
              lat: values.address.geo.lat ? parseFloat(values.address.geo.lat) : null,
              lng: values.address.geo.lng ? parseFloat(values.address.geo.lng) : null,
            },
          },
        };

        if (isEditMode) {
          await userApi.update(id, userData);
          toast.success('User updated successfully');
        } else {
          await userApi.create(userData);
          toast.success('User created successfully');
        }
        
        navigate('/users');
      } catch (error) {
        console.error('Error saving user:', error);
        toast.error(error.message || 'Failed to save user');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Load user data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchUser = async () => {
      try {
        const response = await userApi.getById(id);
        const userData = response.data;
        
        // Set form values with user data
        formik.setValues({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            zip: userData.address?.zip || '',
            geo: {
              lat: userData.address?.geo?.lat?.toString() || '',
              lng: userData.address?.geo?.lng?.toString() || '',
            },
          },
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditMode]);

  // Helper function to render form field with error handling
  const renderField = (name, label, type = 'text', placeholder = '') => {
    const fieldName = name.split('.');
    const value = fieldName.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ''), formik.values);
    const touched = fieldName.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : false), formik.touched);
    const error = fieldName.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ''), formik.errors);

    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            touched && error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          placeholder={placeholder}
        />
        {touched && error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <div className="flex items-center">
          <Link
            to={isEditMode ? `/users/${id}` : '/users'}
            className="mr-4 p-1 rounded-full hover:bg-gray-100"
            title={isEditMode ? 'Back to user' : 'Back to users'}
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h3>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={formik.handleSubmit} className="divide-y divide-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                {renderField('name', 'Full Name', 'text', 'John Doe')}
              </div>
              
              <div className="sm:col-span-3">
                {renderField('email', 'Email Address', 'email', 'john@example.com')}
              </div>

              <div className="sm:col-span-3">
                {renderField('phone', 'Phone Number', 'tel', '+1 (555) 123-4567')}
              </div>

              <div className="sm:col-span-3">
                {renderField('company', 'Company', 'text', 'Acme Inc.')}
              </div>

              <div className="sm:col-span-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Address</h4>
                <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 border-t border-gray-200 pt-4">
                  <div className="sm:col-span-6">
                    {renderField('address.street', 'Street', 'text', '123 Main St')}
                  </div>
                  
                  <div className="sm:col-span-2">
                    {renderField('address.city', 'City', 'text', 'New York')}
                  </div>
                  
                  <div className="sm:col-span-2">
                    {renderField('address.zip', 'ZIP/Postal Code', 'text', '10001')}
                  </div>

                  <div className="sm:col-span-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Geolocation (optional)</h5>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        {renderField('address.geo.lat', 'Latitude', 'number', '40.7128')}
                      </div>
                      <div className="sm:col-span-3">
                        {renderField('address.geo.lng', 'Longitude', 'number', '-74.0060')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <Link
              to={isEditMode ? `/users/${id}` : '/users'}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !formik.isValid}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                submitting || !formik.isValid
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update User'
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
