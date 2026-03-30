const User = require('../models/User')
const Notification = require('../models/Notification')
const { emitToUser } = require('../config/socket')

/**
 * Follow a user and create notification
 */
const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new Error('Cannot follow yourself')
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ])

  if (!targetUser) {
    throw new Error('User not found')
  }

  if (!targetUser.isPublic) {
    throw new Error('Cannot follow private profile')
  }

  // Check if already following
  if (currentUser.following.includes(targetUserId)) {
    throw new Error('Already following this user')
  }

  // Update both users
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } })
  ])

  // Create notification
  const notification = new Notification({
    user: targetUserId,
    sender: currentUserId,
    type: 'follow',
    title: 'New Follower',
    body: `${currentUser.name} started following you`,
    metadata: { followerId: currentUserId }
  })
  await notification.save()

  // Emit real-time notification
  const populatedNotification = await Notification.findById(notification._id)
    .populate('sender', 'name avatarUrl')
    .lean()
  
  emitToUser(targetUserId, 'NEW_NOTIFICATION', populatedNotification)

  return { isFollowing: true }
}

/**
 * Unfollow a user
 */
const unfollowUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new Error('Cannot unfollow yourself')
  }

  const currentUser = await User.findById(currentUserId)
  if (!currentUser.following.includes(targetUserId)) {
    throw new Error('Not following this user')
  }

  // Update both users
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } })
  ])

  return { isFollowing: false }
}

/**
 * Get follow suggestions for a user
 */
const getFollowSuggestions = async (currentUserId, limit = 10) => {
  const currentUser = await User.findById(currentUserId)
  
  // Find users not already followed, excluding self, limit to public profiles
  const suggestions = await User.find({
    _id: { $nin: [...currentUser.following, currentUserId] },
    isPublic: true
  })
  .select('name avatarUrl bio goal')
  .limit(limit)
  .lean()

  return suggestions
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowSuggestions
}