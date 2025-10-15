# Library Management System - Full Stack

A full-stack library management system with React frontend, Node.js/Express backend, and MySQL database.

## Features

- **User Management**: Admin and regular user accounts
- **Book Management**: Add, update, delete books with domain categorization
- **Book Issuance**: Issue and return books with due date tracking
- **Fine Calculation**: Automatic fine calculation for overdue books
- **Responsive UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui (UI components)
- React Router (routing)
- React Query (data fetching)

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- bcrypt (password hashing)
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone and Install Frontend Dependencies

```bash
cd Jinesha_DBMS_Project
npm install
```

### 2. Set Up MySQL Database

1. **Start MySQL server** (if not already running)

2. **Run the database setup script**:
   ```bash
   mysql -u root -p < database_setup.sql
   ```

3. **Update database credentials** in `server/.env` if needed:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=library_management
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

### 3. Install and Start Backend

```bash
cd server
npm install
npm run dev
```

The backend will start on `http://localhost:5000` and automatically:
- Test database connection
- Create necessary tables
- Populate sample data (users, books, domains)

### 4. Start Frontend

In a new terminal:
```bash
# From the root directory
npm run dev
```

The frontend will start on `http://localhost:8080`

## Default Credentials

### Admin Login
- **Email**: `admin@library.com`
- **Password**: `admin123`

### Student Login
- **Email**: `rahul@student.edu`
- **Password**: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Books (Public read, Admin write)
- `GET /api/books` - Get all books (optional domain filter)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)

### Issued Books (Users see own, Admin sees all)
- `GET /api/issued-books` - Get issued books
- `GET /api/issued-books/:id` - Get issued book by ID
- `POST /api/issued-books` - Issue a book
- `PUT /api/issued-books/:id/return` - Return a book
- `DELETE /api/issued-books/:id` - Delete issued book record (Admin)

### Domains
- `GET /api/domains` - Get all domains

## Development

### Project Structure

```
Jinesha_DBMS_Project/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API calls
│   └── contexts/          # React contexts
├── server/                # Backend server
│   ├── routes/           # API route handlers
│   ├── middleware/       # Authentication middleware
│   ├── config/           # Database configuration
│   └── app.js           # Main server file
├── database_setup.sql     # MySQL setup script
└── README.md
```

### Environment Variables

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_management
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

## Deployment

### Frontend
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend
```bash
cd server
npm run start
```

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Check database credentials in `server/.env`
3. Verify the database exists and tables are created

### API Connection Issues
1. Ensure backend is running on port 5000
2. Check that `VITE_API_URL` is correct in frontend `.env`
3. Verify CORS is properly configured

### Authentication Issues
1. Clear localStorage if experiencing token issues
2. Ensure JWT_SECRET is consistent between server restarts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.
