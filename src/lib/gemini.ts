import { GoogleGenerativeAI } from "@google/generative-ai";

interface AiSummaryResult {
  summary: string;
  keywords: string[];
  suggestedType: string;
  source: "AI_GENERATED" | "FALLBACK_HEURISTIC";
}

export async function summarizePublicationWithGemini(
  title: string,
  abstractText: string
): Promise<AiSummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Rule 6: AI Fallback & Resilience - Try-catch with timeout
  if (!apiKey || apiKey.includes("Dummy")) {
    return generateFallbackSummary(title, abstractText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
คุณคือผู้ช่วยวิเคราะห์งานวิชาการของวิทยาลัยสงฆ์เลย สถาบันอุดมศึกษาสงฆ์
โปรดวิเคราะห์ชื่อเรื่องและบทคัดย่อดังต่อไปนี้:
ชื่อเรื่อง: ${title}
บทคัดย่อ: ${abstractText}

กรุณาตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "summary": "สรุปสาระสำคัญของงานวิจัย 3-4 บรรทัด ภาษาไทย เข้าใจง่าย ชัดเจน",
  "keywords": ["คำสำคัญ1", "คำสำคัญ2", "คำสำคัญ3", "คำสำคัญ4"],
  "suggestedType": "JOURNAL" หรือ "CONFERENCE" หรือ "BOOK" หรือ "CREATIVE_WORK"
}
`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API Timeout")), 8000)
      ),
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      summary: parsed.summary || abstractText.slice(0, 200),
      keywords: parsed.keywords || ["พุทธศาสตร์", "วิจัยเชิงพื้นที่"],
      suggestedType: parsed.suggestedType || "JOURNAL",
      source: "AI_GENERATED",
    };
  } catch (error) {
    console.warn("Gemini API call failed, activating graceful fallback:", error);
    return generateFallbackSummary(title, abstractText);
  }
}

function generateFallbackSummary(title: string, abstractText: string): AiSummaryResult {
  const words = abstractText.split(/\s+/).filter(w => w.length > 3);
  const detectedKeywords = Array.from(new Set(words)).slice(0, 4);
  
  return {
    summary: abstractText.length > 250 
      ? abstractText.substring(0, 240) + "..." 
      : abstractText || `บทความวิชาการเรื่อง "${title}" มุ่งเน้นการศึกษาและวิเคราะห์เชิงลึกตามหลักพุทธปรัชญาและสังคมร่วมสมัย`,
    keywords: detectedKeywords.length > 0 ? detectedKeywords : ["พระพุทธศาสนา", "การศึกษา", "วัฒนธรรมท้องถิ่น"],
    suggestedType: "JOURNAL",
    source: "FALLBACK_HEURISTIC",
  };
}
