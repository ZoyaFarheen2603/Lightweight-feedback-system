# Lightweight Feedback System

## 🚀 Live Demo

- **Frontend:** [https://lightweight-feedback-system.onrender.com](https://lightweight-feedback-system.onrender.com)
- **Backend:** [https://feedback-backend-0sji.onrender.com](https://feedback-backend-0sji.onrender.com)

## 🎯 Project Overview

A modern, secure feedback management system for internal team communication between managers and employees. Built with Python FastAPI backend and React frontend.

## ✨ Key Features

### Core Features (MVP)
- **Authentication & Roles**: Manager and Employee roles with JWT authentication
- **Feedback Submission**: Managers can submit structured feedback with strengths, areas to improve, and sentiment
- **Feedback Visibility**: Role-based access control - employees see only their feedback
- **Dashboard**: Team overview for managers, feedback timeline for employees
- **Feedback Management**: Edit, delete, and acknowledge feedback
- **Feedback Requests**: Employees can request feedback from managers
- **Comments**: Add comments to feedback with markdown support
- **Tags**: Categorize feedback with tags

### 💡 Bonus Features
- **Real-time Notifications**: In-app notifications using notistack
- **Modern UI**: Material-UI components with responsive design
- **Sentiment Tracking**: Visual sentiment trends and analytics
- **Professional Dialogs**: Custom confirmation dialogs (no browser popups)

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **Database Migrations**: Alembic
- **Containerization**: Docker

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: Notistack
- **Routing**: React Router

### Development Tools
- **Package Manager**: npm (frontend), pip (backend)
- **Database**: SQLite (development)
- **API Documentation**: FastAPI auto-generated docs

## 🚀 Quick Start & Deployment

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (optional, for backend deployment)

### Local Development

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Seed the database with test data:**
   ```bash
   python seed.py
   ```

5. **Start the backend server:**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Docker Development

1. **Build the Docker image:**
   ```bash
   cd backend
   docker build -t feedback-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 feedback-backend
   ```

### Docker Development

```bash
docker-compose up --build
```

### Render Deployment

1. Push code to GitHub/GitLab
2. Go to [render.com](https://render.com)
3. Create account and add payment method
4. Click "New +" → "Blueprint"
5. Connect repository
6. Click "Apply" to deploy

**Deployment Time:** ~5-10 minutes

## 👥 Test Users

### Manager Account
- **Name:** Alice Manager
- **Email:** manager@example.com
- **Password:** managerpass
- **Role:** Manager

### Employee Accounts
- **Name:** Bob Employee
- **Email:** bob@example.com
- **Password:** bobpass
- **Role:** Employee
- **Manager:** Alice Manager (manager@example.com)

- **Name:** Carol Employee
- **Email:** carol@example.com
- **Password:** carolpass
- **Role:** Employee
- **Manager:** Alice Manager (manager@example.com)

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - User login

### Feedback
- `POST /feedback` - Create feedback (Manager only)
- `GET /feedback/{employee_id}` - Get feedback for employee
- `PUT /feedback/{feedback_id}` - Update feedback (Manager only)
- `DELETE /feedback/{feedback_id}` - Delete feedback (Manager only)
- `POST /feedback/{feedback_id}/acknowledge` - Acknowledge feedback (Employee only)

### Feedback Requests
- `POST /feedback-request` - Request feedback (Employee only)
- `GET /feedback-requests` - Get feedback requests (Manager only)
- `POST /feedback-request/{request_id}/fulfill` - Mark request fulfilled (Manager only)

### Comments
- `POST /feedback/{feedback_id}/comment` - Add a comment to a feedback item (Markdown supported)
- `GET /feedback/{feedback_id}/comments` - Get all comments for a feedback item

### Dashboard
- `GET /dashboard/manager` - Manager dashboard stats
- `GET /team` - Get team members (Manager only)

## 🏗️ Architecture Highlights

### Security
- JWT authentication with role-based access
- Environment variable configuration
- Input validation with Pydantic schemas
- SQL injection protection via SQLAlchemy ORM

### Frontend
- Responsive Material-UI design
- Context API for state management
- Protected routes with role-based access
- Error boundaries and loading states

### Backend
- RESTful API design
- Database migrations with Alembic
- CORS configuration for cross-origin requests
- Comprehensive error handling

## 📁 Project Structure

```
Lightweight-feedback-system/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app entry point
│   ├── models.py           # SQLAlchemy models
│   ├── routers.py          # API routes
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database configuration
│   ├── schemas.py          # Pydantic schemas
│   ├── requirements.txt    # Python dependencies
│   └── alembic/            # Database migrations
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/          # React components
│   │   ├── AuthContext.js  # Authentication context
│   │   ├── config.js       # API configuration
│   │   └── App.js          # Main app component
│   ├── package.json        # Node.js dependencies
│   └── public/             # Static assets
├── render.yaml             # Render deployment config
├── docker-compose.yml      # Local development
└── DEPLOYMENT.md           # Deployment guide
```

## 🔧 Development & Code Style

- **Python:** Follows PEP 8 guidelines
- **JavaScript:** Uses ES6+ features and consistent formatting
- **Components:** Functional components with hooks
- **Extensibility:** Modular and clean codebase

## 🔐 Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable management
- SQL injection protection

## 🎨 UI/UX Features

- Modern Material-UI design
- Responsive layout
- Loading states and error handling
- Toast notifications
- Confirmation dialogs
- Markdown support for comments

## 📈 Future Enhancements

- Real-time notifications (WebSocket)
- File uploads for feedback
- Advanced analytics dashboard
- Email notifications
- Mobile app (React Native)
- Multi-tenant support

## 🤖 AI Assistance Disclosure

> **Note:**
> AI assistance was used only for a few specific purposes, such as code generation for boilerplate, deployment configuration, and some documentation help. All core logic, architecture, feature implementation, and design decisions were done independently.