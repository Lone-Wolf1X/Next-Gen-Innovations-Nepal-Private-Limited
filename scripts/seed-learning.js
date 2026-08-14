const path = require('path');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'nextgen-learn-2c351' });
} else {
  admin.app();
}
const db = admin.firestore();

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const categories = [
  {
    id: 'cat_rbb',
    name: 'Banking Exams (RBB)',
    description: 'Preparation for Rastriya Banijya Bank and other banking sector examinations.',
    icon: '🏦',
    order: 1,
    isActive: true
  },
  {
    id: 'cat_sangathit',
    name: 'Sangathit Sangh Sanstha',
    description: 'Preparation for organizational licensing and Lok Sewa Aayog equivalent exams.',
    icon: '📜',
    order: 2,
    isActive: true
  }
];

const subjects = [
  { id: 'sub_rbb_gk', categoryId: 'cat_rbb', name: 'General Knowledge & Banking', order: 1, isActive: true },
  { id: 'sub_rbb_mgnt', categoryId: 'cat_rbb', name: 'Management & IT', order: 2, isActive: true },
  { id: 'sub_san_gk', categoryId: 'cat_sangathit', name: 'General Awareness', order: 1, isActive: true },
];

const questions = [
  // RBB Questions
  {
    id: 'q_rbb_1',
    categoryId: 'cat_rbb',
    subjectId: 'sub_rbb_gk',
    questionText: 'When was Rastriya Banijya Bank established?',
    options: ['2022 BS', '2021 BS', '2013 BS', '2024 BS'],
    correctOption: '2022 BS',
    explanation: 'Rastriya Banijya Bank was established on Magh 10, 2022 BS (January 23, 1966 AD).',
    marks: 1,
    negativeMarks: 0.2,
    status: 'published'
  },
  {
    id: 'q_rbb_2',
    categoryId: 'cat_rbb',
    subjectId: 'sub_rbb_gk',
    questionText: 'Who is the central bank of Nepal?',
    options: ['Rastriya Banijya Bank', 'Nepal Rastra Bank', 'Nepal Bank Limited', 'Agriculture Development Bank'],
    correctOption: 'Nepal Rastra Bank',
    explanation: 'Nepal Rastra Bank (NRB) is the central bank of Nepal, established in 2013 BS.',
    marks: 1,
    negativeMarks: 0.2,
    status: 'published'
  },
  {
    id: 'q_rbb_3',
    categoryId: 'cat_rbb',
    subjectId: 'sub_rbb_mgnt',
    questionText: 'Which function is considered the primary function of management?',
    options: ['Planning', 'Organizing', 'Directing', 'Controlling'],
    correctOption: 'Planning',
    explanation: 'Planning is the basic and primary function of management that precedes all other functions.',
    marks: 1,
    negativeMarks: 0.2,
    status: 'published'
  },
  // Sangathit Sangh Questions
  {
    id: 'q_san_1',
    categoryId: 'cat_sangathit',
    subjectId: 'sub_san_gk',
    questionText: 'Which is the deepest lake of Nepal?',
    options: ['Rara Lake', 'Fewa Lake', 'Shey Phoksundo Lake', 'Tilicho Lake'],
    correctOption: 'Shey Phoksundo Lake',
    explanation: 'Shey Phoksundo is the deepest lake in Nepal with a maximum depth of 145m.',
    marks: 1,
    negativeMarks: 0.2,
    status: 'published'
  },
  {
    id: 'q_san_2',
    categoryId: 'cat_sangathit',
    subjectId: 'sub_san_gk',
    questionText: 'According to the Constitution of Nepal, how many fundamental rights are provisioned?',
    options: ['31', '32', '33', '34'],
    correctOption: '31',
    explanation: 'Part 3 of the Constitution of Nepal provides 31 fundamental rights from Article 16 to 46.',
    marks: 1,
    negativeMarks: 0.2,
    status: 'published'
  }
];

const modelSets = [
  {
    id: 'ms_rbb_1',
    categoryId: 'cat_rbb',
    title: 'RBB 5th Level - Model Set 1',
    description: 'A comprehensive mock test covering GK, Banking, and Management for RBB 5th Level Assistant.',
    timeLimitMinutes: 15,
    totalMarks: 3,
    negativeMarking: true,
    negativeMarkValue: 0.2,
    questionIds: ['q_rbb_1', 'q_rbb_2', 'q_rbb_3'],
    status: 'published',
    publishedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'ms_san_1',
    categoryId: 'cat_sangathit',
    title: 'Sangathit Sangh - License Set 1',
    description: 'Practice test for organizational licensing containing general awareness questions.',
    timeLimitMinutes: 10,
    totalMarks: 2,
    negativeMarking: true,
    negativeMarkValue: 0.2,
    questionIds: ['q_san_1', 'q_san_2'],
    status: 'published',
    publishedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// ─── SEED FUNCTIONS ───────────────────────────────────────────────────────────

async function clearCollection(name) {
  const batch = db.batch();
  const existing = await db.collection(name).get();
  existing.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

async function seedData() {
  console.log('\n🌱 Seeding NextGen Learn Database (nextgen-learn-2c351)...\n');

  try {
    // Clear existing
    await clearCollection('examCategories');
    await clearCollection('subjects');
    await clearCollection('questions');
    await clearCollection('modelSets');

    const adminId = 'seed_script';
    const ts = admin.firestore.FieldValue.serverTimestamp();

    // 1. Categories
    const catBatch = db.batch();
    for (const cat of categories) {
      const { id, ...data } = cat;
      const ref = db.collection('examCategories').doc(id);
      catBatch.set(ref, { ...data, createdAt: ts, createdBy: adminId });
    }
    await catBatch.commit();
    console.log('  ✅ Seeded examCategories');

    // 2. Subjects
    const subBatch = db.batch();
    for (const sub of subjects) {
      const { id, ...data } = sub;
      const ref = db.collection('subjects').doc(id);
      subBatch.set(ref, { ...data, createdAt: ts, createdBy: adminId });
    }
    await subBatch.commit();
    console.log('  ✅ Seeded subjects');

    // 3. Questions
    const qBatch = db.batch();
    for (const q of questions) {
      const { id, ...data } = q;
      const ref = db.collection('questions').doc(id);
      qBatch.set(ref, { ...data, createdAt: ts, updatedAt: ts, createdBy: adminId });
    }
    await qBatch.commit();
    console.log('  ✅ Seeded questions');

    // 4. Model Sets
    const msBatch = db.batch();
    for (const ms of modelSets) {
      const { id, ...data } = ms;
      const ref = db.collection('modelSets').doc(id);
      msBatch.set(ref, { ...data, createdAt: ts, createdBy: adminId });
    }
    await msBatch.commit();
    console.log('  ✅ Seeded modelSets');

    console.log('\n🎉 NextGen Learn seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedData();
