const bcrypt = require('bcrypt');
const { pool, initializeDatabase } = require('./database');

const initializeSampleData = async () => {
  try {
    await initializeDatabase();

    // Insert sample users
    const users = [
      { id: 'user-001', name: 'Rahul Sharma', email: 'rahul@student.edu', phone: '9876543210', department: 'Computer Science', password: 'password123', isAdmin: false },
      { id: 'user-002', name: 'Priya Patel', email: 'priya@student.edu', phone: '9876543211', department: 'Information Technology', password: 'password123', isAdmin: false },
      { id: 'user-003', name: 'Amit Kumar', email: 'amit@student.edu', phone: '9876543212', department: 'Electronics', password: 'password123', isAdmin: false },
      { id: 'user-004', name: 'Sneha Reddy', email: 'sneha@student.edu', phone: '9876543213', department: 'Computer Science', password: 'password123', isAdmin: false },
      { id: 'user-005', name: 'Vikram Singh', email: 'vikram@student.edu', phone: '9876543214', department: 'Information Technology', password: 'password123', isAdmin: false },
      { id: 'user-006', name: 'Anjali Gupta', email: 'anjali@student.edu', phone: '9876543215', department: 'Computer Science', password: 'password123', isAdmin: false },
      { id: 'user-007', name: 'Rohan Mehta', email: 'rohan@student.edu', phone: '9876543216', department: 'Electronics', password: 'password123', isAdmin: false },
      { id: 'user-008', name: 'Kavya Iyer', email: 'kavya@student.edu', phone: '9876543217', department: 'Information Technology', password: 'password123', isAdmin: false },
      { id: 'admin-001', name: 'Admin User', email: 'admin@library.com', phone: '9876543218', department: 'Administration', password: 'admin123', isAdmin: true }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.execute(
        'INSERT IGNORE INTO users (id, name, email, phone, department, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.name, user.email, user.phone, user.department, hashedPassword, user.isAdmin]
      );
    }

    // Insert sample domains
    const domains = ['DBMS', 'Operating Systems', 'Computer Networks', 'Algorithms', 'Data Structures'];

    for (const domain of domains) {
      await pool.execute(
        'INSERT IGNORE INTO domains (name) VALUES (?)',
        [domain]
      );
    }

    // Insert sample books
    const books = [
      // DBMS (4 books)
      { id: 'book-001', title: 'Database System Concepts', author: 'Silberschatz, Korth', domain: 'DBMS', isbn: '978-0073523323', quantity: 5, available: 5 },
      { id: 'book-002', title: 'Fundamentals of Database Systems', author: 'Elmasri, Navathe', domain: 'DBMS', isbn: '978-0133970777', quantity: 4, available: 4 },
      { id: 'book-003', title: 'SQL Performance Explained', author: 'Markus Winand', domain: 'DBMS', isbn: '978-3950307818', quantity: 3, available: 3 },
      { id: 'book-004', title: 'Database Internals', author: 'Alex Petrov', domain: 'DBMS', isbn: '978-1492040347', quantity: 3, available: 3 },

      // Operating Systems (4 books)
      { id: 'book-005', title: 'Operating System Concepts', author: 'Silberschatz, Galvin', domain: 'Operating Systems', isbn: '978-1119320913', quantity: 6, available: 6 },
      { id: 'book-006', title: 'Modern Operating Systems', author: 'Andrew Tanenbaum', domain: 'Operating Systems', isbn: '978-0133591620', quantity: 5, available: 5 },
      { id: 'book-007', title: 'Operating Systems: Three Easy Pieces', author: 'Remzi Arpaci-Dusseau', domain: 'Operating Systems', isbn: '978-1985086593', quantity: 4, available: 4 },
      { id: 'book-008', title: 'Linux Kernel Development', author: 'Robert Love', domain: 'Operating Systems', isbn: '978-0672329463', quantity: 3, available: 3 },

      // Computer Networks (4 books)
      { id: 'book-009', title: 'Computer Networks', author: 'Andrew Tanenbaum', domain: 'Computer Networks', isbn: '978-0132126953', quantity: 5, available: 5 },
      { id: 'book-010', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', domain: 'Computer Networks', isbn: '978-0133594140', quantity: 5, available: 5 },
      { id: 'book-011', title: 'TCP/IP Illustrated', author: 'W. Richard Stevens', domain: 'Computer Networks', isbn: '978-0201633467', quantity: 3, available: 3 },
      { id: 'book-012', title: 'Network Security Essentials', author: 'William Stallings', domain: 'Computer Networks', isbn: '978-0134527338', quantity: 4, available: 4 },

      // Algorithms (4 books)
      { id: 'book-013', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson', domain: 'Algorithms', isbn: '978-0262033848', quantity: 7, available: 7 },
      { id: 'book-014', title: 'Algorithm Design', author: 'Jon Kleinberg', domain: 'Algorithms', isbn: '978-0321295354', quantity: 5, available: 5 },
      { id: 'book-015', title: 'The Algorithm Design Manual', author: 'Steven Skiena', domain: 'Algorithms', isbn: '978-1848000698', quantity: 4, available: 4 },
      { id: 'book-016', title: 'Algorithms', author: 'Robert Sedgewick', domain: 'Algorithms', isbn: '978-0321573513', quantity: 5, available: 5 },

      // Data Structures (4 books)
      { id: 'book-017', title: 'Data Structures and Algorithms in Java', author: 'Michael Goodrich', domain: 'Data Structures', isbn: '978-1118771334', quantity: 6, available: 6 },
      { id: 'book-018', title: 'Data Structures Using C', author: 'Reema Thareja', domain: 'Data Structures', isbn: '978-0198099307', quantity: 5, available: 5 },
      { id: 'book-019', title: 'Advanced Data Structures', author: 'Peter Brass', domain: 'Data Structures', isbn: '978-0521880374', quantity: 3, available: 3 },
      { id: 'book-020', title: 'Data Structures and Algorithms Made Easy', author: 'Narasimha Karumanchi', domain: 'Data Structures', isbn: '978-8192107592', quantity: 4, available: 4 }
    ];

    for (const book of books) {
      await pool.execute(
        'INSERT IGNORE INTO books (id, title, author, domain, isbn, quantity, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [book.id, book.title, book.author, book.domain, book.isbn, book.quantity, book.available]
      );
    }

    console.log('✅ Sample data initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error.message);
    throw error;
  }
};

module.exports = {
  initializeSampleData
};
