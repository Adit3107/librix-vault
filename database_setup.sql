# MySQL Database Setup Script for Library Management System

# This script will create the database and user for the library management system

# Connect to MySQL as root (you may need to adjust these credentials)
# mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS library_management;

# Create user (adjust password as needed)
CREATE USER IF NOT EXISTS 'library_user'@'localhost' IDENTIFIED BY 'library_password';

# Grant privileges
GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';

# Flush privileges
FLUSH PRIVILEGES;

# Exit MySQL
exit;

# Alternative: If you want to use the default root user, you can skip user creation
# and just ensure the database exists:
#
# CREATE DATABASE IF NOT EXISTS library_management;
