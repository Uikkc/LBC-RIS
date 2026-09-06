# Project Progress & Task Tracking
## LBC-RIS: Academic & Research Information System
**วิทยาลัยสงฆ์เลย (Loei Buddhist College)**

---

## 1. Overall Progress Summary

| Module / Area | Status | Completion % | Notes |
| :--- | :---: | :---: | :--- |
| **Documentation Memory Suite** | **COMPLETED** | 100% | 6 เอกสารหลัก (PRD, Arch, Schema, Plan, Progress, Agents) ครบถ้วน |
| **Phase 1: Foundation & Auth** | **COMPLETED** | 100% | ติดตั้ง Next.js 14, Tailwind, Prisma ORM, SQLite DB, และ Seed Data สำเร็จ |
| **Phase 2: M01 Profile & M02 Repository** | **COMPLETED** | 100% | ฟอร์มสมณศักดิ์สงฆ์/ฉายา, บันทึกผลงาน 4 ประเภท, Gemini AI Summarization |
| **Phase 3: M03 Grants & M04 QA Export** | **COMPLETED** | 100% | ติดตามงวดเงิน/งวดงานวิจัย และ One-Click SAR Export Engine |
| **Phase 4: M05 Executive Dashboard & Public** | **COMPLETED** | 100% | แดชบอร์ดสรุปผลกราฟ Recharts และหน้าทำเนียบอาจารย์สาธารณะ |
| **Phase 5: Quality Hardening & Verification** | **COMPLETED** | 100% | ผ่านการทดสอบ Typecheck 100% (`tsc --noEmit`) และ `next build` สำเร็จสมบูรณ์ |
| **Phase 6: Multi-Tier RBAC & Auth System** | **COMPLETED** | 100% | ระบบสมาชิก 3 ระดับ (Admin, เจ้าหน้าที่สาขา, อาจารย์/นักวิจัยสงฆ์-คฤหัสถ์) พร้อมหน้ายืนยันตัวตนอาจารย์ |
| **Phase 7: Digital Evidence & PDF Vault** | **COMPLETED** | 100% | ระบบอัปโหลดและคลังจัดเก็บไฟล์เอกสารหลักฐานจริง (PDF, DOCX, รูปภาพ) แนบผลงานวิจัยและการตรวจประเมิน SAR |
| **Phase 8: Research Ethics (IRB) & Alert Engine** | **COMPLETED** | 100% | ระบบติดตามจริยธรรมการวิจัยในมนุษย์ (IRB) และศูนย์เตือนภัยเร่งรัดงวดงานวิจัย (Overdue / Due Soon) พร้อมแนบรายงานงวดงาน |
| **Phase 9: Academic Rank Readiness (ก.พ.อ.)** | **COMPLETED** | 100% | ระบบประเมินความพร้อมขอตำแหน่งทางวิชาการ (ผศ./รศ./ศ. Checklist) และบันทึกเอกสารคำสอน/ตำรา |
| **Phase 10: Official GorPorOr 03 & Academic CV** | **COMPLETED** | 100% | ระบบพิมพ์แบบฟอร์ม ก.พ.อ. 03 ทางการ และ Official Academic Curriculum Vitae (Print to PDF) |

---

## 2. Detailed Task Checklist

### Phase 1: Foundation & Data Infrastructure
- [x] **TASK-101: Prisma Schema & Database Initialization**
  - [x] ออกแบบและสร้างไฟล์ `prisma/schema.prisma` รองรับอัตลักษณ์สงฆ์และเกณฑ์ QA
  - [x] ตั้งค่า SQLite Database (Zero-config local execution)
  - [x] รัน `npx prisma db push` และสร้าง Prisma Client สำเร็จ
