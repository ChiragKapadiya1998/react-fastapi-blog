import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await apiCall('/posts');
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      await apiCall(`/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading feed...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Latest Posts</h1>
      </div>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Be the first one to share your thoughts!</p>
        </div>
      ) : (
        <div className="posts-container">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
