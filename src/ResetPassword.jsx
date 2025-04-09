import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import './resetPassword.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // New state for showing the popup
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      // Show the popup message
      setShowPopup(true);
      // Redirect after 3 seconds when the success message is displayed
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      // Clean up the timer when the component is unmounted or when success changes
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Attempt to send password reset email
      await sendPasswordResetEmail(auth, email);
      setError('');  // Reset any previous error messages
      setSuccess(true); // Set success to true when the reset email is sent
    } catch (err) {
      console.error("Error sending password reset email:", err);  // Log the error to the console
      setError('Something went wrong. Please try again later.'); // Display a generic error message
      setSuccess(false); // Reset success state in case of an error
    }
  };

  return (
    <div className="reset-password">
      <h1 className="reset-title">Reset Your Password</h1>

      {showPopup ? (
        <div className="success-message">
          <p>Password reset email sent! Please check your inbox.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="reset-form">
          <div className="reset-input">
            <label htmlFor="email">Enter your email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="error-message">{error}</p>}  {/* Display error if any */}

          <button type="submit" className="reset-button">Send Reset Link</button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;
