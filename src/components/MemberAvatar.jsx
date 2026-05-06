import { motion } from 'framer-motion';

const AVATAR_BG = {
  parent: 'bg-blue-100',
  child: 'bg-orange-100',
  default: 'bg-purple-100',
};

export default function MemberAvatar({ member, size = 'md', showName = true, onClick }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  };
  const bgClass = AVATAR_BG[member?.role] || AVATAR_BG.default;

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} ${bgClass} rounded-full flex items-center justify-center shadow-sm border-2 border-white`}
        style={{ borderColor: member?.color || '#e5e7eb' }}
      >
        <span>{member?.avatar || '👤'}</span>
      </div>
      {showName && (
        <span className="text-xs text-gray-600 font-medium">{member?.name || '成员'}</span>
      )}
    </motion.div>
  );
}
