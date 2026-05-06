// 规则式总结引擎

const POSITIVE_KEYWORDS = [
  '好', '棒', '进步', '努力', '认真', '帮助', '改善', '完成', '坚持',
  '主动', '积极', '表扬', '不错', '做到', '成功', '厉害', '优秀', '勤快',
  '负责', '按时', '准时', '整理', '清洁', '干净', '礼貌', '懂事',
  '听话', '合作', '分享', '感谢', '谢谢', '爱', '关心', '体贴',
  '细心', '耐心', '开心', '快乐', '高兴', '满意', '欣慰', '骄傲',
];

const NEGATIVE_KEYWORDS = [
  '问题', '不好', '需要', '应该', '改进', '困难', '烦', '闹心',
  '拖', '不听', '忘记', '没做', '迟到', '乱', '脏', '懒', '逃避',
  '撒谎', '打架', '吵架', '抱怨', '推卸', '责任', '不认真', '马虎',
  '浪费', '不节约', '沉迷', '过度', '熬夜', '晚睡', '不吃',
  '挑食', '不完成', '放弃', '消极', '抵触',
];

const ACTION_TEMPLATES = [
  '每天坚持做到',
  '本周内完成',
  '从明天开始',
  '每次记得',
  '养成习惯：',
];

const IMPROVEMENT_TEMPLATES = {
  '拖': '制定计划，设置提醒，按时完成任务',
  '忘记': '用便签或手机提醒，养成记录习惯',
  '不听': '先理解对方意图，再表达自己想法',
  '迟到': '提前做好准备，设置闹钟提醒',
  '乱': '每天花5分钟整理个人物品',
  '懒': '把大任务拆分成小步骤，逐步完成',
  '撒谎': '鼓励诚实沟通，营造信任环境',
  '吵架': '冷静三秒再说话，用温和的方式表达',
  '熬夜': '设定固定就寝时间，减少睡前屏幕时间',
  '挑食': '尝试每周吃一种新食物，营养均衡',
  '浪费': '养成节约习惯，需要时才取用',
  'default': '一起讨论具体的改进方案，互相支持',
};

const SCORE_WEIGHTS = {
  high: { min: 18, max: 25 },  // 强烈正向词
  medium: { min: 12, max: 18 }, // 一般正向词
  low: { min: 8, max: 12 },    // 轻度正向词
};

const HIGH_VALUE_WORDS = ['努力', '坚持', '主动', '负责', '完成', '进步'];

function getScore(sentence) {
  const hasHighValue = HIGH_VALUE_WORDS.some(w => sentence.includes(w));
  const range = hasHighValue ? SCORE_WEIGHTS.high : SCORE_WEIGHTS.medium;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function getImprovement(sentence) {
  for (const [keyword, improvement] of Object.entries(IMPROVEMENT_TEMPLATES)) {
    if (keyword !== 'default' && sentence.includes(keyword)) {
      return improvement;
    }
  }
  return IMPROVEMENT_TEMPLATES.default;
}

function extractSentences(text) {
  // 按标点符号分割句子
  return text
    .split(/[。！？，,!?.;\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

function countKeywords(sentence, keywords) {
  return keywords.filter(kw => sentence.includes(kw)).length;
}

export function analyzeMeeting(transcript, members = []) {
  const sentences = extractSentences(transcript);
  const positives = [];
  const negatives = [];
  const neutral = [];

  sentences.forEach(sentence => {
    const posCount = countKeywords(sentence, POSITIVE_KEYWORDS);
    const negCount = countKeywords(sentence, NEGATIVE_KEYWORDS);

    if (posCount > negCount && posCount > 0) {
      // 尝试关联成员
      const relatedMember = members.find(m => sentence.includes(m.name));
      positives.push({
        id: Date.now() + Math.random(),
        text: sentence,
        score: getScore(sentence),
        member: relatedMember || null,
        keywords: POSITIVE_KEYWORDS.filter(kw => sentence.includes(kw)),
      });
    } else if (negCount > posCount && negCount > 0) {
      const relatedMember = members.find(m => sentence.includes(m.name));
      const improvement = getImprovement(sentence);
      negatives.push({
        id: Date.now() + Math.random(),
        text: sentence,
        improvement,
        member: relatedMember || null,
        keywords: NEGATIVE_KEYWORDS.filter(kw => sentence.includes(kw)),
        actionTemplate: ACTION_TEMPLATES[Math.floor(Math.random() * ACTION_TEMPLATES.length)],
        actionText: '',
        status: 'pending',
        dueDate: null,
      });
    } else if (sentence.length > 5) {
      neutral.push(sentence);
    }
  });

  const totalScore = positives.reduce((sum, p) => sum + p.score, 0);

  return {
    positives,
    negatives,
    neutral,
    totalScore,
    summary: generateSummary(positives, negatives, transcript),
    keyPoints: extractKeyPoints(sentences),
  };
}

function generateSummary(positives, negatives, transcript) {
  const posCount = positives.length;
  const negCount = negatives.length;

  if (posCount === 0 && negCount === 0) {
    return '本次会议进行了充分的家庭交流，大家坦诚地分享了各自的想法和感受。';
  }

  let summary = '本次家庭会议';
  if (posCount > 0) {
    summary += `记录了 ${posCount} 项值得表扬的进步`;
  }
  if (negCount > 0) {
    if (posCount > 0) summary += '，同时也';
    summary += `讨论了 ${negCount} 个需要共同改进的方面`;
  }
  summary += '。大家通过坦诚沟通，增进了相互理解，共同为家庭成长努力。';

  return summary;
}

function extractKeyPoints(sentences) {
  // 提取包含关键词最多的句子作为要点
  return sentences
    .map(s => ({
      text: s,
      score: countKeywords(s, [...POSITIVE_KEYWORDS, ...NEGATIVE_KEYWORDS]),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.text);
}

export function generateActionItem(negativeItem) {
  return {
    id: Date.now() + Math.random(),
    sourceText: negativeItem.text,
    action: negativeItem.actionTemplate + negativeItem.improvement,
    member: negativeItem.member,
    status: 'pending',
    dueDate: null,
    feedback: null,
    createdAt: new Date().toISOString(),
  };
}
