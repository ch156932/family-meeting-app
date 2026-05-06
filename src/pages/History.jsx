import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Trash2, TrendingUp } from 'lucide-react';
import { getMeetings, deleteMeeting } from '../utils/storage';

function ScoreChart({ meetings }) {
  if (meetings.length < 2) return null;
  const scores = meetings.slice().reverse().slice(-10).map(m => m.analysis?.totalScore || 0);
  const maxScore = Math.max(...scores, 1);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
        <TrendingUp className="w-4 h-4 text-orange-500" /> 成长轨迹
      </h3>
      <div className="flex items-end gap-1 h-20">
        {scores.map((score, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(score / maxScore) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="flex-1 bg-gradient-to-t from-orange-400 to-amber-300 rounded-t-lg min-h-[4px]"
            title={`+${score}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">最早</span>
        <span className="text-xs text-gray-400">最近</span>
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  const handleDelete = (id) => {
    deleteMeeting(id);
    setMeetings(getMeetings());
    setConfirmDelete(null);
  };

  const totalScore = meetings.reduce((s, m) => s + (m.analysis?.totalScore || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-white font-bold text-xl">历史记录</h1>
        <p className="text-orange-100 text-xs mt-1">
          共 {meetings.length} 次会议 · 累计 +{totalScore} 积分
        </p>
      </div>

      <div className="px-4 mt-5 space-y-4">
        <ScoreChart meetings={meetings} />

        {meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/meeting/${m.id}/summary`)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(m.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
                      })}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {m.analysis?.positives?.length > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          👍 {m.analysis.positives.length} 项优点
                        </span>
                      )}
                      {m.analysis?.negatives?.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          📝 {m.analysis.negatives.length} 项改善
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {m.analysis?.totalScore > 0 && (
                      <span className="text-sm font-bold text-orange-500">+{m.analysis.totalScore}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>

                {confirmDelete === m.id ? (
                  <div className="border-t border-red-100 bg-red-50 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-red-600">确认删除此会议记录？</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-gray-500 px-3 py-1 bg-white rounded-lg border"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-xs text-white px-3 py-1 bg-red-500 rounded-lg"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(m.id)}
                    className="w-full border-t border-gray-50 py-2 flex items-center justify-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> 删除
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl">📚</span>
            <p className="text-gray-500 text-sm mt-3">还没有历史记录</p>
            <p className="text-gray-400 text-xs">完成家庭会议后，记录将保存在这里</p>
          </div>
        )}
      </div>
    </div>
  );
}
