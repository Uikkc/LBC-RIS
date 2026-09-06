import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ขนาดไฟล์เกินกำหนด (สูงสุดไม่เกิน 25 MB)' },
        { status: 400 }
      );
    }

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `รองรับเฉพาะไฟล์เอกสาร ${ALLOWED_EXTENSIONS.join(', ')} เท่านั้น` },
        { status: 400 }
      );
    }

    // Sanitize filename and generate unique name
    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_')
      .slice(0, 50);
    const uniqueFileName = `evidence_${Date.now()}_${sanitizedBase}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'evidence');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/evidence/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: originalName,
      fileSize: file.size,
    }, { status: 201 });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกไฟล์' }, { status: 500 });
  }
}