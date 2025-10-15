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
  return apiCall('/users');
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
  const url = domain ? `/books?domain=${encodeURIComponent(domain)}` : '/books';
  return apiCall(url);
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
  return apiCall('/domains');
};

// Issued books functions
export const getIssuedBooks = async (): Promise<IssuedBook[]> => {
  return apiCall('/issued-books');
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
  } catch (error) {
    console.warn('API not available, using fallback data');
    // Fallback to localStorage if API is not available
    if (!localStorage.getItem('library_initialized')) {
      const domains = ['DBMS', 'Operating Systems', 'Computer Networks', 'Algorithms', 'Data Structures'];
      localStorage.setItem('library_domains', JSON.stringify(domains));
      localStorage.setItem('library_initialized', 'true');
    }
  }
};
