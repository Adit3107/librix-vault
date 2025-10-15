#!/bin/bash

# Library Management System - Setup and Run Script

echo "🚀 Setting up Library Management System..."

# Check if MySQL is running
echo "📋 Checking MySQL status..."
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL is not running. Please start MySQL first:"
    echo "   sudo systemctl start mysql  # On Linux"
    echo "   brew services start mysql  # On macOS"
    exit 1
fi

# Set up database
echo "🗄️  Setting up database..."
mysql -u root -p < database_setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed"
else
    echo "❌ Database setup failed. Please check your MySQL credentials."
    exit 1
fi

echo ""
echo "📚 Starting servers..."

# Start backend server in background
echo "🔧 Starting backend server..."
cd server
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Library Management System is now running!"
echo ""
echo "📖 Frontend: http://localhost:8080"
echo "🔗 Backend API: http://localhost:5000"
echo ""
echo "📋 Default Credentials:"
echo "   Admin: admin@library.com / admin123"
echo "   Student: rahul@student.edu / password123"
echo ""
echo "🛑 To stop servers, press Ctrl+C"

# Wait for user to stop
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
