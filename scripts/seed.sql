-- =============================================================
--  Next Gen Innovations Nepal — Seed Data
--  Run after schema: psql -U postgres -d next_gen_db -f seed.sql
-- =============================================================

-- ─── ADMIN CREDENTIALS ───────────────────────────────────────
-- Username: admin | Password: admin
INSERT INTO admin_auth (username, password_hash) VALUES ('admin', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = 'admin';

-- ─── FOUNDERS ────────────────────────────────────────────────
TRUNCATE founders RESTART IDENTITY;

INSERT INTO founders (name, role, avatar, bio, color, tag, education) VALUES
(
    'Yubraj Paswan',
    'Founder',
    'YP',
    'Visionary leader driving strategic growth and digital inclusion in Nepal.',
    'linear-gradient(135deg,#0F1C3F,#1A348A)',
    'Founder',
    'Diploma in Agriculture from CTEVT'
),
(
    'Abhishek Kumar Paswan',
    'Senior Developer & Business Lead',
    'AP',
    'Expert developer specializing in scalable enterprise software and technology leadership.',
    'linear-gradient(135deg,#1A348A,#2a4bc4)',
    'Tech Lead',
    'BBS from Tribhubhan University, pursuing MBA from NOU'
),
(
    'Payal Paswan',
    'Business Development Head',
    'PP',
    'Leading strategic relations, brand representation, and company growth initiatives.',
    'linear-gradient(135deg,#00C9B1,#00e5cf)',
    'Management',
    'Management Professional'
),
(
    'Bidur Paswan',
    'Developer',
    'BP',
    'Passionate developer focused on modern web technologies and frontend engineering.',
    'linear-gradient(135deg,#4f46e5,#00C9B1)',
    'Developer',
    'SLC from Pashupati MA Vi Lahan, pursuing +2 from NEB'
),
(
    'Basu Paswan',
    'Developer',
    'BP',
    'Enthusiastic developer learning new frameworks and building robust services.',
    'linear-gradient(135deg,#6366f1,#a855f7)',
    'Developer',
    'Class 2'
),
(
    'Barsha Paswan',
    'Business Analyst',
    'BP',
    'Business analyst analyzing client requirements, systems workflow, and project design.',
    'linear-gradient(135deg,#ec4899,#f43f5e)',
    'Analysis',
    'BBS'
);

-- ─── NOTICE ──────────────────────────────────────────────────
TRUNCATE notices RESTART IDENTITY;

INSERT INTO notices (active, message, type, link) VALUES
(
    false,
    'Welcome to Next Gen Innovations! We are currently expanding our team. Check our careers page.',
    'info',
    '/careers.html'
);

-- ─── TERMS ───────────────────────────────────────────────────
TRUNCATE term_sections, terms RESTART IDENTITY CASCADE;

INSERT INTO terms (title, last_updated) VALUES ('Terms and Conditions', '2026-04-07');

INSERT INTO term_sections (term_id, heading, content, "order") VALUES
(1, '1. Agreement to Terms',
 'By accessing our website at nextgennepal.com, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.',
 0),
(1, '2. Use License',
 'Permission is granted to temporarily download one copy of the materials on Next Gen Innovations Nepal Private Limited''s website for personal, non-commercial transitory viewing only.',
 1),
(1, '3. Disclaimer',
 'The materials on Next Gen Innovations Nepal Private Limited''s website are provided on an ''as is'' basis. Next Gen Innovations Nepal makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.',
 2),
(1, '4. Privacy Policy',
 'We collect only the information necessary to provide our services. Your data is never sold to third parties. Contact info@nextgeninnovations.com.np for any data-related requests.',
 3);

-- ─── CAREERS ─────────────────────────────────────────────────
TRUNCATE careers RESTART IDENTITY;

INSERT INTO careers (title, department, location, type, description, requirements, status) VALUES
(
    'Senior Full Stack Developer',
    'Engineering',
    'Kathmandu, Nepal (Remote/On-site)',
    'Full-time',
    'We are looking for an experienced developer to lead our React and Node.js projects.',
    '["5+ years experience", "Strong React/Next.js skills", "Database management"]',
    'open'
),
(
    'UI/UX Designer',
    'Design',
    'Kathmandu, Nepal',
    'Contract',
    'Craft beautiful and intuitive user experiences for our FinTech clients.',
    '["Figma mastery", "Understanding of modern UI trends", "Portfolio required"]',
    'open'
);

-- ─── HERO BANNERS ────────────────────────────────────────────
-- Empty by default — add banners from Admin Panel > Hero Banners
TRUNCATE hero_banners RESTART IDENTITY;
