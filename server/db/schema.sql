-- Schema for Next Gen Innovations PostgreSQL Database

-- 1. Founders Table
CREATE TABLE IF NOT EXISTS founders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    avatar VARCHAR(50),
    bio TEXT,
    color VARCHAR(255),
    tag VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    active BOOLEAN DEFAULT TRUE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    link VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Terms Table
CREATE TABLE IF NOT EXISTS terms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    last_updated DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Term Sections Table (Relational)
CREATE TABLE IF NOT EXISTS term_sections (
    id SERIAL PRIMARY KEY,
    term_id INT REFERENCES terms(id) ON DELETE CASCADE,
    heading VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "order" INT DEFAULT 0
);

-- 5. Careers Table
CREATE TABLE IF NOT EXISTS careers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    location VARCHAR(255),
    type VARCHAR(50),
    description TEXT,
    requirements JSONB, -- Array of strings
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Admin Auth (Simple)
CREATE TABLE IF NOT EXISTS admin_auth (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
