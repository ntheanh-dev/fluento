# Fluento - Language Learning Application

## 🚀 **Quick Start**

### **Option 1: Docker Hub Images (Recommended)**
```bash
# Clone repository
git clone <your-repo-url>
cd fluento

# Setup environment
cp env.template .env
# Edit .env with your GEMINI_API_KEY

# Run with Docker Hub images
docker-compose up -d
```

### **Option 2: Local Build**
```bash
# Clone repository
git clone <your-repo-url>
cd fluento

# Setup environment
cp env.template .env
# Edit .env with your GEMINI_API_KEY

# Build and run from source
docker-compose -f docker-compose.local.yml up -d --build
```

## 📁 **Project Structure**

```
fluento/
├── docker-compose.yml              # Default (Docker Hub)
├── docker-compose.hub.yml          # Explicit Docker Hub
├── docker-compose.local.yml        # Local Build
├── env.template                    # Environment template
├── SETUP.md                       # Basic setup guide
├── DOCKER_COMPOSE_GUIDE.md        # Docker Compose guide
├── DOCKER_HUB_SETUP.md            # Docker Hub setup
├── backend/
│   ├── Dockerfile                 # Backend Dockerfile
│   ├── .dockerignore              # Backend ignore
│   └── src/                       # Spring Boot source
├── frontend/
│   ├── Dockerfile                 # Frontend Dockerfile
│   ├── nginx.conf                 # Nginx config
│   └── src/                       # React source
└── mysql/
    ├── Dockerfile                 # MySQL Dockerfile
    └── 001_init_fluento_schema.sql # Database schema
```

## 🐳 **Docker Compose Files**

| File | Purpose | Usage |
|------|---------|-------|
| `docker-compose.yml` | **Default** | `docker-compose up -d` |
| `docker-compose.hub.yml` | **Docker Hub** | `docker-compose -f docker-compose.hub.yml up -d` |
| `docker-compose.local.yml` | **Local Build** | `docker-compose -f docker-compose.local.yml up -d --build` |

## 🔧 **Services**

| Service | Description | Port |
|---------|-------------|------|
| **Backend** | Spring Boot API | 8080 |
| **Frontend** | React Application | 3000 |
| **MySQL** | Database | 3307 |

## 📚 **Documentation**

- **[SETUP.md](SETUP.md)** - Basic setup guide
- **[DOCKER_COMPOSE_GUIDE.md](DOCKER_COMPOSE_GUIDE.md)** - Docker Compose usage
- **[DOCKER_HUB_SETUP.md](DOCKER_HUB_SETUP.md)** - Docker Hub setup

## 🌐 **Access URLs**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **MySQL:** localhost:3307

## 🔑 **Required Environment Variables**

```bash
# Required - Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Database configuration
MYSQL_ROOT_PASSWORD=Admin@123
MYSQL_DATABASE=fluento
MYSQL_USER=app_user
MYSQL_PASSWORD=Admin@123
MYSQL_PORT=3307

# Spring Boot database configuration
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/fluento?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=Admin@123

# Application configuration
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/authenticate
FRONTEND_PORT=3000
BACKEND_PORT=8080
```

## 🚀 **Docker Hub Images**

| Image | Version | Description |
|-------|---------|-------------|
| `theanhn28/fluento-backend` | `1.0` | Spring Boot API |
| `theanhn28/fluento-frontend` | `1.0` | React Frontend |
| `theanhn28/fluento-mysql` | `1.0` | MySQL with schema |

## 🛠️ **Development**

### **Local Development:**
```bash
# Use local build for development
docker-compose -f docker-compose.local.yml up -d --build

# Make code changes
# Rebuild specific service
docker-compose -f docker-compose.local.yml up -d --build backend
```

### **Production Deployment:**
```bash
# Use Docker Hub images for production
docker-compose up -d
```

## 🔄 **Common Commands**

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Restart services
docker-compose restart

# Update to latest images
docker-compose pull
docker-compose up -d
```

## 📋 **Troubleshooting**

### **Check container status:**
```bash
docker-compose ps
```

### **View logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

### **Clean up:**
```bash
docker-compose down -v
docker image prune -f
```

---

**🎉 Welcome to Fluento! Choose your preferred setup method and start learning!**
