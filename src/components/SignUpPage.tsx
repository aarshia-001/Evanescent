import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUpLogin.css';
import ErrorModal from './ErrorModal';
import { signup } from '../api/auth';  // <-- we import the API function

const SignUpPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password } = form;

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      setShowError(true);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      setShowError(true);
      return;
    }

    try {
      await signup(name, email, password);  // <-- calling our API function
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      const message = err.message || 'Signup failed. Please try again.';
      setErrorMessage(message);
      setShowError(true);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Join <span>Evanescent</span></h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            className="auth-input"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            className="auth-input"
            placeholder="Unique-Username with @"
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
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
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

export default SignUpPage;
