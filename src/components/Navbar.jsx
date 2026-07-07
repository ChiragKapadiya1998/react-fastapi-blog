import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PenSquare, Home, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          DevBlog.
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={18} /> Home
          </Link>
          
          {user ? (
            <>
              <Link to="/create" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PenSquare size={18} /> Write
              </Link>
              <div className="nav-user">
                <Link to="/profile" style={{ textDecoration: 'none' }} title="My Profile">
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '1rem', border: '2px solid var(--border-color)'
                  }}>
                    {profile?.first_name?.[0]}{profile?.last_name?.[0] || ''}
                  </div>
                </Link>
                <button onClick={handleSignOut} className="btn-icon" title="Log out">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogIn size={16} /> Log In
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <UserPlus size={16} /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