- [x] **TASK-102: Master Data Seed Script**
  - [x] สร้างไฟล์ `prisma/seed.ts`
  - [x] เพิ่มข้อมูลตั้งต้น 4 สาขาวิชาของวิทยาลัยสงฆ์เลย
  - [x] เพิ่มบัญชีผู้บริหาร (พระครูปริยัติวีราภรณ์, รศ.ดร.), อาจารย์สงฆ์ (พระมหาสมคิด, ผศ.ดร.), อาจารย์ฆราวาส (ผศ.ดร. นงลักษณ์), และเจ้าหน้าที่วิจัย (นายวิชัย)
  - [x] รัน `npx tsx prisma/seed.ts` นำเข้าข้อมูลโครงการวิจัยและผลงานวิชาการสำเร็จ
- [x] **TASK-103: Multi-Role Personas & UI System**
  - [x] ธีมสถาบัน Academic Luminary (`#b80035` Maroon / Crimson Red)
  - [x] ระบบ Navbar สถาบันสงฆ์ พร้อม Quick Persona Switcher

### Phase 2: Core Modules (M01 Profile & M02 Publications)
- [x] **TASK-201: Researcher Profile Form & Identity Handler (`/profile`)**
  - [x] รองรับสมณศักดิ์ (พระครู, พระมหา), ฉายา (ฐิตปุญฺโญ), นามสกุล (Optional) และตำแหน่งวิชาการ
  - [x] API `/api/profile` (GET & PUT) สำหรับดึงและอัปเดตข้อมูล
  - [x] แสดงรายการผลงานวิชาการและโครงการวิจัยของแต่ละบุคคล
- [x] **TASK-202: Publication Management CRUD (`/research`)**
  - [x] บันทึกผลงาน 4 ประเภท (วารสาร, ประชุมวิชาการ, ตำรา, นวัตกรรมสร้างสรรค์)
  - [x] คำนวณค่าน้ำหนัก QA (SAR Score) อัตโนมัติตามดัชนี TCI-1, TCI-2, Scopus และสัดส่วนผู้แต่ง
  - [x] ตัวกรองประเภทและช่องค้นหาผลงาน
- [x] **TASK-203: Gemini AI Abstract & Tag Extraction Integration**
  - [x] โมดูล `src/lib/gemini.ts` เชื่อมต่อ Google Gemini 1.5 Flash API
  - [x] ปุ่ม "สรุปบทคัดย่อด้วย AI" สกัดสาระสำคัญและคีย์เวิร์ดภาษาไทย
  - [x] มี Graceful Heuristic Fallback รองรับกรณี API Timeout/Quota เต็ม (Rule 6)

### Phase 3: Operations (M03 Grants & M04 QA Export)
- [x] **TASK-301: Grant & Milestone Management (`/grants`)**
  - [x] ทะเบียนโครงการวิจัย ทุนภายใน วส.เลย และทุนภายนอก (บพท./วช.)
  - [x] ไทม์ไลน์งวดงาน (Milestones 1, 2, 3) พร้อมการตรวจจับสถานะและงวดเงิน
  - [x] ฟอร์มเพิ่มโครงการวิจัยใหม่
- [x] **TASK-302: QA Weight Calculation & Criteria Engine**
  - [x] สร้าง Logic ใน `src/lib/qa-calculator.ts` ตามเกณฑ์ กพอ./สมศ.
- [x] **TASK-303: SAR Report Excel Export Engine (`/qa-reports`)**
  - [x] API `/api/qa-export` สร้างไฟล์ตาราง SAR สำหรับ Excel (.csv พร้อม UTF-8 BOM รองรับภาษาไทย)
  - [x] สรุปคะแนนผลงานวิจัยรวม และคะแนนเฉลี่ยต่อบุคลากร (50 รูป/คน)

### Phase 4: Executive & Public (M05 Dashboard & Public Directory)
- [x] **TASK-401: Executive Analytics Dashboard (`/`)**
  - [x] KPI Summary Cards (บุคลากร, ผลงานสะสม, ทุนวิจัย active, ยอดงบประมาณรวม)
  - [x] กราฟแนวโน้มผลงานย้อนหลังรายปี (Recharts BarChart)
  - [x] แผนภูมิสัดส่วนงบประมาณตามแหล่งทุน (Recharts PieChart)
  - [x] ตารางเปรียบเทียบผลิตภาพงานวิจัยจำแนกตามสาขาวิชา
