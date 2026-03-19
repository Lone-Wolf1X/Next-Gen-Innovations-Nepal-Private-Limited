/**
 * Data Loader for Next Gen Innovations
 * Fetches JSON data from the API and populates the UI
 */

const API_ROOT = '/api';

// Shared function to fetch data
async function fetchWebData(resource) {
    try {
        const response = await fetch(`${API_ROOT}/${resource}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`Could not load ${resource}:`, e);
        return null;
    }
}

// 1. Founders Loader (for index.html and about.html)
async function loadFounders() {
    const container = document.getElementById('dynamicFounders');
    if (!container) return;

    const founders = await fetchWebData('founders');
    if (!founders) return;

    container.innerHTML = founders.map(f => `
        <div class="team-card reveal">
            <div class="team-avatar" style="background: ${f.color || 'var(--accent-primary)'}">${f.avatar}</div>
            <div class="team-name">${f.name}</div>
            <div class="team-role">${f.role}</div>
            ${f.tag ? `<span class="team-tag">${f.tag}</span>` : ''}
            ${f.bio ? `<p style="font-size:0.82rem;color:var(--text-body);margin-top:12px;line-height:1.6;">${f.bio}</p>` : ''}
        </div>
    `).join('');
    
    // Re-trigger scroll animations if available
    if (window.initializeScrollAnimations) window.initializeScrollAnimations();
}

// 2. Notice Banner Loader
async function loadNotice() {
    const noticeData = await fetchWebData('notices');
    if (!noticeData || !noticeData.active) return;

    const banner = document.createElement('div');
    banner.className = `notice-banner banner-${noticeData.type}`;
    banner.innerHTML = `
        <div class="container">
            <p>${noticeData.message} ${noticeData.link ? `<a href="${noticeData.link}">Learn more →</a>` : ''}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="notice-close">×</button>
        </div>
    `;
    document.body.prepend(banner);
}

// 3. Terms Loader
async function loadTerms() {
    const container = document.getElementById('termsContainer');
    if (!container) return;

    const terms = await fetchWebData('terms');
    if (!terms) return;

    document.getElementById('termsHeaderTitle').textContent = terms.title;
    document.getElementById('lastUpdated').textContent = `Last Updated: ${terms.lastUpdated}`;

    container.innerHTML = terms.sections.map(s => `
        <div class="terms-section">
            <h3>${s.heading}</h3>
            <p>${s.content}</p>
        </div>
    `).join('');
}

// 4. Careers Loader
async function loadCareers() {
    const container = document.getElementById('careersContainer');
    if (!container) return;

    const jobs = await fetchWebData('careers');
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p class="text-center">No open positions at the moment. Check back later!</p>';
        return;
    }

    container.innerHTML = jobs.filter(j => j.status === 'open').map(j => `
        <div class="job-card-web reveal shadow-premium">
            <div class="job-header">
                <h3>${j.title}</h3>
                <span class="job-badge">${j.type}</span>
            </div>
            <p class="job-meta">📍 ${j.location} | 📂 ${j.department}</p>
            <p class="job-desc">${j.description}</p>
            <div class="job-requirements">
                <strong>Requirements:</strong>
                <ul>${j.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
            <a href="contact.html?subject=Application for ${j.title}" class="btn btn-primary btn-sm">Apply Now →</a>
        </div>
    `).join('');
    
    if (window.initializeScrollAnimations) window.initializeScrollAnimations();
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    loadNotice();
    loadFounders();
    loadTerms();
    loadCareers();
});
