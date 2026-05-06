import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, ChevronRight, Flame } from 'lucide-react';
import MemberAvatar from '../components/MemberAvatar';
import { getMeetings, getMembers, getStats } from '../utils/storage';

function TemperatureBar({ score }) {
  const max = 500;
  const pct = Math.min((score / max) * 100, 100);
  const level = pct < 30 ? '🌱 起步' : pct < 60 ? '🌤 成长' : pct < 85 ? '☀️ 温暖' : '🔥 热火';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          <Flame className="w-4 h-4 text-orange-500" /> 家庭温度计
        </span>
        <span className="text-xs text-orange-500 font-medium">{level}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-300 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">累计积分 {score} / {max}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    setMembers(getMembers());
    setMeetings(getMeetings().slice(0, 5));
    setStats(getStats());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-100 text-sm">欢迎回来</p>
          <h1 className="text-white text-2xl font-bold mt-1">我们的家庭 🏡</h1>
          <p className="text-orange-100 text-xs mt-1">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Members */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">家庭成员</h2>
          <div className="flex gap-4 flex-wrap">
            {members.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <MemberAvatar member={m} size="md" />
              </motion.div>
            ))}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/settings')}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <PlusCircle className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-xs text-gray-400">添加</span>
            </motion.button>
          </div>
        </div>

        {/* Temperature */}
        <TemperatureBar score={stats.totalScore || 0} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '次会议', value: stats.totalMeetings || 0, emoji: '📋' },
            { label: '待办项', value: stats.pendingActions || 0, emoji: '⏰' },
            { label: '已完成', value: stats.completedActions || 0, emoji: '✅' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-3 shadow-sm text-center border border-orange-50"
            >
              <span className="text-2xl">{s.emoji}</span>
              <p className="text-xl font-bold text-gray-800 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Start button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/meeting/new')}
          className="w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          开始新的家庭会议
        </motion.button>

        {/* Recent meetings */}
        {meetings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">最近会议</h2>
              <button onClick={() => navigate('/history')} className="text-xs text-orange-500 flex items-center gap-0.5">
                全部 <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {meetings.map((m, i) => (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/meeting/${m.id}/summary`)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(m.createdAt).toLocaleDateString('zh-CN')} ·{' '}
                      {m.status === 'completed' ? '已完成' : '草稿'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.analysis?.totalScore > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        +{m.analysis.totalScore}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {meetings.length === 0 && (
          <div className="text-center py-8">
            <span className="text-5xl">🌱</span>
            <p className="text-gray-500 mt-3 text-sm">还没有会议记录</p>
            <p className="text-gray-400 text-xs">开始你们家的第一次会议吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
