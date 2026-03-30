import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const NotificationToast = ({ notification, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'xp': return '⭐';
      case 'level': return '🚀';
      case 'streak': return '🔥';
      case 'badge': return '🏆';
      case 'task': return '✅';
      default: return '🎉';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'xp': return 'from-yellow-500 to-orange-500';
      case 'level': return 'from-purple-500 to-pink-500';
      case 'streak': return 'from-red-500 to-orange-500';
      case 'badge': return 'from-blue-500 to-cyan-500';
      case 'task': return 'from-green-500 to-emerald-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`bg-gradient-to-r ${getColor(notification.type)} p-4 rounded-lg shadow-lg text-white min-w-80 cursor-pointer`}
      onClick={onClose}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          {getIcon(notification.type)}
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold">{notification.title}</div>
          <div className="text-sm opacity-90">{notification.message}</div>
        </div>
        {notification.xp && (
          <motion.div
            className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            +{notification.xp} XP
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const EnhancedNotificationSystem = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdate = (data) => {
      if (data.xpGain > 0) {
        addNotification({
          id: Date.now(),
          type: 'xp',
          title: 'XP Earned!',
          message: `You gained ${data.xpGain} XP`,
          xp: data.xpGain
        });
      }

      if (data.leveledUp) {
        addNotification({
          id: Date.now() + 1,
          type: 'level',
          title: 'Level Up!',
          message: `Welcome to ${data.levelTitle}!`
        });
      }

      if (data.newBadges?.length > 0) {
        data.newBadges.forEach((badge, index) => {
          addNotification({
            id: Date.now() + index + 2,
            type: 'badge',
            title: 'Badge Unlocked!',
            message: badge.name
          });
        });
      }
    };

    const handleTaskUpdate = (data) => {
      if (data.task.completed) {
        addNotification({
          id: Date.now(),
          type: 'task',
          title: 'Task Completed!',
          message: data.task.title,
          xp: 20
        });
      }
    };

    const handleStreakUpdate = (data) => {
      if (data.streak > 0 && data.streak % 7 === 0) {
        addNotification({
          id: Date.now(),
          type: 'streak',
          title: 'Streak Milestone!',
          message: `${data.streak} days strong! 🔥`,
          xp: 100
        });
      }
    };

    socket.on('stats:update', handleStatsUpdate);
    socket.on('task:updated', handleTaskUpdate);
    socket.on('streak:update', handleStreakUpdate);

    return () => {
      socket.off('stats:update', handleStatsUpdate);
      socket.off('task:updated', handleTaskUpdate);
      socket.off('streak:update', handleStreakUpdate);
    };
  }, [socket]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNotificationSystem;