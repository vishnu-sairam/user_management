const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');

// Validation rules for creating a user
const createUserValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9\-\+\(\)\s]+$/).withMessage('Please enter a valid phone number'),
  body('company').optional().trim(),
  body('address').optional().isObject()
];

// Validation rules for updating a user (all fields optional)
const updateUserValidationRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty')
    .matches(/^[0-9\-\+\(\)\s]+$/).withMessage('Please enter a valid phone number'),
  body('company').optional().trim(),
  body('address').optional().isObject()
];

// Format user response
const formatUserResponse = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    address: {
      street: user.street || '',
      city: user.city || '',
      zip: user.zip || '',
      geo: {
        lat: user.geo_lat || '',
        lng: user.geo_lng || ''
      }
    },
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  };
};

// Error handler
const handleError = (res, error, message = 'An error occurred', status = 500) => {
  console.error('\n--- ERROR HANDLER ---');
  console.error('Error Message:', message);
  console.error('Error Object:', error);
  console.error('Error Stack:', error.stack);
  console.error('Error Code:', error.code);
  console.error('Error Details:', error.details);
  console.error('Error Hint:', error.hint);
  console.error('Error Position:', error.position);
  console.error('Error Internal Query:', error.internalQuery);
  console.error('--- END ERROR HANDLER ---\n');
  
  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  });
};

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all users...');
    const { data: users, error, status, statusText } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Supabase response:', { status, statusText, error });
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    res.json({
      success: true,
      data: users.map(formatUserResponse)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch users');
  }
});

// Get single user by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch user');
  }
});

// Create new user
router.post('/', createUserValidationRules, async (req, res) => {
  try {
    console.log('Received request to create user:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    // Handle both nested and flat formats
    const userToCreate = {
      // Direct fields
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company || null,
      
      // Handle both nested and flat address formats
      street: req.body.street || (req.body.address && req.body.address.street) || null,
      city: req.body.city || (req.body.address && req.body.address.city) || null,
      zip: req.body.zip || (req.body.address && req.body.address.zip) || null,
      
      // Handle both nested and flat geo formats
      geo_lat: req.body.geo_lat || 
              (req.body.geo && req.body.geo.lat) || 
              (req.body.address && req.body.address.geo && req.body.address.geo.lat) ? 
                String(req.body.geo_lat || req.body.geo?.lat || req.body.address?.geo?.lat) : null,
      
      geo_lng: req.body.geo_lng || 
              (req.body.geo && req.body.geo.lng) || 
              (req.body.address && req.body.address.geo && req.body.address.geo.lng) ? 
                String(req.body.geo_lng || req.body.geo?.lng || req.body.address?.geo?.lng) : null,
      
    };
    
    console.log('Processed user data for DB:', JSON.stringify(userToCreate, null, 2));

    const { data: user, error } = await supabase
      .from('users')
      .insert([userToCreate])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create user: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to create user');
  }
});

// Update user
router.put('/:id', updateUserValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    console.log('Raw update request body:', JSON.stringify(req.body, null, 2));
    
    // Handle both nested and flat formats
    const userToUpdate = {
      // Direct fields
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company || null,
      
      // Handle both nested and flat address formats
      street: req.body.street !== undefined ? req.body.street : 
             (req.body.address && req.body.address.street !== undefined ? req.body.address.street : undefined),
      
      city: req.body.city !== undefined ? req.body.city : 
           (req.body.address && req.body.address.city !== undefined ? req.body.address.city : undefined),
      
      zip: req.body.zip !== undefined ? req.body.zip : 
          (req.body.address && req.body.address.zip !== undefined ? req.body.address.zip : undefined),
      
      // Handle both nested and flat geo formats
      geo_lat: req.body.geo_lat !== undefined ? 
              (req.body.geo_lat !== null ? String(req.body.geo_lat) : null) :
              (req.body.geo && req.body.geo.lat !== undefined ? 
                (req.body.geo.lat !== null ? String(req.body.geo.lat) : null) :
                (req.body.address && req.body.address.geo && req.body.address.geo.lat !== undefined ?
                  (req.body.address.geo.lat !== null ? String(req.body.address.geo.lat) : null) : undefined)),
      
      geo_lng: req.body.geo_lng !== undefined ? 
              (req.body.geo_lng !== null ? String(req.body.geo_lng) : null) :
              (req.body.geo && req.body.geo.lng !== undefined ? 
                (req.body.geo.lng !== null ? String(req.body.geo.lng) : null) :
                (req.body.address && req.body.address.geo && req.body.address.geo.lng !== undefined ?
                  (req.body.address.geo.lng !== null ? String(req.body.address.geo.lng) : null) : undefined)),
      
    };
    
    // Remove undefined values to avoid overwriting with null
    Object.keys(userToUpdate).forEach(key => {
      if (userToUpdate[key] === undefined) {
        delete userToUpdate[key];
      }
    });
    
    console.log('Processed update data for DB:', JSON.stringify(userToUpdate, null, 2));

    const { data: user, error } = await supabase
      .from('users')
      .update(userToUpdate)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    if (!user) return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });

    res.json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to update user');
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete user');
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch user');
  }
});

// Create user
router.post('/', createUserValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, phone, company, address = {} } = req.body;
    
    const user = await db.User.create({
      name,
      email,
      phone,
      company,
      address
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formatUserResponse(user)
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    return handleError(res, error, 'Failed to create user');
  }
});

// Update user (alternative route)
router.put('/:id', updateUserValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, phone, company, address = {} } = req.body;
    const user = await db.User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    const updatedUser = await user.update({
      name,
      email,
      phone,
      company,
      address
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: formatUserResponse(updatedUser)
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    return handleError(res, error, 'Failed to update user');
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete user');
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const users = await db.User.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.like]: `%${query}%` } },
          { email: { [db.Sequelize.Op.like]: `%${query}%` } },
          { phone: { [db.Sequelize.Op.like]: `%${query}%` } },
          { company: { [db.Sequelize.Op.like]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users.map(formatUserResponse)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to search users');
  }
});

module.exports = router;
