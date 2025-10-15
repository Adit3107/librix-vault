@echo off
echo 🚀 Setting up Library Management System...

echo 📋 Checking if MySQL is running...
net start | find "MySQL" >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL is not running. Please start MySQL first.
    echo You can start it manually or install MySQL if not already installed.
    pause
    exit /b 1
)

echo 🗄️ Setting up database...
mysql -u root -p < database_setup.sql

if %errorlevel% neq 0 (
    echo ❌ Database setup failed. Please check your MySQL credentials.
    pause
    exit /b 1
)

echo ✅ Database setup completed

echo.
echo 📚 Starting servers...

echo 🔧 Starting backend server...
start /B cmd /k "cd server && npm install && npm run dev"

timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend...
start /B cmd /k "npm run dev"

echo.
echo 🎉 Library Management System is now running!
echo.
echo 📖 Frontend: http://localhost:8080
echo 🔗 Backend API: http://localhost:5000
echo.
echo 📋 Default Credentials:
echo    Admin: admin@library.com / admin123
echo    Student: rahul@student.edu / password123
echo.
echo 🛑 To stop servers, close the command windows

pause
