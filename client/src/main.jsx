import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'

// Dynamically point to backend: uses VITE_API_URL, or defaults to live Render backend in production, or localhost in development
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://hunar-bharat-ka.onrender.com');
axios.defaults.baseURL = API_BASE;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
