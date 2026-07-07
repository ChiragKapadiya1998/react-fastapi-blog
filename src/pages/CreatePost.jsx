import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="editor-container">
      <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">Post Title</label>
          <input
            id="title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Give your post a catchy title"
            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="content">Content</label>
          <textarea
            id="content"
            className="form-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="What's on your mind?"
            style={{ minHeight: '300px' }}
          />
        </div>
        
        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || !title || !content}>
            {loading ? 'Publishing...' : <><Send size={18} /> Publish Post</>}
          </button>
        </div>
      </form>
    </div>
  );
}