- [x] **TASK-402: Public Directory & Search Interface (`/directory`)**
  - [x] หน้าทำเนียบผู้เชี่ยวชาญสำหรับนิสิต 500 รูป/คน และบุคคลภายนอก
  - [x] ระบบค้นหาตามชื่อ, ความเชี่ยวชาญ และตัวกรองสถานะพระภิกษุ/คฤหัสถ์

### Phase 6: Multi-Tier RBAC & Auth System
- [x] **TASK-601: Self-Service Registration & Buddhist Identity Handler (`/register`)**
  - [x] รองรับการสลับสถานะ พระภิกษุ (สมณศักดิ์, ฉายา, นามสกุล optional) / คฤหัสถ์
  - [x] เลือกสังกัด 4 สาขาวิชา พร้อมสร้าง Profile ในสถานะรอตรวจสอบ (`isVerified: false`)
- [x] **TASK-602: Secure Authentication & Session Engine (`/login`)**
  - [x] ระบบ Login ผ่าน Secure Cookie Session พร้อมปุ่ม 1-Click Demo Login
  - [x] สลับทดสอบได้ทั้ง Super Admin, เจ้าหน้าที่ประจำสาขา (Dept Staff) และอาจารย์สงฆ์
- [x] **TASK-603: Department Officer Workspace & Verification Portal (`/department-admin`)**
  - [x] แสดงเฉพาะอาจารย์ในสาขาวิชาที่ตนเองรับผิดชอบ (Data Isolation)
  - [x] ปุ่มตรวจสอบและอนุมัติสถานะอาจารย์ (Verify Badge)

### Phase 7: Digital Evidence & PDF Vault System
- [x] **TASK-701: Digital Evidence Upload API Engine (`/api/upload`)**
  - [x] จัดเก็บไฟล์ลงใน `public/uploads/evidence/` ตรวจสอบนามสกุล (.pdf, .png, .jpg, .docx) ขนาดสูงสุด 25MB
  - [x] ตั้งชื่อไฟล์อัตโนมัติแบบ Timestamped ป้องกันชื่อไฟล์ชนกัน
- [x] **TASK-702: Interactive FileUpload UI Component (`src/components/FileUpload.tsx`)**
  - [x] รองรับ Drag-and-Drop, แสดงขนาดไฟล์, แถบความคืบหน้าการอัปโหลด, ปุ่มดูตัวอย่าง และปุ่มลบไฟล์
- [x] **TASK-703: Publication & Full-Text Evidence Integration (`/research`)**
  - [x] เชื่อมต่อ FileUpload ในโมดอลบันทึกผลงานใหม่
  - [x] แสดง Badge หลักฐาน PDF และปุ่ม "เปิดดูเอกสารฉบับเต็ม (Full-Text PDF)" ในการ์ดผลงาน
- [x] **TASK-704: QA Audit Trail & Real Evidence Link Integration (`/qa-reports`)**
  - [x] เพิ่มคอลัมน์ "เอกสารหลักฐานจริง" ในตาราง SAR พร้อมปุ่มคลิกเปิดดูไฟล์หลักฐานทันที
  - [x] อัปเดต `/api/qa-export` ให้แนบ Link เอกสารหลักฐานจริงลงในไฟล์ Excel/CSV อัตโนมัติ

### Phase 8: Research Ethics (IRB) & Milestone Alert Engine
- [x] **TASK-801: Human Research Ethics (IRB) Schema & Tracker (`/grants`)**
  - [x] ขยายโมเดล `ResearchGrant` รองรับ `irbStatus`, `irbNumber`, `irbApprovalDate`, `irbExpireDate`, `irbFileUrl`
  - [x] แสดง Badge สถานะจริยธรรมในมนุษย์ (ผ่านการรับรอง, รอพิจารณา, หมดอายุ) พร้อมลิงก์เปิดดูใบรับรอง PDF
  - [x] ฟอร์มเพิ่มโครงการวิจัยใหม่รองรับการกรอกข้อมูลและอัปโหลดไฟล์ใบรับรองจริยธรรม
