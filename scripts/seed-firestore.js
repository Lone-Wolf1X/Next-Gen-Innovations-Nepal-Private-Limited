/**
 * Firestore Seed Script — Next Gen Innovations Nepal
 * Usage: node scripts/seed-firestore.js
 * Requires: firebase login (Firebase CLI) already done
 */

const path = require('path');

// Use firebase-admin from functions/node_modules
const admin = require(path.join(__dirname, '../functions/node_modules/firebase-admin'));

admin.initializeApp({ projectId: 'nextgen-website-1834a' });
const db = admin.firestore();

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const founders = [
  {
    name: 'Yuvraj Paswan',
    role: 'Founder',
    avatar: 'YP',
    bio: 'Visionary entrepreneur with a passion for leveraging technology to solve real-world problems in Nepal.',
    color: 'linear-gradient(135deg,#0F1C3F,#1A348A)',
    tag: 'Visionary Leader'
  },
  {
    name: 'Abhishek Kumar Paswan',
    role: 'Senior Developer & CEO',
    avatar: 'AK',
    bio: 'Full-stack architect and tech lead driving engineering excellence and company strategy.',
    color: 'linear-gradient(135deg,#1A348A,#2a4bc4)',
    tag: 'Full-Stack Expert'
  },
  {
    name: 'Bidur Paswan',
    role: 'Developer',
    avatar: 'BP',
    bio: 'Backend specialist building robust, scalable server infrastructure and API layers.',
    color: 'linear-gradient(135deg,#00C9B1,#00aaa0)',
    tag: 'Backend Specialist'
  },
  {
    name: 'Basu Paswan',
    role: 'Developer',
    avatar: 'BP',
    bio: 'Mobile & UI developer crafting beautiful, intuitive user experiences across platforms.',
    color: 'linear-gradient(135deg,#2a4bc4,#00C9B1)',
    tag: 'Mobile & UI Dev'
  }
];

const notice = {
  active: false,
  message: 'Welcome to Next Gen Innovations! We are currently expanding our team. Check our careers page.',
  type: 'info',
  link: '/careers.html'
};

const terms = {
  title: 'Terms and Conditions',
  lastUpdated: '2026-04-07',
  sections: [
    {
      heading: '1. Agreement to Terms',
      content: 'By accessing our website at nextgennepal.com, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.'
    },
    {
      heading: '2. Use License',
      content: "Permission is granted to temporarily download one copy of the materials on Next Gen Innovations Nepal Private Limited's website for personal, non-commercial transitory viewing only."
    },
    {
      heading: '3. Disclaimer',
      content: "The materials on Next Gen Innovations Nepal Private Limited's website are provided on an 'as is' basis. Next Gen Innovations Nepal makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties."
    },
    {
      heading: '4. Privacy Policy',
      content: 'We collect only the information necessary to provide our services. Your data is never sold to third parties. Contact info@nextgennepal.com for any data-related requests.'
    }
  ]
};

const careers = [
  {
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Kathmandu, Nepal (Remote/On-site)',
    type: 'Full-time',
    description: 'We are looking for an experienced developer to lead our React and Node.js projects.',
    requirements: ['5+ years experience', 'Strong React/Next.js skills', 'Database management'],
    status: 'open'
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Kathmandu, Nepal',
    type: 'Contract',
    description: 'Craft beautiful and intuitive user experiences for our FinTech clients.',
    requirements: ['Figma mastery', 'Understanding of modern UI trends', 'Portfolio required'],
    status: 'open'
  }
];

const heroBanners = {
  banners: [] // Start empty — add banners from Admin Panel > Hero Banners
};

// ─── SEED FUNCTIONS ───────────────────────────────────────────────────────────

async function seedCollection(name, docs) {
  const batch = db.batch();
  const existing = await db.collection(name).get();
  existing.forEach(doc => batch.delete(doc.ref));
  docs.forEach(doc => batch.set(db.collection(name).doc(), doc));
  await batch.commit();
  console.log(`  ✅ ${name}: seeded ${docs.length} document(s)`);
}

async function seedDoc(collection, docId, data) {
  await db.collection(collection).doc(docId).set(data);
  console.log(`  ✅ ${collection}/${docId}: seeded`);
}

async function run() {
  console.log('\n🌱 Seeding Firestore — nextgen-website-1834a\n');

  await seedCollection('founders', founders);
  await seedCollection('careers', careers);
  await seedDoc('notices', 'current', notice);
  await seedDoc('terms', 'current', terms);
  await seedDoc('heroBanners', 'current', heroBanners);

  console.log('\n✅ All done! Database seeded successfully.\n');
  process.exit(0);
}

run().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  console.error('\nMake sure you are logged in: firebase login\n');
  process.exit(1);
});
