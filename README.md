## STC Project
-- npm i

-- 1st terminal - npm run dev

-- 2nd Terminal - cd server
                  npm run dev

--env(root) -> VITE_API_URL=http://localhost:5000/api

--env(server) -> 
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_management
DB_USER=root
DB_PASSWORD=Kazutora@07

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:8080

