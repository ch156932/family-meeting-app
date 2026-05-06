import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Square, Edit3, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import RecordingWave from '../components/RecordingWave';
import { createMeeting, saveMeeting, saveAction, getMembers } from '../utils/storage';
import { analyzeMeeting } from '../utils/summarizer';

export default function NewMeeting() {
  const navigate = useNavigate();
  const [meeting] = useState(createMeeting);
  const [editMode, setEditMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const [duration, setDuration] = useState(0);
  const [members] = useState(getMembers);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  const {
    isListening, transcript, interimTranscript,
    isSupported, error,
    startListening, stopListening, resetTranscript, setManualTranscript,
  } = useSpeechRecognition();

  // Timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleFinish = () => {
    const finalTranscript = editMode ? manualText : transcript;
    if (!finalTranscript.trim()) return;

    const analysis = analyzeMeeting(finalTranscript, members);
    const completed = {
      ...meeting,
      transcript: finalTranscript,
      analysis,
      status: 'completed',
      duration,
      updatedAt: new Date().toISOString(),
      // Save action items
      actions: analysis.negatives.map(n => ({
        id: Date.now() + Math.random(),
        sourceText: n.text,
        action: n.actionTemplate + n.improvement,
        member: n.member,
        status: 'pending',
        dueDate: null,
        feedback: null,
        createdAt: new Date().toISOString(),
        meetingId: meeting.id,
      })),
    };
    saveMeeting(completed);
    completed.actions.forEach(a => saveAction(a));

    navigate(`/meeting/${meeting.id}/summary`, { state: { isNew: true } });
  };

  const handleToggleEdit = () => {
    if (!editMode) {
      setManualText(transcript);
    } else {
      setManualTranscript(manualText);
    }
    setEditMode(!editMode);
  };

  const fullText = transcript + (interimTranscript ? `${interimTranscript}` : '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-white/80">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl">开始家庭会议</h1>
            <p className="text-orange-100 text-xs">{meeting.title}</p>
          </div>
          <span className="text-white font-mono text-lg font-bold">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Recording area */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 text-center">
          <RecordingWave isRecording={isListening} />

          <div className="mt-4 flex items-center justify-center gap-4">
            {!isListening ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={startListening}
                disabled={!isSupported || editMode}
                className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={stopListening}
                  className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Square className="w-7 h-7 text-white fill-white" />
                </motion.button>
              </>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {isListening ? '正在录音... 点击停止' : '点击麦克风开始录音'}
          </p>

          {!isSupported && (
            <div className="flex items-center gap-2 mt-2 text-amber-600 text-xs justify-center">
              <AlertCircle className="w-4 h-4" />
              浏览器不支持语音识别，请手动输入
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">转写内容</h3>
            <button
              onClick={handleToggleEdit}
              className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-3 py-1 rounded-full"
            >
              <Edit3 className="w-3 h-3" />
              {editMode ? '完成编辑' : '手动编辑'}
            </button>
          </div>

          {editMode ? (
            <textarea
              ref={textareaRef}
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="在此输入或编辑会议内容..."
              className="w-full min-h-[200px] text-sm text-gray-700 bg-orange-50 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 leading-relaxed"
            />
          ) : (
            <div className="min-h-[200px] bg-gray-50 rounded-2xl px-4 py-3">
              {fullText ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-400 italic">{interimTranscript}</span>
                  )}
                </p>
              ) : (
                <p className="text-gray-400 text-sm text-center mt-8">
                  录音内容将在此实时显示...
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2 text-right">
            {(editMode ? manualText : transcript).length} 字
          </p>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs text-amber-700 font-semibold mb-1">💡 小提示</p>
          <p className="text-xs text-amber-600">
            说话时尽量清晰，普通话识别效果更好。可以说出家庭成员的名字来关联评分，例如"爸爸今天很努力"。
          </p>
        </div>

        {/* Finish button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFinish}
          disabled={!(editMode ? manualText : transcript).trim()}
          className="w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <CheckCircle className="w-5 h-5" />
          完成会议并生成总结
        </motion.button>
      </div>
    </div>
  );
}
