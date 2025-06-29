# Lightweight Feedback System

A modern, secure feedback management system for internal team communication between managers and employees. Built with Python FastAPI backend and React frontend.

## 🌟 Features

### ✅ Core Features (MVP)
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

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (for backend deployment)

### Backend Setup

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

### Frontend Setup

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

### Docker Setup (Backend)

1. **Build the Docker image:**
   ```bash
   cd backend
   docker build -t feedback-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 feedback-backend
   ```

## 👥 Test Users

### Manager Account
- **Email**: manager@company.com
- **Password**: manager123
- **Role**: Manager

### Employee Accounts
- **Email**: employee1@company.com
- **Password**: employee123
- **Role**: Employee

- **Email**: employee2@company.com
- **Password**: employee123
- **Role**: Employee

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
- `POST /feedback/{feedback_id}/comment` - Add comment
- `GET /feedback/{feedback_id}/comments` - Get comments

### Dashboard
- `GET /dashboard/manager` - Manager dashboard stats
- `GET /team` - Get team members (Manager only)

## 🏗️ Design Decisions

### Database Design
- **Users Table**: Stores user information with role-based access
- **Feedback Table**: Core feedback data with manager-employee relationships
- **Feedback Requests**: Employee-initiated feedback requests
- **Comments**: Threaded comments on feedback
- **Foreign Keys**: Proper relationships ensuring data integrity

### Security Architecture
- **JWT Authentication**: Stateless authentication with role-based tokens
- **Role-Based Access Control**: Managers can only access their team's data
- **Input Validation**: Pydantic schemas for request validation
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries

### Frontend Architecture
- **Component-Based**: Reusable Material-UI components
- **Context API**: Global state management for authentication
- **Protected Routes**: Role-based route protection
- **Responsive Design**: Mobile-friendly interface

### API Design
- **RESTful**: Standard HTTP methods and status codes
- **Consistent Response Format**: Standardized API responses
- **Error Handling**: Proper HTTP status codes and error messages
- **Documentation**: Auto-generated API docs with FastAPI

## 🧪 Testing the Application

1. **Start both backend and frontend servers**
2. **Login as Manager:**
   - View team overview and statistics
   - Submit feedback for team members
   - Edit and delete existing feedback
   - View and fulfill feedback requests

3. **Login as Employee:**
   - View received feedback
   - Acknowledge feedback
   - Request feedback from manager
   - Add comments to feedback

## 📁 Project Structure

```
Lightweight-feedback-system/
├── backend/
│   ├── alembic/           # Database migrations
│   ├── main.py           # FastAPI application
│   ├── models.py         # SQLAlchemy models
│   ├── routers.py        # API routes
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # Authentication logic
│   ├── deps.py           # Dependencies
│   ├── database.py       # Database configuration
│   ├── seed.py           # Database seeding
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend containerization
├── frontend/
│   ├── src/
│   │   ├── pages/        # React components
│   │   ├── utils/        # Utility functions
│   │   ├── AuthContext.js # Authentication context
│   │   └── App.js        # Main application
│   ├── package.json      # Node dependencies
│   └── public/           # Static assets
└── README.md
```

## 🔧 Development

### Adding New Features
1. **Backend**: Add models, schemas, and routes in respective files
2. **Frontend**: Create new components in `src/pages/`
3. **Database**: Create new migrations with Alembic

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ES6+ features and consistent formatting
- **Components**: Use functional components with hooks

## 🚀 Deployment

### Backend Deployment
The backend includes a Dockerfile for easy deployment:

```bash
docker build -t feedback-backend .
docker run -p 8000:8000 feedback-backend
```

### Frontend Deployment
The frontend can be deployed to any static hosting service (Vercel, Netlify, etc.):

```bash
npm run build
```

## 🤝 Contributing

This is a demonstration project for a feedback system. The codebase is designed to be clean, modular, and easily extensible.

## 📝 License

This project is created for demonstration purposes.

## 🤖 AI Assistance Disclosure

This project was developed with AI assistance for the following specific purposes:

### AI-Assisted Components:
- **Code Generation**: Initial boilerplate code for FastAPI routes and React components
- **Deployment Configuration**: Render.com deployment setup and environment configuration
- **Documentation**: Help with README structure and API documentation
- **Bug Fixes**: Assistance with debugging specific issues during development

### Independent Work:
- **Architecture Design**: All system design decisions and database schema
- **Feature Implementation**: Core business logic and user workflows
- **UI/UX Design**: Visual design choices and user experience decisions
- **Security Implementation**: Authentication and authorization logic
- **Testing Strategy**: Test cases and validation approaches

### Learning Outcomes:
The development process involved:
- Understanding and modifying AI-generated code
- Implementing custom business logic
- Debugging and optimizing performance
- Deploying and configuring production environments
- Comprehensive testing and validation

All code has been thoroughly reviewed, understood, and customized to meet the specific requirements of this feedback system.

---

**Note**: This project demonstrates the effective use of AI as a development tool while maintaining full understanding and control over the implementation.
