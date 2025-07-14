import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminLogin.css';
import { UserService } from '../../services/userService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password || !confirmPassword) {
      return setError("Both fields are required");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setIsLoading(true);

      await UserService.resetPassword(token, password);

      setSuccessMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/9774b5ef3cf7c7e668645381063e41715811967f.png" alt="Cadooga Logo" className="logo" />
        </div>

        <form onSubmit={handleReset}>
          <h2 className="form-title">Reset Password</h2>

          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              disabled={isLoading}
              required
            />
          </div>

          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              disabled={isLoading}
              required
            />
            <span 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg viewBox="0 0 24 24" className="eye-icon">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            <span className="login-button-text">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
