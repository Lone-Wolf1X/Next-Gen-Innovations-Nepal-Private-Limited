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

INSERT INTO founders (name, role, avatar, bio, color, tag) VALUES
(
    'Yubaraj Paswan',
    'Founder',
    'YP',
    'Visionary entrepreneur with a passion for leveraging technology to solve real-world problems in Nepal.',
    'linear-gradient(135deg,#0F1C3F,#1A348A)',
    'Visionary Leader'
),
(
    'Abhishek Kumar Paswan',
    'Senior Developer & CEO',
    'AK',
    'Full-stack architect and tech lead driving engineering excellence and company strategy.',
    'linear-gradient(135deg,#1A348A,#2a4bc4)',
    'Full-Stack Expert'
),
(
    'Bidur Paswan',
    'Developer',
    'BP',
    'Backend specialist building robust, scalable server infrastructure and API layers.',
    'linear-gradient(135deg,#00C9B1,#00aaa0)',
    'Backend Specialist'
),
(
    'Basu Paswan',
    'Developer',
    'BP',
    'Mobile & UI developer crafting beautiful, intuitive user experiences across platforms.',
    'linear-gradient(135deg,#2a4bc4,#00C9B1)',
    'Mobile & UI Dev'
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
 'We collect only the information necessary to provide our services. Your data is never sold to third parties. Contact info@nextgennepal.com for any data-related requests.',
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
