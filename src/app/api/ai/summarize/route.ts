import { NextResponse } from 'next/server';
import { summarizePublicationWithGemini } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { title, abstract } = await request.json();

    if (!title || !abstract) {
      return NextResponse.json(
        { error: 'กรุณาระบุชื่อเรื่องและบทคัดย่อ' },
        { status: 400 }
      );
    }

    const result = await summarizePublicationWithGemini(title, abstract);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Summarize API Error:', error);
    return NextResponse.json(
      { error: 'ระบบ AI ไม่สามารถประมวลผลได้ในขณะนี้ กรุณากรอกข้อมูลแบบ Manual' },
      { status: 500 }
    );
  }
}