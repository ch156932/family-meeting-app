import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Circle, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { updateAction } from '../utils/storage';

const STATUS_CONFIG = {
  pending: { icon: Circle, label: '待完成', color: 'text-gray-400', bg: 'bg-gray-50' },
  inprogress: { icon: Clock, label: '进行中', color: 'text-blue-500', bg: 'bg-blue-50' },
  completed: { icon: CheckCircle, label: '已完成', color: 'text-green-500', bg: 'bg-green-50' },
};

const FEEDBACK_EMOJIS = ['😊', '😄', '🥳', '💪', '🌟', '❤️', '👍', '🎉'];

export default function ActionCard({ action, onUpdate, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackText, setFeedbackText] = useState(action.feedback?.text || '');
  const status = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const cycleStatus = () => {
    const order = ['pending', 'inprogress', 'completed'];
    const next = order[(order.indexOf(action.status) + 1) % order.length];
    const updated = { ...action, status: next };
    updateAction(action.id, { status: next });
    onUpdate?.(updated);
  };

  const saveFeedback = (emoji) => {
    const updated = { ...action, feedback: { text: feedbackText, emoji, date: new Date().toISOString() } };
    updateAction(action.id, { feedback: updated.feedback });
    onUpdate?.(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`${status.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <button onClick={cycleStatus} className="mt-0.5 flex-shrink-0">
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-relaxed ${action.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {action.action}
          </p>
          {action.member && (
            <span className="text-xs text-gray-500">
              {action.member.avatar} {action.member.name} · {status.label}
            </span>
          )}
          {action.dueDate && (
            <div className="flex items-center gap-1 mt-1">
              <Bell className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-orange-500">
                {new Date(action.dueDate).toLocaleDateString('zh-CN')}
              </span>
            </div>
          )}
          {action.feedback && (
            <div className="mt-2 flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
              <span className="text-lg">{action.feedback.emoji}</span>
              <span className="text-xs text-gray-600">{action.feedback.text}</span>
            </div>
          )}
        </div>

        <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 border-t border-gray-100 pt-3"
        >
          <p className="text-xs text-gray-500 mb-2">原始记录：{action.sourceText}</p>
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="记录执行心得..."
            className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={2}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {FEEDBACK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => saveFeedback(emoji)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
