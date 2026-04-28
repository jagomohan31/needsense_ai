import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key found:', apiKey ? 'YES - ' + apiKey.substring(0, 10) : 'NO');

    if (!apiKey) {
      console.warn('No API key - using fallback');
      return NextResponse.json({ success: true, data: buildFallback(title, description) });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are an AI assistant for an NGO resource allocation platform.
Analyze this volunteer request and return ONLY a raw JSON object. No markdown. No backticks. No explanation. Just JSON.

Title: ${title}
Description: ${description}

Return exactly this structure:
{
  "category": "one of: Medicine, Food, Education, Shelter, Disaster Relief, Mental Health, Elderly Help, Child Welfare, Blood, Others",
  "urgencyScore": <number 1-10>,
  "summary": "<2 sentence summary>",
  "suggestedSkill": "<one skill needed>",
  "confidence": <number 0-100>
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Gemini raw response:', text);

      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      return NextResponse.json({ success: true, data: parsed });

    } catch (geminiError: any) {
      console.error('Gemini error:', geminiError.message);

      if (
        geminiError?.message?.includes('429') ||
        geminiError?.message?.includes('quota') ||
        geminiError?.message?.includes('Too Many Requests') ||
        geminiError?.message?.includes('API key not valid') ||
        geminiError?.message?.includes('400')
      ) {
        console.warn('Gemini unavailable - using smart fallback');
        return NextResponse.json({ success: true, data: buildFallback(title, description) });
      }

      throw geminiError;
    }

  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function buildFallback(title: string, description: string) {
  const text = (title + ' ' + description).toLowerCase();

  let category = 'Others';
  let suggestedSkill = 'General Volunteering';
  let urgencyScore = 5;

  if (text.match(/oxygen|medical|doctor|health|medicine|sick|hospital|patient|breathing|injury|ambulance|nurse|surgery|clinic/)) {
    category = 'Medicine';
    suggestedSkill = 'Medical Assistance';
    urgencyScore = 9;

  } else if (text.match(/blood|donate blood|blood bank|plasma/)) {
    category = 'Blood';
    suggestedSkill = 'Blood Donation';
    urgencyScore = 9;

  } else if (text.match(/food|hunger|meal|nutrition|feed|eat|starv|ration|grain|cook/)) {
    category = 'Food';
    suggestedSkill = 'Food Distribution';
    urgencyScore = 7;

  } else if (text.match(/school|teach|education|learn|tutor|study|class|student|book|pencil/)) {
    category = 'Education';
    suggestedSkill = 'Teaching';
    urgencyScore = 5;

  } else if (text.match(/shelter|house|homeless|roof|sleep|tent|accommodation|displaced|rain|blanket/)) {
    category = 'Shelter';
    suggestedSkill = text.match(/build|construct|repair|fix|wall|brick|cement/) 
      ? 'Construction' 
      : 'Relief Supply';
    urgencyScore = 8;

  } else if (text.match(/flood|fire|disaster|earthquake|storm|cyclone|tsunami|rescue|emergency/)) {
    category = 'Disaster Relief';
    suggestedSkill = 'Emergency Response';
    urgencyScore = 10;

  } else if (text.match(/mental|stress|anxiety|counsel|depress|trauma|grief|suicide|psychological/)) {
    category = 'Mental Health';
    suggestedSkill = 'Counseling';
    urgencyScore = 6;

  } else if (text.match(/elder|senior|old|aged|retire|grandp/)) {
    category = 'Elderly Help';
    suggestedSkill = 'Elderly Assistance';
    urgencyScore = 6;

  } else if (text.match(/child|kid|baby|orphan|youth|infant|minor|toddler/)) {
    category = 'Child Welfare';
    suggestedSkill = 'Childcare';
    urgencyScore = 7;
  }

  return {
    category,
    urgencyScore,
    summary: `This is a ${category} request requiring urgent attention. Volunteers with ${suggestedSkill} skills are needed immediately.`,
    suggestedSkill,
    confidence: 75,
    fallback: true
  };
}