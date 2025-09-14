const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');

// Validation rules
const userValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9\-\+\(\)\s]+$/).withMessage('Please enter a valid phone number'),
  body('company').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.zip').optional().trim(),
  body('address.geo.lat').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('address.geo.lng').optional().isFloat().withMessage('Longitude must be a valid number')
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
    address: user.address || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Error handler
const handleError = (res, error, message = 'An error occurred') => {
  console.error(`${message}:`, error);
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await db.User.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: users.map(formatUserResponse)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch users');
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
router.post('/', userValidationRules, async (req, res) => {
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

// Update user
router.put('/:id', userValidationRules, async (req, res) => {
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
