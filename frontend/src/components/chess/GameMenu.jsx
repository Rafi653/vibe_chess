import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameMenu = ({ onAbort, onOfferDraw, onResign, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'resign',
      label: 'Resign',
      icon: '🏳️',
      action: onResign,
      color: 'text-red-600 hover:bg-red-50',
    },
    {
      id: 'draw',
      label: 'Offer Draw',
      icon: '🤝',
      action: onOfferDraw,
      color: 'text-yellow-600 hover:bg-yellow-50',
    },
    {
      id: 'abort',
      label: 'Abort Game',
      icon: '⛔',
      action: onAbort,
      color: 'text-gray-600 hover:bg-gray-50',
    },
  ];

  const handleAction = (action) => {
    setIsOpen(false);
    if (action && !disabled) {
      action();
    }
  };

  return (
    <>
      {/* Menu Button - Fixed position for easy thumb access */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
        }`}
        aria-label="Game menu"
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-30"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl"
            >
              <div className="p-6 pb-8">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Game Options
                </h3>

                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAction(item.action)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl font-semibold transition-all ${
                        disabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `${item.color} active:scale-95`
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-4 p-4 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameMenu;
