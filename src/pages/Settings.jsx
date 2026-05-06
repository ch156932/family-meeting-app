import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Edit2, Check, X, Bell, Cloud } from 'lucide-react';
import MemberAvatar from '../components/MemberAvatar';
import { getMembers, saveMembers, getSettings, saveSettings, requestNotificationPermission } from '../utils/storage';

const AVATARS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👤'];
const COLORS = ['#4A90E2', '#E24A7A', '#F5A623', '#7ED321', '#9B59B6', '#1ABC9C', '#E67E22', '#E74C3C'];
const ROLES = ['parent', 'child'];

function MemberEditor({ member, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    avatar: member?.avatar || '👤',
    color: member?.color || '#F5A623',
    role: member?.role || 'parent',
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 space-y-3">
      <div>
        <p className="text-xs text-gray-500 mb-2">选择头像</p>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map(a => (
            <button
              key={a}
              onClick={() => setForm(f => ({ ...f, avatar: a }))}
              className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center ${form.avatar === a ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-50'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">选择颜色</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-8 h-8 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <input
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="成员名称（如：爸爸、小明）"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />

      <div className="flex gap-2">
        {ROLES.map(r => (
          <button
            key={r}
            onClick={() => setForm(f => ({ ...f, role: r }))}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium ${form.role === r ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}
          >
            {r === 'parent' ? '家长' : '孩子'}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 flex items-center justify-center gap-1">
          <X className="w-4 h-4" /> 取消
        </button>
        <button
          onClick={() => form.name.trim() && onSave(form)}
          disabled={!form.name.trim()}
          className="flex-1 py-2 rounded-xl bg-orange-400 text-white text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-40"
        >
          <Check className="w-4 h-4" /> 保存
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [members, setMembers] = useState([]);
  const [settings, setSettingsState] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setMembers(getMembers());
    setSettingsState(getSettings());
  }, []);

  const handleSaveMember = (id, form) => {
    const updated = members.map(m => m.id === id ? { ...m, ...form } : m);
    setMembers(updated);
    saveMembers(updated);
    setEditingId(null);
  };

  const handleAddMember = (form) => {
    const newMember = { id: Date.now().toString(), ...form };
    const updated = [...members, newMember];
    setMembers(updated);
    saveMembers(updated);
    setAdding(false);
  };

  const handleDelete = (id) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    saveMembers(updated);
  };

  const handleSettingChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettingsState(updated);
    saveSettings(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-24">
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-white font-bold text-xl">家庭设置</h1>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Family name */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">家庭名称</p>
          <input
            value={settings.familyName || ''}
            onChange={e => handleSettingChange('familyName', e.target.value)}
            placeholder="给你们家起个名字"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Members */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">家庭成员</p>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-3 py-1 rounded-full"
            >
              <UserPlus className="w-3 h-3" /> 添加
            </button>
          </div>

          <div className="space-y-3">
            {members.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {editingId === m.id ? (
                  <MemberEditor
                    member={m}
                    onSave={(form) => handleSaveMember(m.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-3 py-1">
                    <MemberAvatar member={m} size="sm" showName={false} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.role === 'parent' ? '家长' : '孩子'}</p>
                    </div>
                    <button onClick={() => setEditingId(m.id)} className="text-gray-300 hover:text-orange-400 p-1">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {adding && (
              <MemberEditor
                onSave={handleAddMember}
                onCancel={() => setAdding(false)}
              />
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 space-y-3">
          <p className="text-sm font-semibold text-gray-700">偏好设置</p>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-700">提醒通知</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled || false}
                onChange={async (e) => {
                  if (e.target.checked) {
                    const granted = await requestNotificationPermission();
                    handleSettingChange('notificationsEnabled', granted);
                  } else {
                    handleSettingChange('notificationsEnabled', false);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-400" />
            </label>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-sm text-gray-700">云同步</span>
                <p className="text-xs text-gray-400">需要配置 Firebase</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">开发中</span>
          </div>
        </div>

        {/* App info */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">家庭会议 App v1.0</p>
          <p className="text-xs text-gray-300 mt-1">用爱与沟通，让家更温暖 💛</p>
        </div>
      </div>
    </div>
  );
}
