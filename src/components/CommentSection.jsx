import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2 } from 'lucide-react';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await apiCall(`/comments/${postId}`);
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await apiCall('/comments', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, content: newComment.trim() })
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error.message);
      alert('Error adding comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await apiCall(`/comments/${commentId}`, { method: 'DELETE' });
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error.message);
      alert('Error deleting comment: ' + error.message);
    }
  };

  if (loading) return <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading comments...</div>;

  return (
    <div className="comments-section">
      <h4 className="comments-title">Comments ({comments.length})</h4>
      
      {comments.length > 0 && (
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.author?.first_name} {comment.author?.last_name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {user && user.id === comment.user_id && (
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete Comment"
                      style={{ padding: '0.2rem', color: 'var(--danger-color)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <input
            type="text"
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
          Please log in to leave a comment.
        </div>
      )}
    </div>
  );
}
