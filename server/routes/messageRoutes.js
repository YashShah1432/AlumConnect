const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/isAuthenticated');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/users');

// =====================================
// Get all conversations for the current user
// =====================================
router.get('/conversations', isAuthenticated, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      deletedFor: { $ne: req.user._id }
    })
      .populate({
        path: 'participants',
        select: 'name email profilePicture'
      })
      .populate({
        path: 'lastMessage',
        select: 'content createdAt read'
      })
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );

      return {
        _id: conv._id,
        otherUser: otherParticipant
          ? {
              _id: otherParticipant._id,
              name: otherParticipant.name,
              email: otherParticipant.email,
              avatar:
                otherParticipant.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  otherParticipant.name
                )}`
            }
          : null,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        unreadCount: conv.unreadCount || 0
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

// =====================================
// Get messages for a specific conversation (paginated)
// =====================================
router.get('/conversation/:conversationId', isAuthenticated, async (req, res) => {
  try {
    const { limit = 20, lastMessageId } = req.query;
    const conversationId = req.params.conversationId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const query = { conversation: conversationId };

    if (lastMessageId) {
      const lastMessage = await Message.findById(lastMessageId);
      if (lastMessage) {
        query.createdAt = { $lt: lastMessage.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Mark received messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.user._id,
        read: false
      },
      { $set: { read: true } }
    );

    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================
// Legacy: get messages between current user and another user
// =====================================
router.get('/messages/:userId', isAuthenticated, async (req, res) => {
  try {
    const recipient = await User.findById(req.params.userId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, req.params.userId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, req.params.userId]
      });
      await conversation.save();
    }

    const messages = await Message.find({
      conversation: conversation._id
    })
      .populate('sender', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: conversation._id,
        recipient: req.user._id,
        read: false
      },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================
// Get unread message count (total + per conversation)
// =====================================
router.get('/unread', isAuthenticated, async (req, res) => {
  try {
    const totalUnreadCount = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });

    const aggregateResult = await Message.aggregate([
      {
        $match: {
          recipient: req.user._id,
          read: false
        }
      },
      {
        $group: {
          _id: '$conversation',
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    const unreadByConversation = aggregateResult.map(item => ({
      conversationId: item._id,
      unreadCount: item.unreadCount
    }));

    res.json({
      totalUnreadCount,
      unreadByConversation
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================
// Send a new message
// =====================================
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, recipientId]
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim(),
      read: false
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

// =====================================
// Delete a whole conversation (soft delete per user)
// =====================================
router.delete('/conversation/:conversationId', isAuthenticated, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!conversation.deletedFor) {
      conversation.deletedFor = [];
    }

    if (!conversation.deletedFor.includes(userId)) {
      conversation.deletedFor.push(userId);
    }

    const allDeleted = conversation.participants.every(participantId =>
      conversation.deletedFor.some(
        deletedId => deletedId.toString() === participantId.toString()
      )
    );

    if (allDeleted) {
      await Conversation.findByIdAndDelete(conversationId);
      await Message.deleteMany({ conversation: conversationId });
    } else {
      await conversation.save();
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================
// Edit a single message (sender only, only if unread)
// =====================================
router.patch('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    if (message.read) {
      return res
        .status(400)
        .json({ error: 'Message has already been read and cannot be edited' });
    }

    message.content = content.trim();
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    res.json(populatedMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================
// Delete a single message (sender only)
// =====================================
router.delete('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    const conversationId = message.conversation;

    await Message.findByIdAndDelete(messageId);

    const conversation = await Conversation.findById(conversationId);
    if (conversation && conversation.lastMessage?.toString() === messageId.toString()) {
      const lastMsg = await Message.findOne({ conversation: conversationId }).sort({
        createdAt: -1
      });
      conversation.lastMessage = lastMsg ? lastMsg._id : null;
      conversation.updatedAt = lastMsg ? lastMsg.createdAt : conversation.updatedAt;
      await conversation.save();
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;