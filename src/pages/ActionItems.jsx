import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, Circle, Bell } from 'lucide-react';
import ActionCard from '../components/ActionCard';
import { getActions, requestNotificationPermission, scheduleNotification } from '../utils/storage';

const FILTER_OPTIONS = [
  { id: 'all', label: '全部', icon: Circle },
  { id: 'pending', label: '待完成', icon: Clock },
  { id: 'inprogress', label: '进行中', icon: Clock },
  { id: 'completed', label: '已完成', icon: CheckSquare },
];

export default function ActionItems() {
  const [actions, setActions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    setActions(getActions());
    setNotifEnabled(Notification?.permission === 'granted');
  }, []);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
  };

  const filtered = filter === 'all' ? actions : actions.filter(a => a.status === filter);

  const handleUpdate = (updated) => {
    setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const counts = {
    pending: actions.filter(a => a.status === 'pending').length,
    inprogress: actions.filter(a => a.status === 'inprogress').length,
    completed: actions.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-white font-bold text-xl">待办行动项</h1>
        <p className="text-blue-100 text-xs mt-1">共 {actions.length} 项 · {counts.completed} 项已完成</p>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Progress */}
        {actions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">完成进度</span>
              <span className="text-xs font-medium text-blue-500">
                {counts.completed}/{actions.length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: actions.length ? `${(counts.completed / actions.length) * 100}%` : '0%' }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex gap-4 mt-3">
              {[
                { label: '待完成', count: counts.pending, color: 'text-gray-500' },
                { label: '进行中', count: counts.inprogress, color: 'text-blue-500' },
                { label: '已完成', count: counts.completed, color: 'text-green-500' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className={`text-base font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification toggle */}
        {!notifEnabled && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={enableNotifications}
            className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3"
          >
            <Bell className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-amber-700">开启提醒通知</p>
              <p className="text-xs text-amber-500">不错过任何重要行动项</p>
            </div>
          </motion.button>
        )}

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === opt.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {opt.label}
              {opt.id !== 'all' && counts[opt.id] > 0 && (
                <span className="ml-1 bg-white/30 px-1 rounded-full">{counts[opt.id]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Action list */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((action, i) => (
              <ActionCard key={action.id} action={action} index={i} onUpdate={handleUpdate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl">
              {filter === 'completed' ? '🎉' : '✨'}
            </span>
            <p className="text-gray-500 text-sm mt-3">
              {filter === 'completed' ? '还没有完成的行动项' : '暂无行动项'}
            </p>
            <p className="text-gray-400 text-xs">
              {filter === 'all' ? '完成家庭会议后，改善措施会自动生成到这里' : '调整筛选条件试试'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
