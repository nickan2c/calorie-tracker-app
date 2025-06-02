import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../styles/common/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // Create the user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create the user document with username and default settings
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userDocRef, {
          username: username,
          settings: {
            tdee: 2000,
            goalIntake: 1500,
            goalProtein: 150,
            goalSteps: 10000
          }
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="subtitle">
          {isRegistering 
            ? 'Create an account to track your health journey'
            : 'Sign in to continue your health journey'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required={isRegistering}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isRegistering 
              ? 'Already have an account?' 
              : "Don't have an account?"}
            <button 
              className="switch-button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setUsername('');
              }}
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 