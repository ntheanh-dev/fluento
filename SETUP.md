# Fluento Setup Guide

## 🚀 Quick Start

### 1. Create Environment File
```bash
cp env.template .env
```

### 2. Edit .env File
```bash
nano .env
```

Fill in these values (all are required):
```bash
# Required - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Required - Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Required - Database configuration
MYSQL_ROOT_PASSWORD=Admin@123
MYSQL_DATABASE=fluento
MYSQL_USER=app_user
MYSQL_PASSWORD=Admin@123
MYSQL_PORT=3307

# Required - Spring Boot database configuration
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/fluento?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=utf8mb4
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=Admin@123

# Required - Application configuration
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/authenticate
FRONTEND_PORT=3000
BACKEND_PORT=8080
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MySQL**: localhost:3307

## 📁 File Structure

```
fluento/
├── .env                    ← Single environment file
├── docker-compose.yml     ← Docker configuration
├── env.template          ← Template for .env
└── backend/
    └── src/main/resources/
        ├── application.yml ← Spring Boot config
        └── db/migration/   ← Database schema
```

## 🔧 How It Works

1. **Single .env file** provides all environment variables
2. **Docker Compose** reads .env and passes variables to containers
3. **Backend** uses environment variables from Docker
4. **Frontend** gets variables through Docker build args
5. **Database** is automatically initialized with migration scripts

## ✅ That's It!

No multiple .env files, no complex configuration - just one file and `docker-compose up -d`!
