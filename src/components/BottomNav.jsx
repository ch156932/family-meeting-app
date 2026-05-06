import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, CheckSquare, Clock, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/meeting/new', icon: PlusCircle, label: '新会议' },
  { to: '/actions', icon: CheckSquare, label: '待办' },
  { to: '/history', icon: Clock, label: '历史' },
  { to: '/settings', icon: Settings, label: '设置' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                </motion.div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
