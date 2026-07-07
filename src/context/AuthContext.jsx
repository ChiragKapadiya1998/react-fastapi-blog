import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiCall } from '../api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiCall('/auth/me');
          setUser(userData);
          setProfile(userData);
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const signUp = async (email, password, firstName, lastName) => {
    try {
      await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName })
      });
      // Immediately login after signup
      return await signIn(email, password);
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: email,
          password: password
        })
      });
      
      localStorage.setItem('token', data.access_token);
      
      const userData = await apiCall('/auth/me');
      setUser(userData);
      setProfile(userData);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (firstName, lastName) => {
    try {
      const data = await apiCall('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ first_name: firstName, last_name: lastName })
      });
      setUser(data);
      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, signUp, signIn, signOut, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
