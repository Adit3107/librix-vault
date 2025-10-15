const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, department, isAdmin, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only access their own profile, admins can access any
    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, phone, department, isAdmin, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (public registration - no admin required)
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department must be at least 2 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, department, password } = req.body;

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user-${Date.now()}`;

    // Insert new user (always set as non-admin for public registration)
    await pool.execute(
      'INSERT INTO users (id, name, email, phone, department, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, phone || null, department, hashedPassword, false]
    );

    // Return created user (without password)
    const [newUser] = await pool.execute(
      'SELECT id, name, email, phone, department, isAdmin, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department must be at least 2 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isAdmin').optional().isBoolean().withMessage('isAdmin must be a boolean')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, department, password, isAdmin } = req.body;

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user-${Date.now()}`;

    // Insert new user
    await pool.execute(
      'INSERT INTO users (id, name, email, phone, department, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, phone || null, department, hashedPassword, isAdmin || false]
    );

    // Return created user (without password)
    const [newUser] = await pool.execute(
      'SELECT id, name, email, phone, department, isAdmin, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only or self)
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('department').optional().trim().isLength({ min: 2 }).withMessage('Department must be at least 2 characters')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile, admins can update any
    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, department } = req.body;

    // Check if email already exists (if email is being updated)
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update user
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, department = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, department, id]
    );

    // Return updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, name, email, phone, department, isAdmin, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
