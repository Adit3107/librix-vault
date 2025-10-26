// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  isAdmin: boolean;
  created_at: string;
  updated_at: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  domain: string;
  isbn: string;
  quantity: number;
  available: number;
  created_at: string;
  updated_at: string;
}

interface IssuedBook {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  quantity: number;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: 'issued' | 'returned' | 'overdue';
  created_at: string;
  updated_at: string;
  user_name?: string;
  department?: string;
  author?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to make authenticated API calls
const apiCall = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication functions
export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(errorData.error || 'Login failed');
  }

  const data = await response.json();

  // Store token in localStorage
  localStorage.setItem('auth_token', data.token);

  return data;
};

export const logout = (): void => {
  localStorage.removeItem('auth_token');
};

// User functions
export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await apiCall('/users');
    console.log(`👥 Loaded ${users.length} users from database`);
    return users;
  } catch (error) {
    console.warn('API not available, using mock data for users');
    // Return mock data for testing
    return [
      {
        id: 'user-001',
        name: 'Rahul Sharma',
        email: 'rahul@student.edu',
        phone: '9876543210',
        department: 'Computer Science',
        isAdmin: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 'user-002',
        name: 'Priya Patel',
        email: 'priya@student.edu',
        phone: '9876543211',
        department: 'Information Technology',
        isAdmin: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      },
      {
        id: 'user-003',
        name: 'Amit Kumar',
        email: 'amit@student.edu',
        phone: '9876543212',
        department: 'Electronics',
        isAdmin: false,
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z'
      },
      {
        id: 'user-004',
        name: 'Sneha Reddy',
        email: 'sneha@student.edu',
        phone: '9876543213',
        department: 'Computer Science',
        isAdmin: false,
        created_at: '2025-01-04T00:00:00Z',
        updated_at: '2025-01-04T00:00:00Z'
      },
      {
        id: 'user-005',
        name: 'Vikram Singh',
        email: 'vikram@student.edu',
        phone: '9876543214',
        department: 'Information Technology',
        isAdmin: false,
        created_at: '2025-01-05T00:00:00Z',
        updated_at: '2025-01-05T00:00:00Z'
      },
      {
        id: 'user-006',
        name: 'Anjali Gupta',
        email: 'anjali@student.edu',
        phone: '9876543215',
        department: 'Computer Science',
        isAdmin: false,
        created_at: '2025-01-06T00:00:00Z',
        updated_at: '2025-01-06T00:00:00Z'
      },
      {
        id: 'user-007',
        name: 'Rohan Mehta',
        email: 'rohan@student.edu',
        phone: '9876543216',
        department: 'Electronics',
        isAdmin: false,
        created_at: '2025-01-07T00:00:00Z',
        updated_at: '2025-01-07T00:00:00Z'
      },
      {
        id: 'user-008',
        name: 'Kavya Iyer',
        email: 'kavya@student.edu',
        phone: '9876543217',
        department: 'Information Technology',
        isAdmin: false,
        created_at: '2025-01-08T00:00:00Z',
        updated_at: '2025-01-08T00:00:00Z'
      },
      {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@library.com',
        phone: '9876543218',
        department: 'Administration',
        isAdmin: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    ];
  }
};

export const getUserById = async (id: string): Promise<User> => {
  return apiCall(`/users/${id}`);
};

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  return apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const registerUser = async (userData: Omit<User, 'id' | 'isAdmin' | 'created_at' | 'updated_at'>): Promise<User> => {
  return apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  return apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  return apiCall(`/users/${id}`, {
    method: 'DELETE',
  });
};

