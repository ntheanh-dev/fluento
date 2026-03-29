# Luyenviet - Docker Setup

## 🚀 Quick Start

### 1. Setup Environment Variables
```bash
# Copy the environment template
cp environment.example .env

# Edit the .env file with your actual values
nano .env
```

### 2. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MySQL**: localhost:3307

## 📋 Prerequisites

### Required Environment Variables
You need to set up these services and get API keys:

#### Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/oauth/authenticate`
6. Copy Client ID and Client Secret to `.env`

#### Gemini AI Setup
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Copy the API key to `.env`

## 🛠️ Development Commands

### Docker Commands
```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in container
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -p
```

### Database Management
```bash
# Connect to MySQL
docker-compose exec mysql mysql -u root -p

# Backup database
docker-compose exec mysql mysqldump -u root -p writing-app > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p writing-app < backup.sql
```

## 🔧 Configuration

### Port Configuration
- **Frontend**: 3000 (configurable via `FRONTEND_PORT`)
- **Backend**: 8080 (configurable via `BACKEND_PORT`)
- **MySQL**: 3307 (configurable via `MYSQL_PORT`)

### Database Configuration
- **Database**: writing-app
- **Username**: app_user
- **Password**: Admin@123 (change in production!)

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8080
lsof -i :3307

# Kill the process or change ports in .env
```

#### 2. Database Connection Issues
```bash
# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

#### 3. Frontend Build Issues
```bash
# Clear node_modules and rebuild
docker-compose build --no-cache frontend
```

#### 4. Backend Build Issues
```bash
# Clear Maven cache and rebuild
docker-compose build --no-cache backend
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Check specific service logs
docker-compose logs backend | tail -20
```

## 📁 Project Structure
```
luyenviet/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   └── src/
├── docker-compose.yml
├── environment.example
└── .env (create this from environment.example)
```

## 🔒 Security Notes

1. **Never commit `.env` file** - it contains sensitive information
2. **Change default passwords** in production
3. **Use HTTPS** in production
4. **Rotate API keys** regularly
5. **Keep Docker images updated**

## 🚀 Production Deployment

For production deployment, consider:
- Using Docker Swarm or Kubernetes
- Setting up reverse proxy (Nginx/Traefik)
- Using managed database services
- Implementing proper logging and monitoring
- Setting up CI/CD pipelines
