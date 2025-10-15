const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all books with optional filtering by domain
router.get('/', async (req, res) => {
  try {
    const { domain } = req.query;
    let query = `
      SELECT b.*, d.name as domain_name
      FROM books b
      LEFT JOIN domains d ON b.domain = d.name
    `;
    let params = [];

    if (domain) {
      query += ' WHERE b.domain = ?';
      params.push(domain);
    }

    query += ' ORDER BY b.title';

    const [books] = await pool.execute(query, params);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(books[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Create new book (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('author').trim().isLength({ min: 1 }).withMessage('Author is required'),
  body('domain').trim().isLength({ min: 1 }).withMessage('Domain is required'),
  body('isbn').trim().isLength({ min: 10 }).withMessage('ISBN must be at least 10 characters'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('available').optional().isInt({ min: 0 }).withMessage('Available must be a non-negative integer')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, domain, isbn, quantity, available } = req.body;

    // Check if ISBN already exists
    const [existingBooks] = await pool.execute(
      'SELECT id FROM books WHERE isbn = ?',
      [isbn]
    );

    if (existingBooks.length > 0) {
      return res.status(400).json({ error: 'ISBN already exists' });
    }

    // Generate book ID
    const bookId = `book-${Date.now()}`;

    // Insert new book
    await pool.execute(
      'INSERT INTO books (id, title, author, domain, isbn, quantity, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [bookId, title, author, domain, isbn, quantity, available || quantity]
    );

    // Return created book
    const [newBook] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );

    res.status(201).json(newBook[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Update book (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('author').optional().trim().isLength({ min: 1 }).withMessage('Author cannot be empty'),
  body('domain').optional().trim().isLength({ min: 1 }).withMessage('Domain cannot be empty'),
  body('isbn').optional().trim().isLength({ min: 10 }).withMessage('ISBN must be at least 10 characters'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('available').optional().isInt({ min: 0 }).withMessage('Available must be a non-negative integer')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, domain, isbn, quantity, available } = req.body;

    // Check if ISBN already exists (if ISBN is being updated)
    if (isbn) {
      const [existingBooks] = await pool.execute(
        'SELECT id FROM books WHERE isbn = ? AND id != ?',
        [isbn, id]
      );

      if (existingBooks.length > 0) {
        return res.status(400).json({ error: 'ISBN already exists' });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (author !== undefined) {
      updateFields.push('author = ?');
      updateValues.push(author);
    }
    if (domain !== undefined) {
      updateFields.push('domain = ?');
      updateValues.push(domain);
    }
    if (isbn !== undefined) {
      updateFields.push('isbn = ?');
      updateValues.push(isbn);
    }
    if (quantity !== undefined) {
      updateFields.push('quantity = ?');
      updateValues.push(quantity);
      // If quantity is updated, also update available if not explicitly set
      if (available === undefined) {
        updateFields.push('available = ?');
        updateValues.push(quantity);
      }
    }
    if (available !== undefined) {
      updateFields.push('available = ?');
      updateValues.push(available);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    await pool.execute(
      `UPDATE books SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Return updated book
    const [updatedBook] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (updatedBook.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(updatedBook[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book has any issued copies
    const [issuedBooks] = await pool.execute(
      'SELECT COUNT(*) as count FROM issued_books WHERE book_id = ? AND return_date IS NULL',
      [id]
    );

    if (issuedBooks[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete book with issued copies' });
    }

    const [result] = await pool.execute(
      'DELETE FROM books WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
