import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/AdminLogin.css';
import { UserService } from '../../services/userService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
        await UserService.sendPasswordResetEmail(email);
      setSuccessMsg('Please check your email for instructions to reset your password.');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img 
            src="/9774b5ef3cf7c7e668645381063e41715811967f.png" 
            alt="Cadooga Logo" 
            className="logo" 
          />
        </div>

        <form onSubmit={handleForgotPassword}>
          <div className="email-input">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}

          <div className="forgot-password-container1">
            <Link to="/admin/login" className="forgot-password" >Back to Login</Link>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            <span className="login-button-text">
              {isSubmitting ? 'Submitting...' : 'Send Reset Link'}
            </span>
          </button>
        </form>

        <div className="social-icons">
          <Link href="#" className="social-icon">f</Link>
          <Link href="#" className="social-icon">t</Link>
          <Link href="#" className="social-icon">in</Link>
          <Link href="#" className="social-icon">@</Link>
          <Link href="#" className="social-icon">p</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
