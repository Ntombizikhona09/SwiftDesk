import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; 
 // Import the Messages component

import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import ForgotPassword from "./ForgotPassword";
import EmployeeQueryPage from "./EmployeeQueryPage";
import TechnicianPanel from "./TechnicianPanel"; 
import Messages from "./messages";

const App = () => {
  const [user, setUser] = useState(null);
  const [employeeType, setEmployeeType] = useState(null); 

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

       
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setEmployeeType(userDocSnap.data().employeeType); 
        }
      } else {
        setUser(null);
        setEmployeeType(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
         <Route path="/login" element={<LoginPage />} />
<Route path="/" element={<LoginPage />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/employee-query" element={<EmployeeQueryPage />} />
<Route path="/messages" element={<Messages />} />
          {/* Role-based navigation */}
          {employeeType === "admin" && (
            <Route path="/technician-panel" element={<TechnicianPanel />} />
          )}
          {employeeType === "user" && (
            <Route path="/employee-query" element={<EmployeeQueryPage />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