- [x] **TASK-802: Milestone Deadline Urgency Classification Engine**
  - [x] คำนวณวันคงเหลือแบบ Real-time: 🚨 เกินกำหนดส่ง (Overdue), ⚠️ ใกล้ถึงกำหนดส่งใน 30 วัน (Due Soon), 🕒 อยู่ในเกณฑ์ (On Track), ✅ อนุมัติแล้ว
  - [x] แถบสรุปด่วน (Alert Center Banner) ที่หน้า `/grants` พร้อมปุ่มกรอง Filter เฉพาะงวดงานที่มีปัญหา
- [x] **TASK-803: Executive Alert Center & Interactive Milestone Submission**
  - [x] แจ้งเตือนยอดงวดงานค้างส่งบน Dashboard ผู้บริหาร (`/`)
  - [x] โมดอลส่งรายงานงวดงาน (แนบไฟล์รายงาน PDF/DOCX)
  - [x] ปุ่มตรวจรับและอนุมัติงวดงานสำหรับเจ้าหน้าที่ (`PATCH /api/grants`)

### Phase 9: Academic Rank Readiness (ก.พ.อ. Checklist & Evaluator)
- [x] **TASK-901: Academic Rank Evaluation Logic Engine (`src/lib/rank-evaluator.ts`)**
  - [x] ตรวจสอบเกณฑ์ ผศ. (บทความ TCI 2 เรื่อง, First Author ≥ 50%, เอกสารคำสอน 1 รายวิชา, PDF Vault)
  - [x] ตรวจสอบเกณฑ์ รศ. (บทความ TCI-1/Scopus 3 เรื่อง, First Author ≥ 50%, ตำราวิชาการ 1 เล่ม, ครองตำแหน่ง ผศ.)
  - [x] ตรวจสอบเกณฑ์ ศ. (บทความนานาชาติ Scopus 5 เรื่อง, ตำรา 2 เล่ม, ครองตำแหน่ง รศ.)
  - [x] คำนวณเปอร์เซ็นต์ความพร้อม (0-100%) และสังเคราะห์คำแนะนำเชิงกลยุทธ์ (Strategic Gap Advice)
- [x] **TASK-902: Rank Evaluation & Teaching Material API (`src/app/api/academic-rank/route.ts`)**
  - [x] `GET`: ดึงการประเมินความพร้อมของอาจารย์รายบุคคล และรายชื่อคณาจารย์ทั้งหมด
  - [x] `POST`: บันทึกข้อมูลและแนบไฟล์เอกสารประกอบการสอน / ตำราวิชาการ
- [x] **TASK-903: Interactive Rank Checklist & Readiness Meter UI (`src/app/academic-ranks/page.tsx`)**
  - [x] Visual Readiness Gauge แสดงเปอร์เซ็นต์ความพร้อมและสถานะ Ready to Apply
  - [x] 5-Point Detailed Criteria Breakdown พร้อม Accordion แสดงรายชื่อบทความที่เข้าเกณฑ์
  - [x] ปุ่มพิมพ์รายงานสรุปผลการประเมิน (Print-to-PDF)
  - [x] โมดอลบันทึกและแนบไฟล์เอกสารประกอบการสอน/ตำรา
  - [x] เชื่อมต่อเมนูนำทางใน Navbar

### Phase 10: Official GorPorOr 03 & Academic Curriculum Vitae (CV)
- [x] **TASK-1001: Academic CV & GorPorOr 03 Data Engine (`src/app/api/academic-cv/route.ts`)**
  - [x] ดึงข้อมูลอาจารย์แบบองค์รวม: ประวัติ, สมณศักดิ์, ฉายา, ผลงานตีพิมพ์พร้อมสัดส่วนผู้แต่ง (First Author %), ทุนวิจัย, IRB, และเอกสารคำสอน
