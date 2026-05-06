// 本地存储操作工具

const KEYS = {
  MEETINGS: 'family_meetings',
  MEMBERS: 'family_members',
  ACTIONS: 'family_actions',
  SETTINGS: 'family_settings',
};

// 默认家庭成员
const DEFAULT_MEMBERS = [
  { id: '1', name: '爸爸', avatar: '👨', color: '#4A90E2', role: 'parent' },
  { id: '2', name: '妈妈', avatar: '👩', color: '#E24A7A', role: 'parent' },
  { id: '3', name: '孩子', avatar: '👦', color: '#F5A623', role: 'child' },
];

const DEFAULT_SETTINGS = {
  familyName: '我的家庭',
  theme: 'warm',
  notificationsEnabled: false,
  cloudSync: false,
  inviteCode: null,
};

// 通用 get/set
function get(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// 会议相关
export function getMeetings() {
  return get(KEYS.MEETINGS, []);
}

export function getMeeting(id) {
  const meetings = getMeetings();
  return meetings.find(m => m.id === id) || null;
}

export function saveMeeting(meeting) {
  const meetings = getMeetings();
  const existing = meetings.findIndex(m => m.id === meeting.id);
  if (existing >= 0) {
    meetings[existing] = meeting;
  } else {
    meetings.unshift(meeting);
  }
  return set(KEYS.MEETINGS, meetings);
}

export function deleteMeeting(id) {
  const meetings = getMeetings().filter(m => m.id !== id);
  return set(KEYS.MEETINGS, meetings);
}

export function createMeeting(title = '') {
  return {
    id: Date.now().toString(),
    title: title || `家庭会议 ${new Date().toLocaleDateString('zh-CN')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transcript: '',
    analysis: null,
    status: 'draft', // draft | completed
    duration: 0,
    participants: [],
  };
}

// 成员相关
export function getMembers() {
  return get(KEYS.MEMBERS, DEFAULT_MEMBERS);
}

export function saveMembers(members) {
  return set(KEYS.MEMBERS, members);
}

export function addMember(member) {
  const members = getMembers();
  members.push({ ...member, id: Date.now().toString() });
  return set(KEYS.MEMBERS, members);
}

export function updateMember(id, updates) {
  const members = getMembers().map(m => m.id === id ? { ...m, ...updates } : m);
  return set(KEYS.MEMBERS, members);
}

export function deleteMember(id) {
  const members = getMembers().filter(m => m.id !== id);
  return set(KEYS.MEMBERS, members);
}

// 行动项相关
export function getActions() {
  return get(KEYS.ACTIONS, []);
}

export function saveAction(action) {
  const actions = getActions();
  const existing = actions.findIndex(a => a.id === action.id);
  if (existing >= 0) {
    actions[existing] = action;
  } else {
    actions.unshift(action);
  }
  return set(KEYS.ACTIONS, actions);
}

export function updateAction(id, updates) {
  const actions = getActions().map(a => a.id === id ? { ...a, ...updates } : a);
  return set(KEYS.ACTIONS, actions);
}

export function deleteAction(id) {
  const actions = getActions().filter(a => a.id !== id);
  return set(KEYS.ACTIONS, actions);
}

// 设置相关
export function getSettings() {
  return get(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
  return set(KEYS.SETTINGS, { ...getSettings(), ...settings });
}

// 统计数据
export function getStats() {
  const meetings = getMeetings();
  const actions = getActions();

  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const totalScore = meetings.reduce((sum, m) => sum + (m.analysis?.totalScore || 0), 0);
  const completedActions = actions.filter(a => a.status === 'completed').length;
  const pendingActions = actions.filter(a => a.status === 'pending').length;

  return {
    totalMeetings: meetings.length,
    completedMeetings,
    totalScore,
    completedActions,
    pendingActions,
    totalActions: actions.length,
  };
}

// 通知相关
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function scheduleNotification(title, body, date) {
  const delay = new Date(date) - new Date();
  if (delay <= 0) return null;

  const timeoutId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  }, delay);

  return timeoutId;
}
