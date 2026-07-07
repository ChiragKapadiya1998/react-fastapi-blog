import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await apiCall(`/posts/${id}`);
        
        // Ensure only owner can edit
        if (user && data.user_id !== user.id) {
          navigate('/');
          return;
        }

        setTitle(data.title);
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching post:', error.message);
        setError('Could not load post.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);

    try {
      await apiCall(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content })
      });
      navigate('/');
    } catch (error) {
      console.error('Error updating post:', error.message);
      setError(error.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading editor...</div>;

  return (
    <div className="editor-container">
      <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Edit Post</h2>
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
            style={{ minHeight: '300px' }}
          />
        </div>
        
        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || !title || !content}>
            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