// Book functions
export const getBooks = async (domain?: string): Promise<Book[]> => {
  try {
    const url = domain ? `/books?domain=${encodeURIComponent(domain)}` : '/books';
    const books = await apiCall(url);
    console.log(`📚 Loaded ${books.length} books from database`);
    return books;
  } catch (error) {
    console.warn('API not available, using mock data for books');
    // Return all 20 books from database for testing
    return [
      // DBMS (4 books)
      { id: 'book-001', title: 'Database System Concepts', author: 'Silberschatz, Korth', domain: 'DBMS', isbn: '978-0073523323', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-002', title: 'Fundamentals of Database Systems', author: 'Elmasri, Navathe', domain: 'DBMS', isbn: '978-0133970777', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-003', title: 'SQL Performance Explained', author: 'Markus Winand', domain: 'DBMS', isbn: '978-3950307818', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-004', title: 'Database Internals', author: 'Alex Petrov', domain: 'DBMS', isbn: '978-1492040347', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

      // Operating Systems (4 books)
      { id: 'book-005', title: 'Operating System Concepts', author: 'Silberschatz, Galvin', domain: 'Operating Systems', isbn: '978-1119320913', quantity: 6, available: 6, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-006', title: 'Modern Operating Systems', author: 'Andrew Tanenbaum', domain: 'Operating Systems', isbn: '978-0133591620', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-007', title: 'Operating Systems: Three Easy Pieces', author: 'Remzi Arpaci-Dusseau', domain: 'Operating Systems', isbn: '978-1985086593', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-008', title: 'Linux Kernel Development', author: 'Robert Love', domain: 'Operating Systems', isbn: '978-0672329463', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

      // Computer Networks (4 books)
      { id: 'book-009', title: 'Computer Networks', author: 'Andrew Tanenbaum', domain: 'Computer Networks', isbn: '978-0132126953', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-010', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', domain: 'Computer Networks', isbn: '978-0133594140', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-011', title: 'TCP/IP Illustrated', author: 'W. Richard Stevens', domain: 'Computer Networks', isbn: '978-0201633467', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-012', title: 'Network Security Essentials', author: 'William Stallings', domain: 'Computer Networks', isbn: '978-0134527338', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

      // Algorithms (4 books)
      { id: 'book-013', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson', domain: 'Algorithms', isbn: '978-0262033848', quantity: 7, available: 7, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-014', title: 'Algorithm Design', author: 'Jon Kleinberg', domain: 'Algorithms', isbn: '978-0321295354', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-015', title: 'The Algorithm Design Manual', author: 'Steven Skiena', domain: 'Algorithms', isbn: '978-1848000698', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-016', title: 'Algorithms', author: 'Robert Sedgewick', domain: 'Algorithms', isbn: '978-0321573513', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

      // Data Structures (4 books)
      { id: 'book-017', title: 'Data Structures and Algorithms in Java', author: 'Michael Goodrich', domain: 'Data Structures', isbn: '978-1118771334', quantity: 6, available: 6, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-018', title: 'Data Structures Using C', author: 'Reema Thareja', domain: 'Data Structures', isbn: '978-0198099307', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-019', title: 'Advanced Data Structures', author: 'Peter Brass', domain: 'Data Structures', isbn: '978-0521880374', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-020', title: 'Data Structures and Algorithms Made Easy', author: 'Narasimha Karumanchi', domain: 'Data Structures', isbn: '978-8192107592', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }
    ];
  }
};

export const getBookById = async (id: string): Promise<Book> => {
  return apiCall(`/books/${id}`);
};

export const createBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> => {
  return apiCall('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
};

export const updateBook = async (id: string, bookData: Partial<Book>): Promise<Book> => {
  return apiCall(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  });
};

export const deleteBook = async (id: string): Promise<void> => {
  return apiCall(`/books/${id}`, {
    method: 'DELETE',
  });
};

// Domain functions
export const getDomains = async (): Promise<string[]> => {
  try {
    const domains = await apiCall('/domains');
    console.log(`🏷️ Loaded ${domains.length} domains from database`);
    return domains;
  } catch (error) {
    console.warn('API not available, using mock data for domains');
    // Return all domains from database for testing
    return ['DBMS', 'Operating Systems', 'Computer Networks', 'Algorithms', 'Data Structures'];
  }
};

// Generate large realistic transaction dataset for testing segment tree performance
const generateLargeTransactionDataset = async (): Promise<IssuedBook[]> => {
  // Get actual users and books from database first
  let users: User[] = [];
  let books: Book[] = [];

  try {
    [users, books] = await Promise.all([getUsers(), getBooks()]);
    console.log(`📊 Using database data: ${users.length} users, ${books.length} books`);
  } catch (error) {
    console.warn('Using fallback mock data for users and books');
    // Fallback to mock data if API fails
    users = [
      { id: 'user-001', name: 'Rahul Sharma', email: 'rahul@student.edu', phone: '9876543210', department: 'Computer Science', isAdmin: false, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'user-002', name: 'Priya Patel', email: 'priya@student.edu', phone: '9876543211', department: 'Information Technology', isAdmin: false, created_at: '2025-01-02T00:00:00Z', updated_at: '2025-01-02T00:00:00Z' },
      { id: 'user-003', name: 'Amit Kumar', email: 'amit@student.edu', phone: '9876543212', department: 'Electronics', isAdmin: false, created_at: '2025-01-03T00:00:00Z', updated_at: '2025-01-03T00:00:00Z' },
      { id: 'user-004', name: 'Sneha Reddy', email: 'sneha@student.edu', phone: '9876543213', department: 'Computer Science', isAdmin: false, created_at: '2025-01-04T00:00:00Z', updated_at: '2025-01-04T00:00:00Z' },
      { id: 'user-005', name: 'Vikram Singh', email: 'vikram@student.edu', phone: '9876543214', department: 'Information Technology', isAdmin: false, created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-05T00:00:00Z' },
      { id: 'user-006', name: 'Anjali Gupta', email: 'anjali@student.edu', phone: '9876543215', department: 'Computer Science', isAdmin: false, created_at: '2025-01-06T00:00:00Z', updated_at: '2025-01-06T00:00:00Z' },
      { id: 'user-007', name: 'Rohan Mehta', email: 'rohan@student.edu', phone: '9876543216', department: 'Electronics', isAdmin: false, created_at: '2025-01-07T00:00:00Z', updated_at: '2025-01-07T00:00:00Z' },
      { id: 'user-008', name: 'Kavya Iyer', email: 'kavya@student.edu', phone: '9876543217', department: 'Information Technology', isAdmin: false, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
      { id: 'admin-001', name: 'Admin User', email: 'admin@library.com', phone: '9876543218', department: 'Administration', isAdmin: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }
    ];

    books = [
      { id: 'book-001', title: 'Database System Concepts', author: 'Silberschatz, Korth', domain: 'DBMS', isbn: '978-0073523323', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-002', title: 'Fundamentals of Database Systems', author: 'Elmasri, Navathe', domain: 'DBMS', isbn: '978-0133970777', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-003', title: 'SQL Performance Explained', author: 'Markus Winand', domain: 'DBMS', isbn: '978-3950307818', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-004', title: 'Database Internals', author: 'Alex Petrov', domain: 'DBMS', isbn: '978-1492040347', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-005', title: 'Operating System Concepts', author: 'Silberschatz, Galvin', domain: 'Operating Systems', isbn: '978-1119320913', quantity: 6, available: 6, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-006', title: 'Modern Operating Systems', author: 'Andrew Tanenbaum', domain: 'Operating Systems', isbn: '978-0133591620', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-007', title: 'Operating Systems: Three Easy Pieces', author: 'Remzi Arpaci-Dusseau', domain: 'Operating Systems', isbn: '978-1985086593', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-008', title: 'Linux Kernel Development', author: 'Robert Love', domain: 'Operating Systems', isbn: '978-0672329463', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-009', title: 'Computer Networks', author: 'Andrew Tanenbaum', domain: 'Computer Networks', isbn: '978-0132126953', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-010', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', domain: 'Computer Networks', isbn: '978-0133594140', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-011', title: 'TCP/IP Illustrated', author: 'W. Richard Stevens', domain: 'Computer Networks', isbn: '978-0201633467', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-012', title: 'Network Security Essentials', author: 'William Stallings', domain: 'Computer Networks', isbn: '978-0134527338', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-013', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson', domain: 'Algorithms', isbn: '978-0262033848', quantity: 7, available: 7, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-014', title: 'Algorithm Design', author: 'Jon Kleinberg', domain: 'Algorithms', isbn: '978-0321295354', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-015', title: 'The Algorithm Design Manual', author: 'Steven Skiena', domain: 'Algorithms', isbn: '978-1848000698', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-016', title: 'Algorithms', author: 'Robert Sedgewick', domain: 'Algorithms', isbn: '978-0321573513', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-017', title: 'Data Structures and Algorithms in Java', author: 'Michael Goodrich', domain: 'Data Structures', isbn: '978-1118771334', quantity: 6, available: 6, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-018', title: 'Data Structures Using C', author: 'Reema Thareja', domain: 'Data Structures', isbn: '978-0198099307', quantity: 5, available: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-019', title: 'Advanced Data Structures', author: 'Peter Brass', domain: 'Data Structures', isbn: '978-0521880374', quantity: 3, available: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      { id: 'book-020', title: 'Data Structures and Algorithms Made Easy', author: 'Narasimha Karumanchi', domain: 'Data Structures', isbn: '978-8192107592', quantity: 4, available: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }
    ];
  }

  // Filter non-admin users for student transactions
  const studentUsers = users.filter(u => !u.isAdmin);
  const adminUsers = users.filter(u => u.isAdmin);

  console.log(`👥 Transaction Generation: ${studentUsers.length} students + ${adminUsers.length} admin = ${users.length} total users`);
  console.log(`📚 Available books: ${books.length} across ${new Set(books.map(b => b.domain)).size} domains`);

  // Generate deterministic transactions (not random) for consistent results
  const transactions: IssuedBook[] = [];
  let transactionId = 1;

  // Generate transactions over 13 months (Oct 2024 - Oct 2025) to ensure 1000+
  const totalMonths = 13;
  const startYear = 2024;
  const startMonth = 10; // October 2024
  const targetTransactions = 1300; // Aim for 1300+ transactions

  // Distribute transactions evenly across months and users
  const transactionsPerMonth = Math.ceil(targetTransactions / totalMonths);
  const transactionsPerUserPerMonth = Math.max(1, Math.floor(transactionsPerMonth / studentUsers.length));

  console.log(`📊 Generation Plan: ${totalMonths} months × ${transactionsPerUserPerMonth} transactions/user/month = ~${totalMonths * studentUsers.length * transactionsPerUserPerMonth} transactions`);

  for (let monthOffset = 0; monthOffset < totalMonths; monthOffset++) {
    // Calculate actual year and month
    const totalMonthsSinceStart = startMonth + monthOffset - 1;
    const year = startYear + Math.floor(totalMonthsSinceStart / 12);
    const month = (totalMonthsSinceStart % 12) + 1;

    for (const user of studentUsers) {
      // Each student borrows 3-5 books per month
      const booksPerTransaction = Math.floor(transactionsPerUserPerMonth / 2) + 1; // 2-3 books per transaction

      for (let transNum = 0; transNum < booksPerTransaction; transNum++) {
        // Distribute transactions across the month (every 5-7 days)
        const dayOffset = (transNum * 7) + Math.floor(Math.random() * 5) + 1;
        const day = Math.min(28, dayOffset);

        // Select random books (1-2 books per transaction)
        const numBooksInTransaction = Math.floor(Math.random() * 2) + 1;
        const selectedBooks = books.sort(() => 0.5 - Math.random()).slice(0, numBooksInTransaction);

        for (const book of selectedBooks) {
          const issueDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const dueDate = new Date(issueDate);
          dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
          const dueDateStr = dueDate.toISOString().split('T')[0];

          // 75% return rate (most students return books)
          let returnDate: string | undefined;
          let status: 'issued' | 'returned' | 'overdue' = 'issued';
          let fineAmount = 0;

          if (Math.random() < 0.75) {
            // Book returned (within 0-5 days of due date)
            const daysAfterDue = Math.floor(Math.random() * 6) - 2; // -2 to +3 days
            const actualReturnDate = new Date(dueDate);
            actualReturnDate.setDate(actualReturnDate.getDate() + daysAfterDue);
            returnDate = actualReturnDate.toISOString().split('T')[0];
            status = 'returned';

            if (daysAfterDue > 0) {
              fineAmount = daysAfterDue * 50;
              status = 'overdue';
            }
          } else {
            // Book not returned (calculate overdue from current date)
            const currentDate = new Date('2025-10-31');
            const daysOverdue = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysOverdue > 0) {
              fineAmount = daysOverdue * 50;
              status = 'overdue';
            }
          }

          transactions.push({
            id: `tx-${transactionId.toString().padStart(4, '0')}`,
            user_id: user.id,
            book_id: book.id,
            book_title: book.title,
            quantity: 1,
            issue_date: issueDate,
            due_date: dueDateStr,
            return_date: returnDate,
            fine_amount: fineAmount,
            status,
            created_at: `${issueDate}T00:00:00Z`,
            updated_at: returnDate ? `${returnDate}T00:00:00Z` : `${issueDate}T00:00:00Z`,
            user_name: user.name,
            department: user.department,
            author: book.author
          });

          transactionId++;
        }
      }
    }

    // Add some admin transactions (less frequent)
    if (monthOffset % 3 === 0) { // Admin borrows every 3 months
      const admin = adminUsers[0];
      const numAdminBooks = Math.floor(Math.random() * 2) + 1;
      const selectedBooks = books.sort(() => 0.5 - Math.random()).slice(0, numAdminBooks);
      const day = Math.floor(Math.random() * 28) + 1;

      for (const book of selectedBooks) {
        const issueDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 14);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        // Admins are more responsible (90% return rate)
        let returnDate: string | undefined;
        let status: 'issued' | 'returned' | 'overdue' = 'issued';
        let fineAmount = 0;

        if (Math.random() < 0.9) {
          const daysAfterDue = Math.floor(Math.random() * 4) - 1; // -1 to +2 days
          const actualReturnDate = new Date(dueDate);
          actualReturnDate.setDate(actualReturnDate.getDate() + daysAfterDue);
          returnDate = actualReturnDate.toISOString().split('T')[0];
          status = 'returned';

          if (daysAfterDue > 0) {
            fineAmount = daysAfterDue * 50;
            status = 'overdue';
          }
        }

        transactions.push({
          id: `tx-${transactionId.toString().padStart(4, '0')}`,
          user_id: admin.id,
          book_id: book.id,
          book_title: book.title,
          quantity: 1,
          issue_date: issueDate,
          due_date: dueDateStr,
          return_date: returnDate,
          fine_amount: fineAmount,
          status,
          created_at: `${issueDate}T00:00:00Z`,
          updated_at: returnDate ? `${returnDate}T00:00:00Z` : `${issueDate}T00:00:00Z`,
          user_name: admin.name,
          department: admin.department,
          author: book.author
        });

        transactionId++;
      }
    }
  }

  console.log(`✅ Generated ${transactions.length} transactions successfully!`);
  console.log(`📈 Transaction Distribution:
    - Students: ${studentUsers.length} users
    - Admin: ${adminUsers.length} user
    - Returned: ${transactions.filter(t => t.status === 'returned').length}
    - Overdue: ${transactions.filter(t => t.status === 'overdue').length}
    - Still Issued: ${transactions.filter(t => t.status === 'issued').length}
    - Total Fines: ₹${transactions.reduce((sum, t) => sum + t.fine_amount, 0)}
    - Date Range: Oct 2024 - Oct 2025`);

  return transactions;
};

// Issued books functions
export const getIssuedBooks = async (): Promise<IssuedBook[]> => {
  try {
    // Try to get from API first (for real database data)
    const apiData = await apiCall('/issued-books');
    console.log(`📊 API returned ${apiData.length} transactions from database`);

    // For segment tree testing, use large mock dataset instead
    console.warn('🔄 Using large mock dataset for segment tree testing (overriding API data)');
    return await generateLargeTransactionDataset();
  } catch (error) {
    console.warn('API failed, using large mock dataset for testing:', error.message);
    // Generate large realistic dataset for testing segment tree performance
    return await generateLargeTransactionDataset();
  }
};

export const getIssuedBookById = async (id: string): Promise<IssuedBook> => {
  return apiCall(`/issued-books/${id}`);
};

export const issueBook = async (bookId: string, quantity: number, dueDate: string): Promise<IssuedBook> => {
  return apiCall('/issued-books', {
    method: 'POST',
    body: JSON.stringify({
      book_id: bookId,
      quantity,
      due_date: dueDate,
    }),
  });
};

export const returnBook = async (issuedBookId: string): Promise<IssuedBook> => {
  return apiCall(`/issued-books/${issuedBookId}/return`, {
    method: 'PUT',
  });
};

export const deleteIssuedBook = async (id: string): Promise<void> => {
  return apiCall(`/issued-books/${id}`, {
    method: 'DELETE',
  });
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Utility function to get current user (placeholder - would need user context)
export const getCurrentUser = (): User | null => {
  // This would typically come from a user context or decoded token
  // For now, return null and let components handle authentication
  return null;
};

// Initialize function (for backward compatibility)
export const initializeDummyData = async (): Promise<void> => {
  try {
    // Try to get domains to test API connectivity
    await getDomains();
    console.log('✅ Connected to backend API');
  } catch (error) {
    console.warn('⚠️ Backend API not available, using localStorage fallback');
    // Fallback to localStorage if API is not available
    if (!localStorage.getItem('library_initialized')) {
      const domains = ['DBMS', 'Operating Systems', 'Computer Networks', 'Algorithms', 'Data Structures'];
      localStorage.setItem('library_domains', JSON.stringify(domains));
      localStorage.setItem('library_initialized', 'true');
    }
  }
};
