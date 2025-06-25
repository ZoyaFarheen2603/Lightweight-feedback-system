# Lightweight Feedback System – Frontend

This is the React frontend for the Lightweight Feedback System.

## 🚀 Setup & Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   The app will run at [http://localhost:3000](http://localhost:3000).

## 🔗 Backend Connection
- The frontend expects the backend API to be running at `http://localhost:8000` by default.
- You can change the API base URL in the code if needed.

## 👤 Test Users
- **Manager:**
  - Email: `manager@example.com`
  - Password: `managerpass`
- **Employee 1:**
  - Email: `bob@example.com`
  - Password: `bobpass`
- **Employee 2:**
  - Email: `carol@example.com`
  - Password: `carolpass`

## 🛠️ Stack & Design
- **Framework:** React (with hooks)
- **Routing:** react-router-dom
- **API Calls:** axios
- **State:** Context API for authentication
- **UI:** Simple, clean, and responsive (custom CSS, easily upgradable to a UI library)

## 📦 Features
- Manager and Employee dashboards
- Role-based authentication
- Feedback submission, editing, and acknowledgment
- Team overview and sentiment trends for managers

## ✨ Customization & Extensions
- You can easily add more features (tags, comments, notifications, etc.)
- For UI polish, consider integrating a UI library like Material-UI or Ant Design.

---

For backend setup and more details, see the main project README or the `backend/README.md`. 