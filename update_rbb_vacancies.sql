UPDATE vacancies 
SET title = 'RBB Level 5 (Senior Assistant - Admin)',
    roadmap_html = '<div class="syllabus-timeline">\n    <div class="timeline-item">\n        <div class="timeline-marker"></div>\n        <div class="timeline-content">\n            <h4>Paper I: Economics, Banking and General Knowledge</h4>\n            <p><strong>Section A (50 Marks)</strong>: Basic Economics, Financial Market, Financial Institutions in Nepal.</p>\n            <p><strong>Section B (50 Marks)</strong>: Digital/Electronic Payment Systems, Key Basic Banking Terminology, General Knowledge.</p>\n            <div class="badge">MCQs: 50x1 | Short Answers: 10x5</div>\n        </div>\n    </div>\n    <div class="timeline-item">\n        <div class="timeline-marker"></div>\n        <div class="timeline-content">\n            <h4>Paper II: Governance and Office Management</h4>\n            <p><strong>Section A (50 Marks)</strong>: Banking Related Laws, Other Related Laws, Organizational Behavior.</p>\n            <p><strong>Section B (50 Marks)</strong>: Organizational Role, Office Supports, Basic Mathematics.</p>\n            <div class="badge">Short Answers: 12x5 | Long Answers: 4x10</div>\n        </div>\n    </div>\n</div>'
WHERE id = 'vac-rbb-4-5';

INSERT IGNORE INTO vacancies (id, title, category_id, description, application_open_date, application_close_date, exam_date, has_objective, has_subjective, roadmap_html)
VALUES (
    'vac-rbb-5-cash',
    'RBB Level 5 (Senior Assistant - Cash)',
    'cat-rbb',
    'Syllabus for RBB Level 5 Cash (Senior Assistant). Includes Paper I and Paper II.',
    '2026-08-01',
    '2026-08-30',
    '2026-10-15',
    1,
    1,
    '<div class="syllabus-timeline">\n    <div class="timeline-item">\n        <div class="timeline-marker"></div>\n        <div class="timeline-content">\n            <h4>Paper I: Economics, Banking and General Knowledge</h4>\n            <p><strong>Section A (50 Marks)</strong>: Basic Economics, Financial Market, Financial Institutions in Nepal.</p>\n            <p><strong>Section B (50 Marks)</strong>: Digital/Electronic Payment Systems, Key Basic Banking Terminology, General Knowledge.</p>\n            <div class="badge">MCQs: 50x1 | Short Answers: 10x5</div>\n        </div>\n    </div>\n    <div class="timeline-item">\n        <div class="timeline-marker"></div>\n        <div class="timeline-content">\n            <h4>Paper II: Governance, Cash and Vault Management</h4>\n            <p><strong>Section A (50 Marks)</strong>: Daily Cash Handling, Customer Service, Banking Related Laws and Directives.</p>\n            <p><strong>Section B (50 Marks)</strong>: Gold/Silver Loan Transactions, Accounting and Vault Management, Other Related Laws/Policies.</p>\n            <div class="badge">Short Answers: 12x5 | Long Answers: 4x10</div>\n        </div>\n    </div>\n</div>'
);
