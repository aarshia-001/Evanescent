import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './SignUpLogin.css';
import ErrorModal from './ErrorModal';
import api from './api';  // your axios instance

const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from?.pathname || '/writeups';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setErrorMessage('Please enter both email and password.');
      setShowError(true);
      return;
    }

    try {
      const response = await api.post('/api/login', form);
      
      // Assume your backend returns: { accessToken: '...' }
      const { accessToken } = response.data;

      // ✅ Store token in localStorage with the exact key your api.ts expects


      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem('userEmail', form.email);


      window.dispatchEvent(new Event("storage"));  // <-- add this line!
      navigate(redirectTo, { replace: true });

    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed.';
      setErrorMessage(message);
      setShowError(true);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Welcome back to <span>Evanescent</span></h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="auth-input"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            className="auth-input"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="submit" className="auth-button">Login</button>
        </form>
        <div className="auth-link">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>

      <ErrorModal
        show={showError}
        onHide={() => setShowError(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default LoginPage;