- [x] **TASK-1002: Print-Ready A4 GorPorOr 03 & Academic CV Layout (`src/app/academic-cv/page.tsx`)**
  - [x] ตราสัญลักษณ์ มจร. และหัวเรื่องราชการ วิทยาลัยสงฆ์เลย
  - [x] โหมดแบบฟอร์ม ก.พ.อ. 03 (ตารางผลงาน สัดส่วนผู้แต่ง ทุนวิจัย และช่องลงนาม 3 ตำแหน่ง: ผู้ขอ, หัวหน้าสาขา, ผอ.วิทยาลัย)
  - [x] โหมด Official Academic Curriculum Vitae (CV) รูปแบบสากลสำหรับยื่นขอทุน บพท./วช.
  - [x] สไตล์การพิมพ์ `@media print` ซ่อนปุ่มและแถบนำทางอัตโนมัติ จัดหน้า A4 คมชัดพร้อมสั่งพิมพ์หรือเซฟ PDF
- [x] **TASK-1003: Integration with Researcher Profile & Academic Rank Evaluator**
  - [x] ปุ่ม "พิมพ์แบบ ก.พ.อ. 03 / CV" ในหน้าโปรไฟล์อาจารย์ (`/profile`)
  - [x] เชื่อมต่อปุ่มพิมพ์ในหน้าระบบประเมินตำแหน่งวิชาการ (`/academic-ranks`)

---

## 3. Verification & Build Results
* `npx tsc --noEmit`: ผ่าน 100% (Zero type errors)
* `npm run build`: สำเร็จ 100% ทั้ง 19 Routes ถูก Optimize และสร้างเรียบร้อย (Static & Dynamic SSR)
* Database: SQLite `dev.db` ผ่านการรัน Migration และ Seed Master Data สมบูรณ์

---

## 4. Architectural Decision & Deviation Log (ADR)
* **[2026-09-06] ADR-001:** เลือกใช้ **Modular Monolith บน Next.js 14+ (App Router)** เพื่อความรวดเร็วในการพัฒนาด้วยเทคนิค Vibe Code และมี Type-Safety ครอบคลุมตั้งแต่ Database ถึง Frontend
* **[2026-09-06] ADR-002:** แยกฟิลด์ `chaya` (ฉายาพระภิกษุ) และ `sanghaStatus` ในตาราง `ResearcherProfile` เพื่อตอบโจทย์อัตลักษณ์ของวิทยาลัยสงฆ์โดยเฉพาะ
* **[2026-09-06] ADR-003:** ใช้ SQLite ผ่าน Prisma ORM ในการรันบนเครื่อง Local Windows เพื่อให้พร้อมใช้งานทันทีโดยไม่ต้องพึ่งพา Docker หรือ MySQL Server ภายนอก และสามารถสลับเป็น PostgreSQL บน Cloud ได้ทันทีผ่านการเปลี่ยน `DATABASE_URL`
* **[2026-09-06] ADR-004:** ขยายโมเดล `ResearchGrant` ใน `prisma/schema.prisma` เพื่อรองรับจริยธรรมการวิจัยในมนุษย์ (IRB - Institutional Review Board) ได้แก่ `irbStatus`, `irbNumber`, `irbApprovalDate`, `irbExpireDate`, `irbFileUrl` และเพิ่ม `PATCH` endpoint เพื่อรองรับวงจรการส่งและอนุมัติงวดงานวิจัยครบวงจร
* **[2026-09-06] ADR-005:** เพิ่มฟิลด์เป้าหมายตำแหน่งทางวิชาการ (`targetRank`, `teachingDocStatus`, `teachingDocTitle`, `teachingDocFileUrl`) ใน `ResearcherProfile` เพื่อสนับสนุนการประเมินความพร้อมและจัดเก็บเอกสารประกอบการสอนตามเกณฑ์ ก.พ.อ.