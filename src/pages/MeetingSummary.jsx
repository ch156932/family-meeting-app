import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ThumbsUp, AlertTriangle, FileText, CheckSquare } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';
import CelebrationOverlay from '../components/CelebrationOverlay';
import { getMeeting } from '../utils/storage';

function ImprovementCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
          {item.member && (
            <span className="text-xs text-blue-600 mt-1 inline-block">
              {item.member.avatar} {item.member.name}
            </span>
          )}
          <div className="mt-2 bg-white rounded-xl p-3 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">💡 改善建议</p>
            <p className="text-xs text-gray-600">{item.actionTemplate}{item.improvement}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MeetingSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [meeting, setMeeting] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState('positives');

  useEffect(() => {
    const m = getMeeting(id);
    setMeeting(m);
    if (location.state?.isNew) {
      setTimeout(() => setShowCelebration(true), 500);
    }
  }, [id, location.state]);

  if (!meeting) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-gray-400">会议记录不存在</p>
      </div>
    );
  }

  const { analysis } = meeting;
  const tabs = [
    { id: 'positives', label: `优点 (${analysis?.positives?.length || 0})`, icon: ThumbsUp },
    { id: 'negatives', label: `改善 (${analysis?.negatives?.length || 0})`, icon: AlertTriangle },
    { id: 'summary', label: '总结', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-8">
      <CelebrationOverlay
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        totalScore={analysis?.totalScore || 0}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-white/80">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl">会议总结</h1>
            <p className="text-orange-100 text-xs">{meeting.title}</p>
          </div>
          {analysis?.totalScore > 0 && (
            <div className="bg-white/20 rounded-2xl px-3 py-1.5 text-center">
              <p className="text-white font-bold text-lg">+{analysis.totalScore}</p>
              <p className="text-orange-100 text-xs">积分</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 shadow-sm flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'positives' && (
          <div className="space-y-3">
            {analysis?.positives?.length > 0 ? (
              analysis.positives.map((item, i) => (
                <ScoreCard key={item.id} item={item} index={i} />
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl">💭</span>
                <p className="text-gray-400 text-sm mt-2">暂未识别到具体优点</p>
                <p className="text-gray-400 text-xs">会议内容中可以多提及正向表现哦</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'negatives' && (
          <div className="space-y-3">
            {analysis?.negatives?.length > 0 ? (
              analysis.negatives.map((item, i) => (
                <ImprovementCard key={item.id} item={item} index={i} />
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl">🌟</span>
                <p className="text-gray-400 text-sm mt-2">太棒了！没有发现需要改善的地方</p>
              </div>
            )}

            {analysis?.negatives?.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/actions')}
                className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                查看待办行动项
              </motion.button>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-500" /> 会议摘要
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {analysis?.summary || '暂无摘要'}
              </p>
            </div>

            {analysis?.keyPoints?.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">关键要点</h3>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-orange-400 font-bold mt-0.5">·</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">原始记录</h3>
              <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                {meeting.transcript || '无记录'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
