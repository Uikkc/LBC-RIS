import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.researchUtilization.deleteMany({});
  await prisma.grantMilestone.deleteMany({});
  await prisma.grantMember.deleteMany({});
  await prisma.publicationAuthor.deleteMany({});
  await prisma.publication.deleteMany({});
  await prisma.researchGrant.deleteMany({});
  await prisma.researcherProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Seeding Departments of Loei Buddhist College...');
  const dptBud = await prisma.department.create({
    data: {
      code: 'DPT-BUD',
      nameTh: 'สาขาวิชาพระพุทธศาสนา',
      nameEn: 'Department of Buddhist Studies',
    },
  });

  const dptThai = await prisma.department.create({
    data: {
      code: 'DPT-THAI',
      nameTh: 'สาขาวิชาการสอนภาษาไทย',
      nameEn: 'Department of Teaching Thai',
    },
  });

  const dptPol = await prisma.department.create({
    data: {
      code: 'DPT-POL',
      nameTh: 'สาขาวิชารัฐศาสตร์',
      nameEn: 'Department of Political Science',
    },
  });

  const dptEda = await prisma.department.create({
    data: {
      code: 'DPT-EDA',
      nameTh: 'สาขาวิชาการบริหารการศึกษา',
      nameEn: 'Department of Educational Administration',
    },
  });

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  console.log('Seeding 3-Tier Users...');
  // 1. Super Admin (ผู้ดูแลระบบกลาง)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@lbc.ac.th',
      passwordHash: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      isApproved: true,
      profile: {
        create: {
          departmentId: dptBud.id,
          sanghaStatus: 'LAITY',
          prefix: 'นาย',
          firstName: 'สมหมาย',
          lastName: 'ผู้ดูแลระบบกลาง',
          academicRank: 'NONE',
          email: 'admin@lbc.ac.th',
          phone: '042-811-000',
          expertises: JSON.stringify(['ระบบสารสนเทศ', 'บริหารงานวิจัย']),
        },
      },
    },
    include: { profile: true },
  });

  // 2. Department Staff (เจ้าหน้าที่ประจำสาขาวิชาพระพุทธศาสนา)
  const staffBud = await prisma.user.create({
    data: {
      email: 'staff.bud@lbc.ac.th',
      passwordHash: defaultPasswordHash,
      role: 'DEPT_STAFF',
      isApproved: true,
      managedDeptId: dptBud.id,
      profile: {
        create: {
          departmentId: dptBud.id,
          sanghaStatus: 'LAITY',
          prefix: 'นางสาว',
          firstName: 'กัญญา',
          lastName: 'พุทธรักษ์',
          academicRank: 'NONE',
          email: 'staff.bud@lbc.ac.th',
          phone: '042-811-101',
          expertises: JSON.stringify(['ธุรการวิชาการสาขาวิชาพระพุทธศาสนา']),
        },
      },
    },
    include: { profile: true },
  });

  // 3. Faculty Monk (อาจารย์พระภิกษุ สาขาวิชาพระพุทธศาสนา)
  const userMonk = await prisma.user.create({
    data: {
      email: 'somkid@lbc.ac.th',
      passwordHash: defaultPasswordHash,
      role: 'RESEARCHER',
      isApproved: true,
      profile: {
        create: {
          departmentId: dptBud.id,
          sanghaStatus: 'MONK',
          prefix: 'พระมหาสมคิด',
          firstName: 'สมคิด',
          chaya: 'ชินวํโส',
          academicRank: 'ASST_PROF',
          email: 'somkid@lbc.ac.th',
          phone: '081-999-xxxx',
          expertises: JSON.stringify(['พุทธจิตวิทยา', 'การไกล่เกลี่ยข้อพิพาทชุมชน', 'คัมภีร์ใบลานอีสาน']),
          orcidId: '0000-0003-4567-8910',
          googleScholar: 'https://scholar.google.com/citations?user=somkid_chin',
        },
      },
    },
    include: { profile: true },
  });

  // 4. Executive Monk (ผู้อำนวยการวิทยาลัย)
  const userExec = await prisma.user.create({
    data: {
      email: 'director@lbc.ac.th',
      passwordHash: defaultPasswordHash,
      role: 'EXECUTIVE',
      isApproved: true,
      profile: {
        create: {
          departmentId: dptBud.id,
          sanghaStatus: 'MONK',
          prefix: 'พระครูปริยัติวีราภรณ์',
          firstName: 'สมหมาย',
          chaya: 'ฐิตปุญฺโญ',
          academicRank: 'ASSOC_PROF',
          email: 'director@lbc.ac.th',
          phone: '042-811-xxx',
          expertises: JSON.stringify(['พระพุทธศาสนากับการพัฒนาสังคม', 'ปรัชญาเถรวาท', 'วิจัยเชิงพื้นที่ลุ่มน้ำเลย']),
          orcidId: '0000-0002-1823-9214',
          googleScholar: 'https://scholar.google.com/citations?user=lbc_director',
        },
      },
    },
    include: { profile: true },
  });

  // 5. Faculty Lay Researcher (อาจารย์คฤหัสถ์ สาขาวิชาการบริหารการศึกษา)
  const userQA = await prisma.user.create({
    data: {
      email: 'nonglak@lbc.ac.th',
      passwordHash: defaultPasswordHash,
      role: 'RESEARCHER',
      isApproved: true,
      profile: {
        create: {
          departmentId: dptEda.id,
          sanghaStatus: 'LAITY',
          prefix: 'ผศ.ดร.',
          firstName: 'นงลักษณ์',
          lastName: 'บุญมี',
          academicRank: 'ASST_PROF',
          email: 'nonglak@lbc.ac.th',
          phone: '089-123-4567',
          expertises: JSON.stringify(['การประกันคุณภาพการศึกษา', 'ภาวะผู้นำทางวิชาการ', 'การบริหารหลักสูตร']),
          orcidId: '0000-0001-9876-5432',
        },
      },
    },
    include: { profile: true },
  });

  console.log('Seeding Grants...');
  const grant1 = await prisma.researchGrant.create({
    data: {
      projectCode: 'LBC-GRT-2567-001',
      titleTh: 'การพัฒนารูปแบบการเสริมสร้างสุขภาวะชุมชนตามหลักพระพุทธศาสนาในจังหวัดเลย',
      titleEn: 'Development of Buddhist Well-being Enhancement Model in Loei Province Communities',
      fundingSource: 'หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่ (บพท.)',
      grantType: 'EXTERNAL',
      totalBudget: 450000.0,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-01-14'),
      status: 'IN_PROGRESS',
      // จริยธรรมการวิจัยในมนุษย์ (IRB)
      irbStatus: 'APPROVED',
      irbNumber: 'MCU-IRB-2567/012',
      irbApprovalDate: new Date('2024-02-01'),
      irbExpireDate: new Date('2025-01-31'),
      irbFileUrl: '/uploads/evidence/sample_buddhist_research.pdf',
      members: {
        create: [
          { profileId: userExec.profile!.id, role: 'หัวหน้าโครงการ' },
          { profileId: userMonk.profile!.id, role: 'ผู้ร่วมวิจัย' },
        ],
      },
      milestones: {
        create: [
          {
            milestoneNumber: 1,
            title: 'รายงานความก้าวหน้างวดที่ 1 และทบทวนวรรณกรรม',
            dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // ผ่านมาแล้ว 60 วัน
            submittedDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
            disbursementAmount: 180000.0,
            status: 'APPROVED',
            deliverableFileUrl: '/uploads/evidence/sample_buddhist_research.pdf',
          },
          {
            milestoneNumber: 2,
            title: 'รายงานผลการลงพื้นที่เก็บข้อมูลภาคสนาม 14 อำเภอ',
            dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // อีก 12 วัน (DUE_SOON)
            disbursementAmount: 180000.0,
            status: 'PENDING',
          },
          {
            milestoneNumber: 3,
            title: 'รายงานการวิจัยฉบับสมบูรณ์ (ปิดโครงการ)',
            dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
            disbursementAmount: 90000.0,
            status: 'PENDING',
          },
        ],
      },
    },
  });

  const grant2 = await prisma.researchGrant.create({
    data: {
      projectCode: 'LBC-GRT-2567-002',
      titleTh: 'การจัดการความรู้ภูมิปัญญาท้องถิ่นเชิงพุทธเพื่อส่งเสริมการท่องเที่ยวเชิงวัฒนธรรมอำเภอเชียงคาน จังหวัดเลย',
      titleEn: 'Buddhist Local Wisdom Management for Cultural Tourism in Chiang Khan, Loei',
      fundingSource: 'กองทุนวิจัยพัฒนาวิทยาลัยสงฆ์เลย',
      grantType: 'INTERNAL',
      totalBudget: 120000.0,
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      // อยู่ระหว่างขอรับรองจริยธรรม
      irbStatus: 'UNDER_REVIEW',
      irbNumber: 'อยู่ระหว่างพิจารณา (MCU-IRB-REV-045)',
      members: {
        create: [
          { profileId: userMonk.profile!.id, role: 'หัวหน้าโครงการ' },
          { profileId: userQA.profile!.id, role: 'ผู้ร่วมวิจัย' },
        ],
      },
      milestones: {
        create: [
          {
            milestoneNumber: 1,
            title: 'รายงานการสังเคราะห์ข้อมูลบริบทและเครื่องมือวิจัย',
            dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // เกินกำหนดมาแล้ว 8 วัน (OVERDUE)
            disbursementAmount: 60000.0,
            status: 'PENDING',
          },
          {
            milestoneNumber: 2,
            title: 'รายงานผลการสัมภาษณ์ปราชญ์ชาวบ้านและร่างแนวทาง',
            dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            disbursementAmount: 60000.0,
            status: 'PENDING',
          },
        ],
      },
    },
  });

  console.log('Seeding Publications...');
  await prisma.publication.create({
    data: {
      grantId: grant1.id,
      type: 'JOURNAL',
      titleTh: 'พุทธบูรณาการเพื่อการสร้างเสริมความเข้มแข็งของชุมชนลุ่มน้ำเลยในยุคดิจิทัล',
      titleEn: 'Buddhist Integration for Enhancing Resilience of Loei River Basin Communities in the Digital Era',
      abstractTh: 'งานวิจัยนี้มีวัตถุประสงค์เพื่อศึกษารูปแบบการนำหลักพุทธธรรมมาบูรณาการกับการพัฒนาคุณภาพชีวิตของประชาชนในเขตลุ่มน้ำเลย',
      indexing: 'TCI_TIER_1',
      venueName: 'วารสารสันติศึกษาปริทรรศน์ มจร',
      yearBe: 2567,
      volume: '12',
      issue: '3',
      pages: '1045-1060',
      doi: '10.14456/peacejournal.2024.58',
      status: 'VERIFIED',
      qaScore: 0.80,
      authors: {
        create: [
          {
            profileId: userExec.profile!.id,
            authorName: 'พระครูปริยัติวีราภรณ์, รศ.ดร.',
            authorRole: 'FIRST_AUTHOR',
            authorShare: 60.0,
          },
          {
            profileId: userMonk.profile!.id,
            authorName: 'พระมหาสมคิด ชินวํโส, ผศ.ดร.',
            authorRole: 'CORRESPONDING',
            authorShare: 40.0,
          },
        ],
      },
    },
  });

  console.log('Seeding Research Utilizations & Social Impact...');
  await prisma.researchUtilization.create({
    data: {
      title: 'ธรรมนูญสุขภาพพระสงฆ์และมาตรการการดูแลพระสงฆ์อาพาธระดับจังหวัดเลย',
      dimension: 'POLICY',
      targetArea: '14 อำเภอในเขตจังหวัดเลย',
      targetGroup: 'พระภิกษุสามเณร 1,250 รูป และอาสาสมัครสาธารณสุขประจำวัด (อสว.)',
      impactDescription: 'สำนักงานสาธารณสุขจังหวัดเลย และคณะสงฆ์จังหวัดเลย ได้นำข้อค้นพบจากงานวิจัยไปประกาศใช้เป็น "ธรรมนูญสุขภาพพระสงฆ์จังหวัดเลย" ฉบับแรก เพื่อจัดระบบสิทธิการรักษาพยาบาลและคลินิกพระสงฆ์ในโรงพยาบาลชุมชน 14 แห่ง',
      benefitUnitCount: 1250,
      economicValueThb: null,
      certifyingAgency: 'สำนักงานสาธารณสุขจังหวัดเลย (สสจ.เลย)',
      certifierName: 'นพ.ชาญชัย บุญอยู่ (นายแพทย์สาธารณสุขจังหวัดเลย)',
      letterNo: 'ลย ๐๐๓๓.๐๐๑/ว ๑๔๘๙',
      letterDate: new Date('2024-02-15'),
      evidenceFileUrl: '/uploads/evidence-sample-cert-policy.pdf',
      yearBe: 2567,
      profileId: userMonk.profile!.id,
      grantId: grant1.id,
      status: 'VERIFIED',
    },
  });

  await prisma.researchUtilization.create({
    data: {
      title: 'คู่มือกระบวนการระงับข้อพิพาทชุมชนตามแนวพุทธสันติวิธีในลุ่มน้ำเลย',
      dimension: 'PUBLIC_COMMUNITY',
      targetArea: 'ตำบลกุดป่อง และตำบลนาอาน อำเภอเมือง จังหวัดเลย',
      targetGroup: 'ผู้นำชุมชน ไวยาวัจกร และประชาชน 450 คน',
      impactDescription: 'องค์การบริหารส่วนตำบลและสภาวัฒนธรรมอำเภอเมืองเลยนำกระบวนการไกล่เกลี่ยข้อพิพาทตามพุทธสันติวิธีไปจัดตั้งศูนย์ไกล่เกลี่ยประจำตำบล ลดข้อพิพาทเรื่องที่ดินและทรัพยากรน้ำได้มากกว่า 18 กรณี',
      benefitUnitCount: 450,
      economicValueThb: null,
      certifyingAgency: 'องค์การบริหารส่วนตำบลนาอาน และศูนย์ไกล่เกลี่ยข้อพิพาทภาคประชาชน',
      certifierName: 'นายกองค์การบริหารส่วนตำบลนาอาน',
      letterNo: 'อบต.นอ ๕๒๐๑/๓๘๒',
      letterDate: new Date('2024-05-10'),
      evidenceFileUrl: '/uploads/evidence-sample-cert-community.pdf',
      yearBe: 2567,
      profileId: userMonk.profile!.id,
      status: 'VERIFIED',
    },
  });

  await prisma.researchUtilization.create({
    data: {
      title: 'โมเดลเส้นทางท่องเที่ยวเชิงวัฒนธรรมพุทธและการยกระดับผลิตภัณฑ์ของที่ระลึกริมโขง',
      dimension: 'ECONOMIC_LOCAL',
      targetArea: 'อำเภอเชียงคาน จังหวัดเลย',
      targetGroup: 'วิสาหกิจชุมชนแปรรูปผ้าฝ้ายและโฮมสเตย์ 8 กลุ่ม (สมาชิก 120 ครัวเรือน)',
      impactDescription: 'นำองค์ความรู้และลวดลายวัฒนธรรมพุทธโบราณไทดำ-เชียงคาน ไปพัฒนาผลิตภัณฑ์ของที่ระลึกและเส้นทางท่องเที่ยวเชิงธรรมะริมโขง สร้างรายได้เสริมให้ชุมชนเพิ่มขึ้นเฉลี่ย 35% ต่อปี',
      benefitUnitCount: 380,
      economicValueThb: 1450000.0,
      certifyingAgency: 'เทศบาลตำบลเชียงคาน และกลุ่มวิสาหกิจชุมชนริมโขง',
      certifierName: 'นายกเทศมนตรีตำบลเชียงคาน',
      letterNo: 'ทต.ชค ๕๔๑๐๒/๗๒๐',
      letterDate: new Date('2024-06-20'),
      evidenceFileUrl: '/uploads/evidence-sample-cert-economic.pdf',
      yearBe: 2567,
      profileId: userExec.profile!.id,
      status: 'VERIFIED',
    },
  });

  await prisma.researchUtilization.create({
    data: {
      title: 'ชุดการเรียนรู้หลักสูตรระยะสั้น "พระคิลานุปัฏฐาก (พระอาสาสมัครส่งเสริมสุขภาพประจำวัด)"',
      dimension: 'ACADEMIC',
      targetArea: 'วิทยาลัยสงฆ์เลย และศูนย์การศึกษาพระปริยัติธรรม แผนกสามัญศึกษา เขต ๘',
      targetGroup: 'พระคิลานุปัฏฐากและครูพระปริยัตินิเทศก์ 85 รูป',
      impactDescription: 'นำองค์ความรู้จากงานวิจัยไปพัฒนาเป็นหลักสูตรระยะสั้นเพื่อผลิตพระคิลานุปัฏฐาก ได้รับการอนุมัติเป็นหลักสูตรรับรองของสถาบัน และนำไปใช้จัดอบรมจริงร่วมกับโรงพยาบาลเลย',
      benefitUnitCount: 85,
      economicValueThb: null,
      certifyingAgency: 'สำนักงานเขตการศึกษาพระปริยัติธรรม แผนกสามัญศึกษา เขต ๘',
      certifierName: 'ประธานกลุ่มโรงเรียนพระปริยัติธรรมฯ',
      letterNo: 'สขศ.๘ ๐๑๔/๒๕๖๗',
      letterDate: new Date('2024-04-05'),
      evidenceFileUrl: '/uploads/evidence-sample-cert-academic.pdf',
      yearBe: 2567,
      profileId: userMonk.profile!.id,
      status: 'VERIFIED',
    },
  });

  console.log('Seed with Multi-Tier accounts and Research Utilizations completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });