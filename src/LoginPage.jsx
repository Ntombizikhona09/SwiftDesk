import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { auth, signInWithEmailAndPassword } from './firebase'; // Import Firebase methods
import { getDoc, doc } from 'firebase/firestore'; // Import getDoc from Firestore
import './loginPage.css';

const Login = () => {
  const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (email.trim() === '' || password.trim() === '') {
      alert('Please fill in all required fields.');
      return;
    }
  
    try {
      // Sign in the user using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Correct Firestore reference
      const userDocRef = doc(db, 'users', user.uid); 
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userRole = userDoc.data().employeeType; // Fetch the employeeType field
        console.log("User role:", userRole); // Debugging
  
        // Navigate based on the role
        if (userRole === 'admin') {
          alert('Login successful!');
          navigate('/technician-panel'); // Navigate to Technician Panel for admin
        } else if (userRole === 'employee') {
          alert('Login successful!');
          navigate('/employee-query'); // Navigate to Employee Query Page for employees
        } else {
          alert('Invalid user role!');
        }
      } else {
        alert('No user data found in Firestore!');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      alert('Login failed. Please check your credentials and try again.');
    }
  };
  

  return (
    
    <div className="login">
   
      <form onSubmit={handleSubmit} className="login__form" id="login-form">
        <h1 className="login__title">Login</h1>
        <div className="login__content">
          <div className="login__row">
            <div className="login__box">
              <i className="bx bx-user"></i>
              <div className="login__box-input">
              <input
                   type="email"
                   required
                   className="login__input"
                   id="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
              />

                <label className="login__label">Email</label>
              </div>
            </div>
          </div>
          <div className="login__row">
            <div className="login__box">
              <i className="bx bx-lock"></i>
              <div className="login__box-input">
                <input
                  type="password"
                  required
                  className="login__input"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label className="login__label">Password</label>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="login__button">
          Login
        </button>
        <p className="login__register">
          Forgot your password? <a href="/forgot-password">Reset here</a>
        </p>
        {/* Register Link */}
        <p className="login__register">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
