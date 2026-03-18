// components/friends/FriendsManager.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import { Mailbox, Search, Users } from 'lucide-react';

const FriendsManager = () => {
  const { user, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getFriendsList, searchUsers } = useUser();
  const [friendsData, setFriendsData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      const data = await getFriendsList();
      setFriendsData(data);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    }
  };

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (username) => {
    try {
      await sendFriendRequest(username);
      // Refresh search results to update status
      handleSearch(searchQuery);
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptRequest = async (fromUserId) => {
    try {
      await acceptFriendRequest(fromUserId);
      loadFriendsData();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleDeclineRequest = async (fromUserId) => {
    try {
      await declineFriendRequest(fromUserId);
      loadFriendsData();
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      loadFriendsData();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const getAvatarIcon = (avatar) => {
    const avatars = {
      'default': DoodleIcons.User,
      'brain': DoodleIcons.Brain,
      'trophy': DoodleIcons.Trophy,
      'lightning': DoodleIcons.Lightning,
      'book': DoodleIcons.Book,
      'star': DoodleIcons.Star
    };
    const IconComponent = avatars[avatar] || DoodleIcons.User;
    return <IconComponent size={20} />;
  };

  const getRankColor = (rank) => {
    const colors = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2',
      'Diamond': '#B9F2FF',
      'Master': '#8A2BE2',
      'Grandmaster': '#FF1493'
    };
    return colors[rank] || '#CD7F32';
  };

  const renderFriendsList = () => {
    if (!friendsData?.friends?.length) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' , display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '20px' , display: 'flex', gap: '8px' }}><Users size={48} /><Users size={48} /></div>
          <p style={{   opacity: '0.7' }}>
            No friends yet. Start by searching for users to add!
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '15px' }}>
        {friendsData.friends.map((friend) => (
          <div key={friend.id} className="doodle-card" style={{ padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '2rem' }}>
                  {getAvatarIcon(friend.avatar)}
                </div>
                <div>
                  <h4 style={{ 
                    fontFamily: 'Architects Daughter, cursive', 
                    margin: '0 0 5px 0' 
                  }}>
                    {friend.username}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      padding: '2px 6px',
                      background: getRankColor(friend.rank),
                      color: friend.rank === 'Gold' || friend.rank === 'Silver' ? 'var(--doodle-ink)' : 'white',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                       
                      fontWeight: '600'
                    }}>
                      {friend.rank}
                    </span>
                    <span style={{ 
                        
                      fontSize: '0.8rem',
                      opacity: '0.7'
                    }}>
                      Level {friend.level}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="doodle-btn doodle-btn-danger"
                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFriendRequests = () => {
    if (!friendsData?.pendingRequests?.length) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><Mailbox size={64} /></div>
          <p style={{   opacity: '0.7' }}>
            No pending friend requests
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '15px' }}>
        {friendsData.pendingRequests.map((request) => (
          <div key={request.id} className="doodle-card" style={{ padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '2rem' }}>
                  {getAvatarIcon(request.avatar)}
                </div>
                <div>
                  <h4 style={{ 
                    fontFamily: 'Architects Daughter, cursive', 
                    margin: '0 0 5px 0' 
                  }}>
                    {request.username}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      padding: '2px 6px',
                      background: getRankColor(request.rank),
                      color: request.rank === 'Gold' || request.rank === 'Silver' ? 'var(--doodle-ink)' : 'white',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                       
                      fontWeight: '600'
                    }}>
                      {request.rank}
                    </span>
                    <span style={{ 
                        
                      fontSize: '0.8rem',
                      opacity: '0.7'
                    }}>
                      Level {request.level}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="doodle-btn doodle-btn-primary"
                  style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineRequest(request.id)}
                  className="doodle-btn doodle-btn-danger"
                  style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="doodle-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{   marginTop: '10px' }}>
            Searching...
          </p>
        </div>
      );
    }

    if (!searchResults.length) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><Search size={64} /></div>
          <p style={{   opacity: '0.7' }}>
            {searchQuery ? 'No users found' : 'Enter a username to search'}
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '15px' }}>
        {searchResults.map((user) => (
          <div key={user.id} className="doodle-card" style={{ padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '2rem' }}>
                  {getAvatarIcon(user.avatar)}
                </div>
                <div>
                  <h4 style={{ 
                    fontFamily: 'Architects Daughter, cursive', 
                    margin: '0 0 5px 0' 
                  }}>
                    {user.username}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      padding: '2px 6px',
                      background: getRankColor(user.rank),
                      color: user.rank === 'Gold' || user.rank === 'Silver' ? 'var(--doodle-ink)' : 'white',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                       
                      fontWeight: '600'
                    }}>
                      {user.rank}
                    </span>
                    <span style={{ 
                        
                      fontSize: '0.8rem',
                      opacity: '0.7'
                    }}>
                      Level {user.level}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {user.status === 'friends' && (
                  <span style={{ 
                      
                    color: 'var(--doodle-green)',
                    fontSize: '0.8rem'
                  }}>
                    Friends
                  </span>
                )}
                {user.status === 'request_sent' && (
                  <span style={{ 
                      
                    color: 'var(--doodle-orange)',
                    fontSize: '0.8rem'
                  }}>
                    Request Sent
                  </span>
                )}
                {user.status === 'request_received' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAcceptRequest(user.id)}
                      className="doodle-btn doodle-btn-primary"
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(user.id)}
                      className="doodle-btn doodle-btn-danger"
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      Decline
                    </button>
                  </div>
                )}
                {user.status === 'none' && (
                  <button
                    onClick={() => handleSendFriendRequest(user.username)}
                    className="doodle-btn doodle-btn-primary"
                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                  >
                    Add Friend
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div className="doodle-card" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ padding: '30px' }}>
            <div className="doodle-avatar doodle-float" style={{ margin: '0 auto 20px' }}>
              <DoodleIcons.Users size={40} color="#fff" />
            </div>
            <h2 className="doodle-title">Friends</h2>
            <p className="doodle-subtitle">
              Connect with other learners and compete together!
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid var(--doodle-ink)',
          opacity: ''
        }}>
          <button
            onClick={() => setActiveTab('friends')}
            className={`doodle-btn ${activeTab === 'friends' ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
            style={{ borderRadius: '15px 15px 0 0' }}
          >
            Friends ({friendsData?.totalFriends || 0})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`doodle-btn ${activeTab === 'requests' ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
            style={{ borderRadius: '15px 15px 0 0' }}
          >
            Requests ({friendsData?.totalPendingRequests || 0})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`doodle-btn ${activeTab === 'search' ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
            style={{ borderRadius: '15px 15px 0 0' }}
          >
            Search Users
          </button>
        </div>

        {/* Search Bar (only for search tab) */}
        {activeTab === 'search' && (
          <div className="doodle-card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '20px' }}>
              <label className="doodle-label">
                Search for users by username
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="doodle-input"
                placeholder="Enter username..."
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="doodle-card">
          <div style={{ padding: '20px' }}>
            {activeTab === 'friends' && renderFriendsList()}
            {activeTab === 'requests' && renderFriendRequests()}
            {activeTab === 'search' && renderSearchResults()}
          </div>
        </div>

        {/* Decorative Elements */}
        {/* <div className="doodle-arrow" style={{ top: '100px', right: '50px' }}>↗</div>
        <div style={{ 
          position: 'absolute', 
          bottom: '200px', 
          left: '50px',
          fontSize: '2rem',
          color: 'var(--doodle-green)',
          transform: 'rotate(25deg)',
          opacity: '0.6'
        }}>
          <DoodleIcons.Users size={16} />
        </div> */}
      </div>
    </div>
  );
};

export default FriendsManager;
