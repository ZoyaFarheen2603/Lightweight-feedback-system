# Docker Setup Guide

This guide explains how to run the Lightweight Feedback System using Docker.

## 🐳 Quick Start with Docker Compose

The easiest way to run the entire application is using Docker Compose:

### 1. Build and Start All Services

```bash
# Build and start both backend and frontend
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 3. Stop the Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (database will be reset)
docker-compose down -v
```

## 🔧 Individual Container Setup

### Backend Only

```bash
# Build the backend image
cd backend
docker build -t feedback-backend .

# Run the backend container
docker run -p 8000:8000 -v $(pwd)/feedback.db:/app/feedback.db feedback-backend
```

### Frontend Only

```bash
# Build the frontend image
cd frontend
docker build -t feedback-frontend .

# Run the frontend container
docker run -p 3000:80 feedback-frontend
```

## 📋 Docker Commands Reference

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Execute Commands in Containers
```bash
# Access backend container shell
docker-compose exec backend bash

# Access frontend container shell
docker-compose exec frontend sh

# Run database migrations manually
docker-compose exec backend alembic upgrade head

# Seed database manually
docker-compose exec backend python seed.py
```

### Rebuild Specific Service
```bash
# Rebuild only backend
docker-compose build backend

# Rebuild only frontend
docker-compose build frontend

# Rebuild and restart specific service
docker-compose up --build backend
```

## 🗄️ Database Persistence

The SQLite database is persisted using Docker volumes:

- **Database file**: `./backend/feedback.db`
- **Volume mapping**: The database file is mounted to `/app/feedback.db` in the container
- **Persistence**: Data persists between container restarts

### Reset Database
```bash
# Stop containers
docker-compose down

# Remove database file
rm backend/feedback.db

# Restart containers (will recreate database)
docker-compose up --build
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   lsof -i :3000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER backend/feedback.db
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs backend
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Database Connection Issues**
   ```bash
   # Check if database file exists
   ls -la backend/feedback.db
   
   # Recreate database
   docker-compose exec backend python seed.py
   ```

### Health Checks

The backend includes health checks to ensure the service is running properly:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8000/
```

## 🚀 Production Deployment

### Environment Variables

For production, you should set environment variables:

```bash
# Create .env file
cat > .env << EOF
DATABASE_URL=sqlite:///./feedback.db
SECRET_KEY=your-secret-key-here
DEBUG=false
EOF
```

### Docker Compose Production

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Security Considerations

1. **Change default passwords** in `seed.py`
2. **Use strong SECRET_KEY** for JWT tokens
3. **Enable HTTPS** in production
4. **Use external database** (PostgreSQL/MySQL) for production
5. **Set up proper logging** and monitoring

## 📊 Monitoring

### Container Resources
```bash
# Monitor resource usage
docker stats

# Monitor specific container
docker stats feedback-backend feedback-frontend
```

### Application Logs
```bash
# Real-time log monitoring
docker-compose logs -f --tail=100
```

## 🔄 Development Workflow

### Hot Reload (Development)

For development with hot reload:

```bash
# Backend with hot reload
docker-compose -f docker-compose.dev.yml up backend

# Frontend with hot reload
docker-compose -f docker-compose.dev.yml up frontend
```

### Testing in Containers

```bash
# Run backend tests
docker-compose exec backend python -m pytest

# Run frontend tests
docker-compose exec frontend npm test
```

## 📝 Notes

- The backend container runs as a non-root user for security
- Health checks are configured for automatic container restart
- Database migrations run automatically on container startup
- The frontend uses nginx for serving static files
- All containers are connected via a custom Docker network

For more information, see the main [README.md](README.md) file. 