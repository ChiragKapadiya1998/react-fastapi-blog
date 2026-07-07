import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../api';
import { UserPlus, UserMinus, X } from 'lucide-react';

export default function UserListModal({ title, users, onClose, onFollowToggle }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Local state to handle follow toggling immediately in the UI
  const [localUsers, setLocalUsers] = useState(users);
  
  const handleFollowToggle = async (targetUser) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      const isFollowing = targetUser.is_following;
      await apiCall(`/users/${targetUser.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST'
      });
      
      // Update local state
      setLocalUsers(localUsers.map(u => {
        if (u.id === targetUser.id) {
          return { ...u, is_following: !isFollowing };
        }
        return u;
      }));
      
      // Call parent callback if needed
      if (onFollowToggle) {
        onFollowToggle(targetUser.id, !isFollowing);
      }
    } catch (error) {
      alert('Failed to follow/unfollow: ' + error.message);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName) return 'U';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-color)',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h2>
          <button onClick={onClose} className="btn-icon" style={{ padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>
        
        {/* List */}
        <div style={{ overflowY: 'auto', padding: '1rem', flex: 1 }}>
          {localUsers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              No users found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {localUsers.map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Link to={`/profile/${u.id}`} onClick={onClose} style={{ textDecoration: 'none' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: 'var(--primary-color)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1rem'
                      }}>
                        {getInitials(u.first_name, u.last_name)}
                      </div>
                    </Link>
                    <Link to={`/profile/${u.id}`} onClick={onClose} style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: 'bold' }}>
                      {u.first_name || 'Anonymous'} {u.last_name || ''}
                    </Link>
                  </div>
                  
                  {(!currentUser || currentUser.id !== u.id) && (
                    <button 
                      onClick={() => handleFollowToggle(u)}
                      className={`btn ${u.is_following ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {u.is_following ? <><UserMinus size={14} /> Unfollow</> : <><UserPlus size={14} /> Follow</>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
