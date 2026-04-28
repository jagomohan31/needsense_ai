import type { AIAnalysis, NeedCategory, UrgencyLevel, SkillType } from '@/types';

const CATEGORY_MAP: Record<string, NeedCategory> = {
  food: 'food',
  'food & nutrition': 'food',
  medicine: 'medicine',
  medical: 'medicine',
  'medical aid': 'medicine',
  shelter: 'shelter',
  blood: 'blood',
  elderly_help: 'elderly_help',
  elderly: 'elderly_help',
  'elderly help': 'elderly_help',
  'elder care': 'elderly_help',
  disaster: 'disaster',
  'disaster relief': 'disaster',
  emergency: 'disaster',
  education: 'education',
  'mental health': 'others',
  'child welfare': 'others',
  'general support': 'others',
  others: 'others',
  other: 'others',
};

function parseUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export async function analyzeNeedRequest(
  title: string,
  description: string
): Promise<AIAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    const result = await response.json();
    console.log('AI Result:', result);

    if (!result.success) throw new Error(result.error);

    const parsed = result.data;

    const urgencyScore = Math.min(10, Math.max(1, Math.round(Number(parsed.urgencyScore))));

    // ✅ Fixed: API returns "category" not "predictedCategory"
    const rawCategory = (parsed.category || parsed.predictedCategory || 'others').toLowerCase();
    const category = (CATEGORY_MAP[rawCategory] || 'others') as NeedCategory;

    return {
      predictedCategory: category,
      urgencyScore,
      urgencyLevel: parseUrgencyLevel(urgencyScore),
      summary: parsed.summary || title,
      suggestedSkill: (parsed.suggestedSkill || 'other') as SkillType,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) / 100 || 0.75)),
      analysisTimestamp: new Date(),
    };

  } catch (error) {
    console.error('AI error:', error);
    return {
      predictedCategory: 'others',
      urgencyScore: 5,
      urgencyLevel: 'medium',
      summary: title,
      suggestedSkill: 'other',
      confidence: 0,
      analysisTimestamp: new Date(),
    };
  }
}