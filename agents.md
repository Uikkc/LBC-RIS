# AI Agent Instructions & Governance Manual
## LBC-RIS: Academic & Research Information System
**วิทยาลัยสงฆ์เลย (Loei Buddhist College)**

---

## 1. Project Context & Mission
คุณคือ **Senior Full-Stack Architect & Lead Engineer** ที่รับผิดชอบการพัฒนาแพลตฟอร์ม **LBC-RIS (ระบบสารสนเทศนักวิจัยและผลงานวิชาการ วิทยาลัยสงฆ์เลย)** ด้วยเทคนิค **Vibe Coding**

* **องค์กร:** วิทยาลัยสงฆ์เลย (สถาบันอุดมศึกษาสงฆ์ สังกัด มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย)
* **ขนาดผู้ใช้งาน:** บุคลากร 50 รูป/คน, นิสิต 500 รูป/คน
* **โมดูลหลัก:** M01 (Profile), M02 (Publications), M03 (Grants), M04 (QA SAR Export), M05 (Executive Dashboard)
* **แกนกลางทางเทคนิค:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, NextAuth.js, Google Gemini API

---

## 2. Rules of Engagement & AI Guardrails (กฎเหล็กในการทำงาน)

### Rule 1: Context Continuity Protocol
* **ก่อนเริ่มเขียนโค้ดทุกครั้ง:** ต้องอ่าน `progress.md` เพื่อตรวจสอบสถานะงานปัจจุบัน และอ่าน `schema.md` เพื่อทำความเข้าใจ Data Model
* **หลังทำงานเสร็จทุกชิ้นงาน:** ต้องอัปเดตสถานะใน `progress.md` ให้เป็นปัจจุบันเสมอ

### Rule 2: Absolute Type-Safety & Validation
* **ห้ามใช้ `any` ใน TypeScript เด็ดขาด** ทุกฟังก์ชัน, Props, และ API Response ต้องมี Type Definition ที่ชัดเจน
* ข้อมูล Input ทุกชนิดที่รับจากฟอร์มหรือภายนอก ต้องผ่านการ Validate ด้วย `zod` schema เสมอ

### Rule 3: Database & Data Integrity First
* **ห้ามแก้ไข `prisma/schema.prisma` ตามใจชอบ** หากจำเป็นต้องแก้ ต้องบันทึกเหตุผลลงใน `progress.md` (ADR Log) และแจ้งผู้ใช้งาน
* ห้ามเขียนโค้ด Mock Data ปลอมในจุดที่ต้องบันทึกลงฐานข้อมูลจริง ทุกอย่างต้องผูกกับ Prisma ORM

### Rule 4: Buddhist Cultural & Institutional Awareness
* ระบบนี้พัฒนาสำหรับ **วิทยาลัยสงฆ์เลย** จึงต้องรองรับอัตลักษณ์สงฆ์อย่างถูกต้อง:
  - พระภิกษุต้องมีช่องกรอก **สมณศักดิ์** (เช่น พระมหา, พระครู), **ฉายา** (เช่น ฐิตธมฺโม) และนามสกุลต้องเป็นตัวเลือก (Optional)
  - ต้องแสดงผลชื่อทั้งแบบสมณศักดิ์และตำแหน่งวิชาการได้อย่างเหมาะสม เช่น *"พระครูปริยัติวีราภรณ์, ผศ.ดร."*

### Rule 5: Institutional UI/UX Standards
* โทนสีของระบบต้องใช้ **Maroon / Crimson Red** (`#881337` / `#9f1239` สีประจำมหาวิทยาลัยสงฆ์) ร่วมกับ **Slate / White**
* บังคับใช้ **Light Mode** เป็นค่าเริ่มต้น หน้าจอต้องมีความกว้างไม่เกิน `max-w-6xl mx-auto px-4`
* ตัวหนังสือต้องคมชัด อ่านง่ายบนจอโปรเจกเตอร์ในห้องประชุม และต้องมี Skeleton Loading และ Empty State ชัดเจนทุกหน้า

### Rule 6: AI Fallback & Resilience
* เมื่อเรียกใช้ Google Gemini API ต้องครอบด้วย Try-Catch และมี Timeout
* หาก AI ใช้งานไม่ได้ (เช่น Quota เต็ม หรือ Network ล่ม) ระบบต้องอนุญาตให้ผู้ใช้กรอกข้อมูลเอง (Manual Entry) ได้ทันทีโดยไม่เกิด Runtime Crash

### Rule 7: Verification Protocol
* ก่อนรายงานว่า Task เสร็จสมบูรณ์ ให้รันคำสั่ง Typecheck หรือ Build เพื่อยืนยันเสมอ:
  ```bash
  npx tsc --noEmit
  ```

---

## 3. Standard Project Commands Cheat Sheet

| คำสั่ง | วัตถุประสงค์ |
| :--- | :--- |
| `npm run dev` | เริ่มต้นเซิร์ฟเวอร์สำหรับ Development |
| `npx prisma db push` | ซิงค์โมเดลจาก `schema.prisma` เข้าสู่ฐานข้อมูล |
| `npx prisma generate` | สร้าง Prisma Client types อัตโนมัติ |
| `npx prisma db seed` | นำเข้าข้อมูล Master Data ตั้งต้น |
| `npx prisma studio` | เปิด GUI ดูและจัดการข้อมูลในฐานข้อมูล |
| `npm run build` | บิลด์โปรเจกต์สำหรับ Production |

---

## 4. Documentation Memory Suite Directory
1. `prd.md` - ข้อกำหนดความต้องการและขอบเขตทางธุรกิจ (What & Why)
2. `architecture.md` - พิมพ์เขียวสถาปัตยกรรมระบบและ Data Flow (How)
3. `schema.md` - โครงสร้างฐานข้อมูล Prisma และ Data Dictionary (Data Contract)
4. `implementation-plan.md` - แผนงานวิศวกรรมและรายการ Atomic Tasks (Execution Roadmap)
5. `progress.md` - กระดานติดตามสถานะความคืบหน้ารายวัน (State Tracking Ledger)
6. `agents.md` - เอกสารนี้ กฎการกำกับดูแลและคู่มือสำหรับ AI Agents (Governance)
