-- =============================================================
--  Next Gen Innovations Nepal — Database Schema
--  Run this first: psql -U postgres -d next_gen_db -f schema.sql
-- =============================================================

-- Admin credentials
CREATE TABLE IF NOT EXISTS admin_auth (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Founders
CREATE TABLE IF NOT EXISTS founders (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(255) NOT NULL,
    role   VARCHAR(255),
    avatar VARCHAR(10),
    bio    TEXT,
    color  TEXT,
    tag    VARCHAR(100)
);

-- Site notice banner
CREATE TABLE IF NOT EXISTS notices (
    id      SERIAL PRIMARY KEY,
    active  BOOLEAN DEFAULT false,
    message TEXT,
    type    VARCHAR(20) DEFAULT 'info',
    link    TEXT
);

-- Terms & Conditions
CREATE TABLE IF NOT EXISTS terms (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255),
    last_updated DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS term_sections (
    id       SERIAL PRIMARY KEY,
    term_id  INT REFERENCES terms(id) ON DELETE CASCADE,
    heading  TEXT,
    content  TEXT,
    "order"  INT DEFAULT 0
);

-- Job openings
CREATE TABLE IF NOT EXISTS careers (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    department   VARCHAR(100),
    location     VARCHAR(255),
    type         VARCHAR(50)  DEFAULT 'Full-time',
    description  TEXT,
    requirements JSONB        DEFAULT '[]',
    status       VARCHAR(20)  DEFAULT 'open'
);

-- Hero promotional banners
CREATE TABLE IF NOT EXISTS hero_banners (
    id         SERIAL PRIMARY KEY,
    title      TEXT,
    tag        TEXT,
    subtitle   TEXT,
    cta_text   TEXT,
    cta_link   TEXT,
    image_data TEXT,           -- base64 encoded image
    active     BOOLEAN DEFAULT true,
    sort_order INT     DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Contact form queries
CREATE TABLE IF NOT EXISTS queries (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name  VARCHAR(100),
    email      VARCHAR(255),
    phone      VARCHAR(50),
    service    VARCHAR(100),
    message    TEXT,
    read       BOOLEAN  DEFAULT false,
    status     VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);
