import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../api';
import PostCard from '../components/PostCard';
import UserListModal from '../components/UserListModal';
import { Mail, Edit2, Save, X, UserPlus, UserMinus, Users, FileText } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { user, profile: authProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [saving, setSaving] = useState(false);

  // List modal state
  const [listModalConfig, setListModalConfig] = useState({ isOpen: false, title: '', users: [] });

  const isOwnProfile = !id || (user && parseInt(id) === user.id);
  const displayProfile = isOwnProfile ? authProfile : profileData;
  const targetUserId = isOwnProfile ? user?.id : parseInt(id);

  useEffect(() => {
    if (targetUserId) {
      fetchProfileData();
      fetchUserPosts();
    } else if (!isOwnProfile && !id) {
      // Not logged in and trying to view own profile
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (isOwnProfile && authProfile) {
      setEditFirstName(authProfile.first_name || '');
      setEditLastName(authProfile.last_name || '');
    }
  }, [isOwnProfile, authProfile]);

  const fetchProfileData = async () => {
    try {
      if (!isOwnProfile) {
        const data = await apiCall(`/users/${targetUserId}`);
        setProfileData(data);
      } else {
        // Fetch own stats
        const data = await apiCall(`/users/${user.id}`);
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/posts?user_id=${targetUserId}`);
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile(editFirstName, editLastName);
    setSaving(false);
    if (!error) {
      setIsEditing(false);
    } else {
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiCall(`/posts/${postId}`, { method: 'DELETE' });
      setUserPosts(userPosts.filter(post => post.id !== postId));
      if (profileData) setProfileData({...profileData, post_count: profileData.post_count - 1});
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post: ' + error.message);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const isFollowing = profileData?.is_following;
      await apiCall(`/users/${targetUserId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST'
      });
      
      setProfileData({
        ...profileData,
        is_following: !isFollowing,
        followers_count: isFollowing ? profileData.followers_count - 1 : profileData.followers_count + 1
      });
    } catch (error) {
      alert('Failed to follow/unfollow: ' + error.message);
    }
  };

  const openUsersList = async (type) => {
    try {
      const data = await apiCall(`/users/${targetUserId}/${type}`);
      setListModalConfig({
        isOpen: true,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        users: data || []
      });
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  if (!isOwnProfile && !profileData && !loading) {
    return <div className="loading-spinner">Profile not found.</div>;
  }

  if (isOwnProfile && !user) {
    return <div className="loading-spinner">Please log in to view your profile.</div>;
  }

  return (
    <div>
      <div className="profile-header-container">
        <div className="profile-avatar">
          {displayProfile?.first_name?.[0]}{displayProfile?.last_name?.[0]}
        </div>
        
        <div className="profile-info">
          <div className="profile-name-row">
            <div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editFirstName} 
                    onChange={(e) => setEditFirstName(e.target.value)} 
                    placeholder="First Name"
                    style={{ width: '150px' }}
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editLastName} 
                    onChange={(e) => setEditLastName(e.target.value)} 
                    placeholder="Last Name"
                    style={{ width: '150px' }}
                  />
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving} style={{ padding: '0.5rem' }}>
                    <Save size={16} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '0.5rem' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <h1 className="page-title profile-title">
                  {displayProfile?.first_name} {displayProfile?.last_name}
                  {isOwnProfile && (
                    <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit Name">
                      <Edit2 size={18} />
                    </button>
                  )}
                </h1>
              )}
              <div className="profile-email">
                <Mail size={16} /> {displayProfile?.email}
              </div>
            </div>
            
            {!isOwnProfile && (
              <button 
                onClick={handleFollowToggle}
                className={`btn ${profileData?.is_following ? 'btn-secondary' : 'btn-primary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {profileData?.is_following ? (
                  <><UserMinus size={18} /> Unfollow</>
                ) : (
                  <><UserPlus size={18} /> Follow</>
                )}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{profileData?.post_count || userPosts.length}</div>
              <div className="stat-label"><FileText size={14}/> Posts</div>
            </div>
            <div 
              className="stat-item clickable-stat"
              onClick={() => openUsersList('followers')}
            >
              <div className="stat-value">{profileData?.followers_count || 0}</div>
              <div className="stat-label stat-primary"><Users size={14}/> Followers</div>
            </div>
            <div 
              className="stat-item clickable-stat"
              onClick={() => openUsersList('following')}
            >
              <div className="stat-value">{profileData?.following_count || 0}</div>
              <div className="stat-label stat-primary"><Users size={14}/> Following</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {isOwnProfile ? 'My Posts' : 'Posts'}
        </h2>
        
        {loading ? (
          <div className="loading-spinner">Loading posts...</div>
        ) : userPosts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>{isOwnProfile ? "You haven't published anything. Go write your first post!" : "This user hasn't published anything yet."}</p>
          </div>
        ) : (
          <div className="posts-container">
            {userPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={isOwnProfile ? handleDeletePost : undefined} 
              />
            ))}
          </div>
        )}
      </div>

      {listModalConfig.isOpen && (
        <UserListModal 
          title={listModalConfig.title} 
          users={listModalConfig.users} 
          onClose={() => setListModalConfig({ ...listModalConfig, isOpen: false })}
          onFollowToggle={(id, isFollowing) => {
            // Update profile stats if we toggle while viewing our own profile or the target's profile
            if (isOwnProfile) {
              setProfileData(prev => ({
                ...prev,
                following_count: isFollowing ? prev.following_count + 1 : prev.following_count - 1
              }));
            }
          }}
        />
      )}
    </div>
  );
}
