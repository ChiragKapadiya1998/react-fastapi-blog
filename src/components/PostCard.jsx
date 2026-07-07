import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../api';
import CommentSection from './CommentSection';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isFollowing, setIsFollowing] = useState(post.author?.is_following || false);
  
  // Sync if post prop changes
  useEffect(() => {
    setIsFollowing(post.author?.is_following || false);
  }, [post.author?.is_following]);
  
  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiCall(`/users/${post.user_id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST'
      });
      setIsFollowing(!isFollowing);
    } catch (error) {
      alert('Failed to update follow status: ' + error.message);
    }
  };
  
  const getInitials = (firstName, lastName) => {
    if (!firstName) return 'U';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  const isOwner = user && user.id === post.user_id;

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-meta">
          <Link to={`/profile/${post.user_id}`} className="post-avatar" style={{ textDecoration: 'none', color: 'inherit' }}>
            {getInitials(post.author?.first_name, post.author?.last_name)}
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Link to={`/profile/${post.user_id}`} className="post-author" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
                {post.author?.first_name || 'Anonymous'} {post.author?.last_name || ''}
              </Link>
              {!isOwner && (
                <button 
                  onClick={handleFollowToggle}
                  style={{ 
                    background: 'none', border: 'none', padding: 0, 
                    color: isFollowing ? 'var(--text-secondary)' : 'var(--primary-color)',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '0.2rem'
                  }}
                  title={isFollowing ? "Unfollow" : "Follow"}
                >
                  {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <div className="post-date">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="post-actions">
            <Link to={`/edit/${post.id}`} className="btn-icon" title="Edit Post">
              <Edit2 size={16} />
            </Link>
            <button 
              onClick={() => onDelete(post.id)} 
              className="btn-icon" 
              style={{ color: 'var(--danger-color)' }}
              title="Delete Post"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      <h3 className="post-title">{post.title}</h3>
      <div className="post-content">{post.content}</div>
      
      <CommentSection postId={post.id} />
    </article>
  );
}
