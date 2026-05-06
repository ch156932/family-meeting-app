import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { getRandomEncouragement } from '../utils/encouragements';

export default function ScoreCard({ item, index = 0 }) {
  const encouragement = getRandomEncouragement();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-gray-800 text-sm leading-relaxed">{item.text}</p>
          {item.member && (
            <span className="mt-1 inline-block text-xs text-orange-600 font-medium">
              {item.member.avatar} {item.member.name}
            </span>
          )}
          <p className="mt-2 text-xs text-orange-500 italic">{encouragement}</p>
        </div>

        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
            className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-md"
          >
            <span className="text-white font-bold text-lg">+{item.score}</span>
          </motion.div>
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 + i * 0.1 }}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
