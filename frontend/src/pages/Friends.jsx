import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { friendsAPI } from '../services/api';

function Friends() {
  const { isAuthenticated } = useUserStore();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadFriends();
      loadRequests();
    }
  }, [isAuthenticated]);

  const loadFriends = async () => {
    try {
      const data = await friendsAPI.getFriends();
      setFriends(data.friends);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await friendsAPI.getRequests();
      setRequests(data.requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const data = await friendsAPI.searchUsers(searchQuery);
      setSearchResults(data.users);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      showMessage('Friend request sent!');
      // Refresh search to update status
      const data = await friendsAPI.searchUsers(searchQuery);
      setSearchResults(data.users);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to send request', true);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await friendsAPI.acceptRequest(friendshipId);
      showMessage('Friend request accepted!');
      loadFriends();
      loadRequests();
    } catch (error) {
      showMessage('Failed to accept request', true);
    }
  };

  const handleDeclineRequest = async (friendshipId) => {
    try {
      await friendsAPI.declineRequest(friendshipId);
      showMessage('Friend request declined');
      loadRequests();
    } catch (error) {
      showMessage('Failed to decline request', true);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      await friendsAPI.removeFriend(friendId);
      showMessage('Friend removed');
      loadFriends();
    } catch (error) {
      showMessage('Failed to remove friend', true);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setTimeout(() => setMessage(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view friends</p>
          <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <Link to="/lobby" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Lobby
            </Link>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.isError
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Friends & Social</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by username..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'friends'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'requests'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Requests ({requests.length})
              </button>
              {searchResults.length > 0 && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'search'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Search Results
                </button>
              )}
            </div>

            {/* Friends List */}
            {activeTab === 'friends' && (
              <div className="space-y-3">
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : friends.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No friends yet. Search for users to add them!
                  </p>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700">
                            {friend.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {friend.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {friend.stats.gamesPlayed} games played
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Friend Requests */}
            {activeTab === 'requests' && (
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending requests</p>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {request.requester.avatar ? (
                          <img
                            src={request.requester.avatar}
                            alt={request.requester.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700">
                            {request.requester.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {request.requester.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            Wants to be your friend
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request._id)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Search Results */}
            {activeTab === 'search' && (
              <div className="space-y-3">
                {searchResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No users found</p>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.stats.gamesPlayed} games • W: {user.stats.gamesWon} L:{' '}
                            {user.stats.gamesLost}
                          </div>
                        </div>
                      </div>
                      <div>
                        {user.friendshipStatus === 'accepted' && (
                          <span className="text-green-600 font-medium">Friends</span>
                        )}
                        {user.friendshipStatus === 'pending' && (
                          <span className="text-yellow-600 font-medium">Pending</span>
                        )}
                        {user.friendshipStatus === 'none' && (
                          <button
                            onClick={() => handleSendRequest(user.id)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Friends;
