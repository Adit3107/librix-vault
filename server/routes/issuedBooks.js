const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all issued books (admin can see all, users see only their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT ib.*, u.name as user_name, u.department, b.title as book_title, b.author
      FROM issued_books ib
      JOIN users u ON ib.user_id = u.id
      JOIN books b ON ib.book_id = b.id
    `;
    let params = [];

    // Users can only see their own issued books, admins can see all
    if (!req.user.isAdmin) {
      query += ' WHERE ib.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY ib.created_at DESC';

    const [issuedBooks] = await pool.execute(query, params);
    res.json(issuedBooks);
  } catch (error) {
    console.error('Error fetching issued books:', error);
    res.status(500).json({ error: 'Failed to fetch issued books' });
  }
});

// Get issued book by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [issuedBooks] = await pool.execute(
      `SELECT ib.*, u.name as user_name, u.department, b.title as book_title, b.author
       FROM issued_books ib
       JOIN users u ON ib.user_id = u.id
       JOIN books b ON ib.book_id = b.id
       WHERE ib.id = ?`,
      [id]
    );

    if (issuedBooks.length === 0) {
      return res.status(404).json({ error: 'Issued book not found' });
    }

    const issuedBook = issuedBooks[0];

    // Users can only access their own issued books, admins can access any
    if (req.user.id !== issuedBook.user_id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(issuedBook);
  } catch (error) {
    console.error('Error fetching issued book:', error);
    res.status(500).json({ error: 'Failed to fetch issued book' });
  }
});

// Issue a book
router.post('/', authenticateToken, [
  body('book_id').notEmpty().withMessage('Book ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('due_date').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { book_id, quantity, due_date } = req.body;
    const user_id = req.user.id;

    // Check if book exists and has enough available copies
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];

    if (book.available < quantity) {
      return res.status(400).json({ error: 'Not enough copies available' });
    }

    // Check if user already has this book issued
    const [existingIssues] = await pool.execute(
      'SELECT id FROM issued_books WHERE user_id = ? AND book_id = ? AND return_date IS NULL',
      [user_id, book_id]
    );

    if (existingIssues.length > 0) {
      return res.status(400).json({ error: 'You already have this book issued' });
    }

    // Check due date is not in the past
    const issueDate = new Date();
    const dueDateObj = new Date(due_date);

    if (dueDateObj <= issueDate) {
      return res.status(400).json({ error: 'Due date must be after today' });
    }

    // Generate issued book ID
    const issuedBookId = `issued-${Date.now()}`;

    // Create issued book record
    await pool.execute(
      `INSERT INTO issued_books (id, user_id, book_id, book_title, quantity, issue_date, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'issued')`,
      [issuedBookId, user_id, book_id, book.title, quantity, issueDate.toISOString().split('T')[0], due_date]
    );

    // Update book availability
    await pool.execute(
      'UPDATE books SET available = available - ? WHERE id = ?',
      [quantity, book_id]
    );

    // Return created issued book with user and book details
    const [newIssuedBook] = await pool.execute(
      `SELECT ib.*, u.name as user_name, u.department, b.title as book_title, b.author
       FROM issued_books ib
       JOIN users u ON ib.user_id = u.id
       JOIN books b ON ib.book_id = b.id
       WHERE ib.id = ?`,
      [issuedBookId]
    );

    res.status(201).json(newIssuedBook[0]);
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ error: 'Failed to issue book' });
  }
});

// Return a book
router.put('/:id/return', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Get issued book details
    const [issuedBooks] = await pool.execute(
      `SELECT ib.*, b.title as book_title
       FROM issued_books ib
       JOIN books b ON ib.book_id = b.id
       WHERE ib.id = ?`,
      [id]
    );

    if (issuedBooks.length === 0) {
      return res.status(404).json({ error: 'Issued book not found' });
    }

    const issuedBook = issuedBooks[0];

    // Users can only return their own books, admins can return any
    if (issuedBook.user_id !== user_id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if already returned
    if (issuedBook.return_date) {
      return res.status(400).json({ error: 'Book already returned' });
    }

    // Calculate fine if overdue
    const today = new Date();
    const dueDate = new Date(issuedBook.due_date);
    const fineAmount = today > dueDate ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) * 50 : 0;

    // Update issued book record
    await pool.execute(
      `UPDATE issued_books
       SET return_date = ?, fine_amount = ?, status = 'returned', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [today.toISOString().split('T')[0], fineAmount, id]
    );

    // Update book availability
    await pool.execute(
      'UPDATE books SET available = available + ? WHERE id = ?',
      [issuedBook.quantity, issuedBook.book_id]
    );

    // Return updated issued book with calculated fine
    const [updatedIssuedBook] = await pool.execute(
      `SELECT ib.*, u.name as user_name, u.department, b.title as book_title, b.author
       FROM issued_books ib
       JOIN users u ON ib.user_id = u.id
       JOIN books b ON ib.book_id = b.id
       WHERE ib.id = ?`,
      [id]
    );

    res.json({
      ...updatedIssuedBook[0],
      message: 'Book returned successfully',
      fine_amount: fineAmount
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Failed to return book' });
  }
});

// Delete issued book record (admin only - for cleanup)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get issued book details before deletion
    const [issuedBooks] = await pool.execute(
      'SELECT * FROM issued_books WHERE id = ?',
      [id]
    );

    if (issuedBooks.length === 0) {
      return res.status(404).json({ error: 'Issued book not found' });
    }

    const issuedBook = issuedBooks[0];

    // If not returned, restore book availability
    if (!issuedBook.return_date) {
      await pool.execute(
        'UPDATE books SET available = available + ? WHERE id = ?',
        [issuedBook.quantity, issuedBook.book_id]
      );
    }

    // Delete issued book record
    await pool.execute(
      'DELETE FROM issued_books WHERE id = ?',
      [id]
    );

    res.json({ message: 'Issued book record deleted successfully' });
  } catch (error) {
    console.error('Error deleting issued book:', error);
    res.status(500).json({ error: 'Failed to delete issued book record' });
  }
});

module.exports = router;
