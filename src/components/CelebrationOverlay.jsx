import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomCelebration } from '../utils/encouragements';

const CONFETTI_COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F4A261'];

function Particle({ x, color, delay }) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{ left: `${x}%`, top: '20%', backgroundColor: color }}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{
        y: [0, -60, 200],
        opacity: [1, 1, 0],
        rotate: [0, 360],
        scale: [1, 1.2, 0.5],
      }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    />
  );
}

export default function CelebrationOverlay({ show, onClose, totalScore = 0 }) {
  const message = getRandomCelebration();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.5,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="relative w-full h-full overflow-hidden">
            {particles.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="absolute bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl mb-4"
            >
              🌈
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">会议圆满结束！</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {totalScore > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl px-6 py-3 inline-block"
              >
                <span className="text-3xl font-bold">+{totalScore}</span>
                <span className="text-sm ml-1">家庭积分</span>
              </motion.div>
            )}
            <p className="text-xs text-gray-400 mt-4">点击任意处关闭</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
