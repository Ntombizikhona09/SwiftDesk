import React, { useState } from 'react';
import './index.css'; 

const ForgotPassword = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email !== confirmEmail) {
      alert('Emails do not match!');
      return;
    }

    if (employeeId.trim() === '' || phoneNumber.trim() === '') {
      alert('Please fill in all required fields.');
      return;
    }

    alert('A reset link has been sent to your email.');
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit} className="login__form" id="forgot-password-form">
        <h1 className="login__title">Forgot Password</h1>
        <div className="login__content">
          <div className="login__row">
            <div className="login__box">
              <i className="bx bx-id-card"></i>
              <div className="login__box-input">
                <input
                  type="text"
                  required
                  className="login__input"
                  id="employee-id"
                  placeholder=""
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
                <label className="login__label">Employee ID</label>
              </div>
            </div>
            <div className="login__box">
              <i className="bx bx-envelope"></i>
              <div className="login__box-input">
                <input
                  type="email"
                  required
                  className="login__input"
                  id="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="login__label">Email</label>
              </div>
            </div>
          </div>
          <div className="login__row">
            <div className="login__box">
              <i className="bx bx-envelope"></i>
              <div className="login__box-input">
                <input
                  type="email"
                  required
                  className="login__input"
                  id="confirm-email"
                  placeholder=""
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
                <label className="login__label">Confirm Email</label>
              </div>
            </div>
            <div className="login__box">
              <i className="bx bx-phone"></i>
              <div className="login__box-input">
                <input
                  type="tel"
                  required
                  className="login__input"
                  id="phone-number"
                  placeholder=""
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <label className="login__label">Phone Number</label>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="login__button">
          Send Reset Link
        </button>
        <p className="login__register">
          Remembered your password? <a href="LoginPage.jsx">Login</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;