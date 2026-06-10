const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'next_gen_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'info@nextgeninnovations.com.np',
        pass: process.env.EMAIL_PASS
    }
});

async function setupAdmin() {
    try {
        const rawPassword = crypto.randomBytes(6).toString('hex'); // 12 char random password
        const email = 'info@nextgeninnovations.com.np';
        const username = 'admin';

        console.log("⚠️ Please ensure you run this SQL on your live server's database:");
        console.log(`UPDATE admin_auth SET password_hash = '${rawPassword}', email = '${email}' WHERE username = '${username}';`);

        // Email the credentials
        const mailOptions = {
            from: `"Next Gen Internal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔒 New Admin Login Credentials Generated',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">Admin Access Granted</h2>
                    <p>Your secure admin credentials for the Next Gen Innovations portal have been successfully generated.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><b>Username:</b> ${username}</p>
                        <p><b>Email:</b> ${email}</p>
                        <p><b>Password:</b> <span style="background:#e5e7eb; padding:2px 6px; font-family:monospace; letter-spacing:1px;">${rawPassword}</span></p>
                    </div>
                    <p>You can now log in using either your Username or your Email.</p>
                </div>
            `
        };

        console.log("Sending email to", email, "...");
        await transporter.sendMail(mailOptions);
        console.log("✅ Credentials successfully sent via Zoho Mail!");

    } catch (err) {
        console.error("❌ Setup failed:", err);
    } finally {
        process.exit(0);
    }
}

setupAdmin();
