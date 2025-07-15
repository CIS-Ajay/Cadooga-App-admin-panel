import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/AdminLogin.css';
import {Eye, EyeOff} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // Redirect if already logged in - CHANGED TO /admin/home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Navigate is handled by the useEffect that watches isAuthenticated
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
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
        
        <form onSubmit={handleSubmit}>
          <div className="email-input">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              disabled={isLoading}
              required
            />
            <span 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {
                showPassword ? 
                <Eye className="nav-icon-login" /> : 
                <EyeOff className="nav-icon-login" />
              }
            </span>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="forgot-password-container">
            <p className="help-text">Need help logging in?</p>
            <Link to="/forgot-password" className="forgot-password" >Forgot My Password</Link>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            <span className="login-button-text">
              {isLoading ? 'Logging in...' : 'Login'}
            </span>
          </button>
        </form>
        
        <div className="social-icons">
          <Link to="#" className="social-icon">f</Link>
          <Link to="#" className="social-icon">t</Link>
          <Link to="#" className="social-icon">in</Link>
          <Link to="#" className="social-icon">@</Link>
          <Link to="#" className="social-icon">p</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;