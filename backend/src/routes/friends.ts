import { Router, Request, Response } from 'express';
import { Friendship } from '../models/Friendship';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = Router();

// Send friend request
router.post('/request', auth, async (req: Request, res: Response) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    if (requesterId.toString() === recipientId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      }
      if (existingFriendship.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
    }

    // Create new friend request
    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    await friendship.save();

    res.status(201).json({
      message: 'Friend request sent',
      friendshipId: friendship._id,
    });
  } catch (error: any) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.post('/accept/:friendshipId', auth, async (req: Request, res: Response) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify that the current user is the recipient
    if (friendship.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ error: 'Friend request is not pending' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.json({
      message: 'Friend request accepted',
      friendship,
    });
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Decline friend request
router.post('/decline/:friendshipId', auth, async (req: Request, res: Response) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify that the current user is the recipient
    if (friendship.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to decline this request' });
    }

    friendship.status = 'declined';
    await friendship.save();

    res.json({
      message: 'Friend request declined',
    });
  } catch (error: any) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Failed to decline friend request' });
  }
});

// Get friends list
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Find all accepted friendships where user is either requester or recipient
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' },
      ],
    })
      .populate('requester', 'username avatar stats')
      .populate('recipient', 'username avatar stats');

    // Extract friend data
    const friends = friendships.map((friendship) => {
      const isRequester = friendship.requester._id.toString() === userId.toString();
      const friend: any = isRequester ? friendship.recipient : friendship.requester;
      return {
        id: friend._id,
        username: friend.username,
        avatar: friend.avatar,
        stats: friend.stats,
      };
    });

    res.json({ friends });
  } catch (error: any) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Get pending friend requests
router.get('/requests', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Find pending requests where user is the recipient
    const requests = await Friendship.find({
      recipient: userId,
      status: 'pending',
    }).populate('requester', 'username avatar stats');

    res.json({ requests });
  } catch (error: any) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Find and delete the friendship
    const result = await Friendship.findOneAndDelete({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId },
      ],
      status: 'accepted',
    });

    if (!result) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error: any) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Search users (for adding friends)
router.get('/search', auth, async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search for users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: userId }, // Exclude current user
    })
      .select('username avatar stats')
      .limit(10);

    // Check friendship status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: userId, recipient: user._id },
            { requester: user._id, recipient: userId },
          ],
        });

        return {
          id: user._id,
          username: user.username,
          avatar: user.avatar,
          stats: user.stats,
          friendshipStatus: friendship?.status || 'none',
          friendshipId: friendship?._id,
        };
      })
    );

    res.json({ users: usersWithStatus });
  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
