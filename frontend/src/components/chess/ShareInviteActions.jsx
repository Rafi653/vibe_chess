import { useState } from 'react';
import { motion } from 'framer-motion';

const ShareInviteActions = ({ roomId, gameUrl, disabled = false }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleShare = async () => {
    if (disabled) return;

    const shareData = {
      title: 'Vibe Chess Game',
      text: `Join my chess game! Room ID: ${roomId}`,
      url: gameUrl || window.location.href,
    };

    try {
      // Use Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
      }
    } catch (error) {
      // If sharing is cancelled or fails, copy to clipboard
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareData.url);
          setShowCopyFeedback(true);
          setTimeout(() => setShowCopyFeedback(false), 2000);
        } catch (clipboardError) {
          console.error('Failed to copy:', clipboardError);
        }
      }
    }
  };

  const handleInvite = () => {
    if (disabled) return;
    
    // Open the friends page in a new tab/window or navigate there
    // This can be customized based on your routing needs
    window.open('/friends', '_blank');
  };

  return (
    <div className="fixed bottom-20 left-4 md:bottom-24 md:left-6 z-40 flex gap-2">
      {/* Share Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        disabled={disabled}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        aria-label="Share game"
        title="Share game link"
      >
        📤
      </motion.button>

      {/* Invite Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleInvite}
        disabled={disabled}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
        aria-label="Invite friends"
        title="Invite friends to play"
      >
        👥
      </motion.button>

      {/* Copy Feedback Toast */}
      {showCopyFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-16 left-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl"
        >
          ✓ Link copied to clipboard!
        </motion.div>
      )}
    </div>
  );
};

export default ShareInviteActions;
