// Configuration for API endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const config = {
  API_BASE_URL,
  endpoints: {
    login: `${API_BASE_URL}/auth/login`,
    feedback: `${API_BASE_URL}/feedback`,
    feedbackRequests: `${API_BASE_URL}/feedback-request`,
    comments: `${API_BASE_URL}/feedback`,
    dashboard: `${API_BASE_URL}/dashboard`,
    team: `${API_BASE_URL}/team`,
  }
}; 