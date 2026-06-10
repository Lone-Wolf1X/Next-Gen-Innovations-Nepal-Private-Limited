let currentTab = 'founders';
let adminPassword = '';

// Use Express server URL when opened via Live Server (5500/5501),
// otherwise use relative path (works in production via Express on port 3001)
const API_BASE = (window.location.port === '5500' || window.location.port === '5501')
    ? 'http://localhost:3001/api'
    : '/api';
let allQueries = [];

// Cropper globals
let cropper = null;
let currentCropTarget = null; // { index: number, input: HTMLElement, card: HTMLElement }

// Auth
function login() {
    const user = document.getElementById('adminUsername').value.trim();
    const pass = document.getElementById('adminPassword').value;
    if (!user) return showNotification('Please enter username', 'error');
    if (!pass) return showNotification('Please enter password', 'error');

    adminPassword = pass;
    fetch(`${API_BASE}/notices`, { headers: { 'Authorization': 'Basic ' + btoa(user + ':' + pass) } })
        .then(r => r.json())
        .then(data => {
            if (data && !data.error) {
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('adminMainWrapper').style.display = 'flex';
                loadCurrentTabData();
                showNotification('Welcome back, Admin!', 'success');
            } else {
                showNotification('Invalid credentials', 'error');
                adminPassword = '';
            }
        })
        .catch(() => { showNotification('Connection error', 'error'); adminPassword = ''; });
}

function logout() {
    adminPassword = '';
    location.reload();
}

function getAuthHeader() {
    return { 'Authorization': 'Basic ' + btoa('admin:' + adminPassword) };
}

// Data Fetching
async function fetchData(resource) {
    try {
        const res = await fetch(`${API_BASE}/${resource}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function saveData(resource, data) {
    try {
        const res = await fetch(`${API_BASE}/${resource}`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showNotification(`${resource.charAt(0).toUpperCase() + resource.slice(1)} updated successfully!`, 'success');
        } else {
            showNotification(result.error || 'Update failed', 'error');
        }
    } catch (err) {
        showNotification('Network error', 'error');
    }
}

// UI Rendering
function showTab(tab) {
    currentTab = tab;

    const titles = {
        'founders':    'Manage Founders',
        'notices':     'Banner Notice Settings',
        'terms':       'Terms & Conditions',
        'careers':     'Job Openings',
        'heroBanners': 'Hero Banner Slider',
        'queries':     'Customer Queries'
    };
    document.getElementById('currentTabTitle').textContent = titles[tab] || tab;

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
    
    document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
    document.getElementById(`${tab}Tab`).style.display = 'block';
    
    loadCurrentTabData();
}

function loadCurrentTabData() {
    if (currentTab === 'heroBanners') {
        loadBanners();
        return;
    }
    if (currentTab === 'queries') {
        loadQueries();
        return;
    }
    fetchData(currentTab).then(data => {
        if (currentTab === 'founders') renderFounders(data);
        if (currentTab === 'notices') renderNotice(data);
        if (currentTab === 'terms') renderTerms(data);
        if (currentTab === 'careers') renderCareers(data);
    });
}

// Founders logic
function renderFounders(data) {
    const list = document.getElementById('foundersList');
    list.innerHTML = '';
    data.forEach((f, i) => {
        const card = document.createElement('div');
        card.className = 'card founder-card';
        card.innerHTML = `
            <div class="founder-preview-area" style="margin-bottom:16px;">
                ${f.image_data 
                    ? `<img src="${f.image_data}" alt="${f.name}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:8px;border:2px solid var(--border);">`
                    : `<div style="width:80px;height:80px;border-radius:50%;background:${f.color || '#ddd'};display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.5rem;color:white;margin-bottom:8px;">${f.avatar}</div>`}
                <div class="file-upload-area" style="padding:10px;font-size:0.8rem;" onclick="this.querySelector('input').click()">
                    <span>Click to change photo</span>
                    <input type="file" accept="image/*" style="display:none;" onchange="previewFounderImage(this)">
                </div>
            </div>
            <div class="form-group"><label>Name</label><input type="text" value="${f.name}" class="form-control f-name"></div>
            <div class="form-group"><label>Role</label><input type="text" value="${f.role}" class="form-control f-role"></div>
            <div class="form-group"><label>Education</label><input type="text" value="${f.education || ''}" class="form-control f-education"></div>
            <div class="form-group"><label>Avatar Initials</label><input type="text" value="${f.avatar}" class="form-control f-avatar"></div>
            <div class="form-group"><label>Bio</label><textarea class="form-control f-bio">${f.bio}</textarea></div>
            <div class="form-group"><label>Color Gradient</label><input type="text" value="${f.color}" class="form-control f-color"></div>
            <div class="form-group"><label>Tag</label><input type="text" value="${f.tag || ''}" class="form-control f-tag"></div>
            <button onclick="this.parentElement.remove()" class="remove-btn" style="width:100%;margin-top:16px;">🗑 Remove Member</button>
        `;
        list.appendChild(card);
    });
}

function addFounder() {
    const list = document.getElementById('foundersList');
    const card = document.createElement('div');
    card.className = 'card founder-card';
    card.innerHTML = `
        <div class="founder-preview-area" style="margin-bottom:16px;">
            <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg, #1A348A, #00C9B1);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.5rem;color:white;margin-bottom:8px;">NF</div>
            <div class="file-upload-area" style="padding:10px;font-size:0.8rem;" onclick="this.querySelector('input').click()">
                <span>Click to change photo</span>
                <input type="file" accept="image/*" style="display:none;" onchange="previewFounderImage(this)">
            </div>
        </div>
        <div class="form-group"><label>Name</label><input type="text" value="" class="form-control f-name" placeholder="Member Name"></div>
        <div class="form-group"><label>Role</label><input type="text" value="" class="form-control f-role" placeholder="e.g. Developer"></div>
        <div class="form-group"><label>Education</label><input type="text" value="" class="form-control f-education" placeholder="e.g. BBS"></div>
        <div class="form-group"><label>Avatar Initials</label><input type="text" value="NF" class="form-control f-avatar"></div>
        <div class="form-group"><label>Bio</label><textarea class="form-control f-bio" placeholder="Short bio..."></textarea></div>
        <div class="form-group"><label>Color Gradient</label><input type="text" value="linear-gradient(135deg, #1a348a, #00c9b1)" class="form-control f-color"></div>
        <div class="form-group"><label>Tag</label><input type="text" value="" class="form-control f-tag" placeholder="e.g. Tech"></div>
        <button onclick="this.parentElement.remove()" class="remove-btn" style="width:100%;margin-top:16px;">🗑 Remove Member</button>
    `;
    list.appendChild(card);
}

function previewFounderImage(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) return showNotification('Image too large (max 10MB)', 'error');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const card = input.closest('.founder-card');
        openCropper(e.target.result, { isBanner: false, input, card });
    };
    reader.readAsDataURL(file);
}

function saveFounders() {
    const cards = document.querySelectorAll('.founder-card');
    const data = Array.from(cards).map(c => {
        const img = c.querySelector('img');
        return {
            name: c.querySelector('.f-name').value,
            role: c.querySelector('.f-role').value,
            education: c.querySelector('.f-education').value,
            avatar: c.querySelector('.f-avatar').value,
            bio: c.querySelector('.f-bio').value,
            color: c.querySelector('.f-color').value,
            tag: c.querySelector('.f-tag').value,
            imageData: c.dataset.imageData || (img ? img.src : '')
        };
    });
    saveData('founders', data);
}

// Notice logic
function renderNotice(data) {
    document.getElementById('noticeActive').checked = data.active;
    document.getElementById('noticeMessage').value = data.message;
    document.getElementById('noticeType').value = data.type;
    document.getElementById('noticeLink').value = data.link || '';
}

function saveNotice() {
    const data = {
        active: document.getElementById('noticeActive').checked,
        message: document.getElementById('noticeMessage').value,
        type: document.getElementById('noticeType').value,
        link: document.getElementById('noticeLink').value
    };
    saveData('notices', data);
}

// Terms logic
function renderTerms(data) {
    if (!data || !data.sections) return; // Guard for empty Firestore doc
    document.getElementById('termsTitle').value = data.title || '';
    const list = document.getElementById('termsSectionsList');
    list.innerHTML = '';
    data.sections.forEach(s => {
        addTermsSection(s.heading, s.content);
    });
}

function addTermsSection(heading = '', content = '') {
    const div = document.createElement('div');
    div.className = 'card section-item';
    div.innerHTML = `
        <div class="form-group"><label>Heading</label><input type="text" value="${heading}" class="form-control s-heading"></div>
        <div class="form-group"><label>Content</label><textarea class="form-control s-content" rows="4">${content}</textarea></div>
        <button onclick="this.parentElement.remove()" class="remove-btn">Remove</button>
    `;
    document.getElementById('termsSectionsList').appendChild(div);
}

function saveTerms() {
    const sections = document.querySelectorAll('.section-item');
    const data = {
        title: document.getElementById('termsTitle').value,
        lastUpdated: new Date().toISOString().split('T')[0],
        sections: Array.from(sections).map(s => ({
            heading: s.querySelector('.s-heading').value,
            content: s.querySelector('.s-content').value
        }))
    };
    saveData('terms', data);
}

// Careers logic
function renderCareers(data) {
    const list = document.getElementById('careersList');
    list.innerHTML = '';
    data.forEach(c => {
        addCareer(c);
    });
}

function addCareer(job = {}) {
    const div = document.createElement('div');
    div.className = 'card job-card';
    div.innerHTML = `
        <div class="form-group"><label>Job Title</label><input type="text" value="${job.title || ''}" class="form-control j-title"></div>
        <div class="form-group"><label>Department</label><input type="text" value="${job.department || ''}" class="form-control j-dept"></div>
        <div class="form-group"><label>Location</label><input type="text" value="${job.location || ''}" class="form-control j-loc"></div>
        <div class="form-group"><label>Type</label><input type="text" value="${job.type || 'Full-time'}" class="form-control j-type"></div>
        <div class="form-group"><label>Description</label><textarea class="form-control j-desc">${job.description || ''}</textarea></div>
        <div class="form-group"><label>Requirements (comma separated)</label><input type="text" value="${(job.requirements || []).join(', ')}" class="form-control j-req"></div>
        <div class="form-group"><label>Status</label><select class="form-control j-status"><option value="open" ${job.status === 'open' ? 'selected' : ''}>Open</option><option value="closed" ${job.status === 'closed' ? 'selected' : ''}>Closed</option></select></div>
        <button onclick="this.parentElement.remove()" class="remove-btn">Remove</button>
    `;
    document.getElementById('careersList').appendChild(div);
}

function saveCareers() {
    const cards = document.querySelectorAll('.job-card');
    const data = Array.from(cards).map(c => ({
        title: c.querySelector('.j-title').value,
        department: c.querySelector('.j-dept').value,
        location: c.querySelector('.j-loc').value,
        type: c.querySelector('.j-type').value,
        description: c.querySelector('.j-desc').value,
        requirements: c.querySelector('.j-req').value.split(',').map(r => r.trim()).filter(r => r),
        status: c.querySelector('.j-status').value
    }));
    saveData('careers', data);
}

// ─── HERO BANNERS ─────────────────────────────────────────────────────────────
async function loadBanners() {
    const list = document.getElementById('bannersList');
    list.innerHTML = '<p style="color:#64748b;padding:20px;">Loading banners…</p>';
    try {
        const res = await fetch(`${API_BASE}/heroBanners/all`, { headers: getAuthHeader() });
        const data = await res.json();
        renderBanners(data.banners || []);
    } catch (e) {
        list.innerHTML = '<p style="color:#ef4444;">Failed to load banners.</p>';
    }
}

function renderBanners(banners) {
    const list = document.getElementById('bannersList');
    list.innerHTML = '';
    if (!banners.length) {
        list.innerHTML = '<div class="glass-card" style="text-align:center;padding:48px;color:#64748b;">No banners yet. Click <strong>+ Add Banner</strong> to create one.</div>';
        return;
    }
    banners.forEach((b, i) => {
        const card = document.createElement('div');
        card.className = 'card banner-card';
        card.dataset.index = i;
        card.innerHTML = `
            <div class="banner-preview">
                ${b.imageData
                    ? `<img src="${b.imageData}" alt="Banner preview">`
                    : `<div class="banner-placeholder"><span>🖼️</span><span>No image</span></div>`}
                <span class="banner-status-pill ${b.active !== false ? 'active' : 'inactive'}">
                    ${b.active !== false ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="banner-fields">
                <div class="form-row">
                    <div class="form-group half">
                        <label>Title</label>
                        <input type="text" class="form-control b-title" value="${b.title || ''}" placeholder="Banner headline">
                    </div>
                    <div class="form-group half">
                        <label>Tag Label (optional)</label>
                        <input type="text" class="form-control b-tag" value="${b.tag || ''}" placeholder="e.g. New Offer">
                    </div>
                </div>
                <div class="form-group">
                    <label>Subtitle / Description</label>
                    <input type="text" class="form-control b-subtitle" value="${b.subtitle || ''}" placeholder="Short description shown below the title">
                </div>
                <div class="form-row">
                    <div class="form-group half">
                        <label>Button Text</label>
                        <input type="text" class="form-control b-cta-text" value="${b.ctaText || ''}" placeholder="e.g. Learn More">
                    </div>
                    <div class="form-group half">
                        <label>Button Link</label>
                        <input type="text" class="form-control b-cta-link" value="${b.ctaLink || ''}" placeholder="https://...">
                    </div>
                </div>
                <div class="form-group">
                    <label>Replace Image</label>
                    <div class="file-upload-area" onclick="this.querySelector('input').click()">
                        <span>📁 Click to upload image (JPEG / PNG / WebP)</span>
                        <input type="file" accept="image/*" style="display:none;" onchange="previewBannerImage(this, ${i})">
                    </div>
                </div>
                <div class="banner-card-footer">
                    <label class="toggle-label" style="color:#94a3b8;font-size:0.85rem;">
                        <label class="switch" style="margin-right:8px;">
                            <input type="checkbox" class="b-active" ${b.active !== false ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                        Show on website
                    </label>
                    <button onclick="removeBannerCard(this)" class="remove-btn">🗑 Remove</button>
                </div>
            </div>`;
        list.appendChild(card);
    });
}

function addBanner() {
    const list = document.getElementById('bannersList');
    // Clear "no banners" message if present
    if (list.querySelector('.glass-card')) list.innerHTML = '';
    const count = list.querySelectorAll('.banner-card').length;
    const tmp = document.createElement('div');
    tmp.innerHTML = `<div class="card banner-card" data-index="${count}">
        <div class="banner-preview">
            <div class="banner-placeholder"><span>🖼️</span><span>No image uploaded</span></div>
            <span class="banner-status-pill active">Active</span>
        </div>
        <div class="banner-fields">
            <div class="form-row">
                <div class="form-group half">
                    <label>Title</label>
                    <input type="text" class="form-control b-title" placeholder="Banner headline">
                </div>
                <div class="form-group half">
                    <label>Tag Label (optional)</label>
                    <input type="text" class="form-control b-tag" placeholder="e.g. Limited Offer">
                </div>
            </div>
            <div class="form-group">
                <label>Subtitle / Description</label>
                <input type="text" class="form-control b-subtitle" placeholder="Short description shown below the title">
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label>Button Text</label>
                    <input type="text" class="form-control b-cta-text" placeholder="e.g. Get Started">
                </div>
                <div class="form-group half">
                    <label>Button Link</label>
                    <input type="text" class="form-control b-cta-link" placeholder="https://...">
                </div>
            </div>
            <div class="form-group">
                <label>Upload Image</label>
                <div class="file-upload-area" onclick="this.querySelector('input').click()">
                    <span>📁 Click to upload image (JPEG / PNG / WebP)</span>
                    <input type="file" accept="image/*" style="display:none;" onchange="previewBannerImage(this, ${count})">
                </div>
            </div>
            <div class="banner-card-footer">
                <label class="toggle-label" style="color:#94a3b8;font-size:0.85rem;">
                    <label class="switch" style="margin-right:8px;">
                        <input type="checkbox" class="b-active" checked>
                        <span class="slider round"></span>
                    </label>
                    Show on website
                </label>
                <button onclick="removeBannerCard(this)" class="remove-btn">🗑 Remove</button>
            </div>
        </div>
    </div>`;
    list.appendChild(tmp.firstElementChild);
}

function previewBannerImage(input, index) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
        showNotification('Image too large (max 10MB)', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const card = document.querySelectorAll('.banner-card')[index] || input.closest('.banner-card');
        openCropper(e.target.result, { isBanner: true, index, input, card });
    };
    reader.readAsDataURL(file);
}

// Updated openCropper to handle different aspect ratios
function openCropper(imageSrc, target) {
    currentCropTarget = target;
    const modal = document.getElementById('cropperModal');
    const image = document.getElementById('cropperImage');
    const headerTitle = modal.querySelector('h3');
    
    headerTitle.textContent = target.isBanner ? 'Crop Hero Banner (3.2:1)' : 'Crop Founder Avatar (1:1)';
    image.src = imageSrc;
    modal.style.display = 'flex';
    
    if (cropper) cropper.destroy();
    
    cropper = new Cropper(image, {
        aspectRatio: target.isBanner ? (1920 / 600) : 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
    });
}

// Updated applyCrop to handle banners too
function applyCrop() {
    if (!cropper) return;
    
    const isBanner = currentCropTarget.isBanner;
    
    const canvas = cropper.getCroppedCanvas({
        width: isBanner ? 1920 : 600,
        height: isBanner ? 600 : 600,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const { card } = currentCropTarget;
    
    if (isBanner) {
        const preview = card.querySelector('.banner-preview');
        let img = preview.querySelector('img');
        if (!img) {
            preview.querySelector('.banner-placeholder')?.remove();
            img = document.createElement('img');
            preview.insertBefore(img, preview.firstChild);
        }
        img.src = croppedDataUrl;
    } else {
        const previewArea = card.querySelector('.founder-preview-area');
        let img = previewArea.querySelector('img');
        if (!img) {
            const initialDiv = previewArea.querySelector('div:not(.file-upload-area)');
            if (initialDiv) initialDiv.remove();
            img = document.createElement('img');
            img.style.cssText = "width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:8px;border:2px solid var(--border);";
            previewArea.insertBefore(img, previewArea.firstChild);
        }
        img.src = croppedDataUrl;
    }
    
    card.dataset.imageData = croppedDataUrl;
    showNotification('Image adjusted & applied', 'success');
    closeCropper();
}

function removeBannerCard(btn) {
    btn.closest('.banner-card').remove();
    const list = document.getElementById('bannersList');
    if (!list.querySelectorAll('.banner-card').length) {
        list.innerHTML = '<div class="glass-card" style="text-align:center;padding:48px;color:#64748b;">No banners yet. Click <strong>+ Add Banner</strong> to create one.</div>';
    }
}

async function saveBanners() {
    const cards = document.querySelectorAll('.banner-card');
    const banners = Array.from(cards).map(c => {
        const existingImg = c.querySelector('.banner-preview img');
        return {
            title:     c.querySelector('.b-title').value.trim(),
            tag:       c.querySelector('.b-tag').value.trim(),
            subtitle:  c.querySelector('.b-subtitle').value.trim(),
            ctaText:   c.querySelector('.b-cta-text').value.trim(),
            ctaLink:   c.querySelector('.b-cta-link').value.trim(),
            active:    c.querySelector('.b-active').checked,
            imageData: c.dataset.imageData || (existingImg ? existingImg.src : '')
        };
    });

    try {
        const res = await fetch(`${API_BASE}/heroBanners`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ banners })
        });
        const result = await res.json();
        if (result.success) showNotification('Hero banners saved!', 'success');
        else showNotification(result.error || 'Save failed', 'error');
    } catch (e) {
        showNotification('Network error', 'error');
    }
}

// ─── CUSTOMER QUERIES ──────────────────────────────────────────────────────────
async function loadQueries() {
    const list = document.getElementById('queriesList');
    list.innerHTML = '<p style="color:#64748b;padding:20px;">Loading queries…</p>';
    try {
        const res = await fetch(`${API_BASE}/queries`, { headers: getAuthHeader() });
        allQueries = await res.json();
        renderQueriesSummary(allQueries);
        renderQueries(allQueries);
        updateUnreadBadge(allQueries);
    } catch (e) {
        list.innerHTML = '<p style="color:#ef4444;">Failed to load queries.</p>';
    }
}

function renderQueriesSummary(queries) {
    const summary = document.getElementById('queriesSummary');
    const total  = queries.length;
    const unread = queries.filter(q => !q.read).length;
    const today  = queries.filter(q => {
        if (!q.timestamp) return false;
        const d = new Date(q.timestamp);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length;
    summary.style.display = 'flex';
    summary.innerHTML = `
        <div class="query-stat-card"><div class="q-stat-num">${total}</div><div class="q-stat-label">Total</div></div>
        <div class="query-stat-card"><div class="q-stat-num" style="color:#f59e0b;">${unread}</div><div class="q-stat-label">Unread</div></div>
        <div class="query-stat-card"><div class="q-stat-num" style="color:#10b981;">${today}</div><div class="q-stat-label">Today</div></div>`;
}

function updateUnreadBadge(queries) {
    const badge = document.getElementById('unreadBadge');
    const count = queries.filter(q => !q.read).length;
    if (count > 0) { badge.textContent = count; badge.style.display = 'inline-flex'; }
    else badge.style.display = 'none';
}

function filterQueries() {
    const filter = document.getElementById('queryFilter').value;
    if (filter === 'all') renderQueries(allQueries);
    else if (filter === 'new') renderQueries(allQueries.filter(q => !q.read));
    else if (filter === 'read') renderQueries(allQueries.filter(q => q.read));
}

function renderQueries(queries) {
    const list = document.getElementById('queriesList');
    list.innerHTML = '';
    if (!queries.length) {
        list.innerHTML = '<div class="glass-card" style="text-align:center;padding:48px;color:#64748b;">No queries found.</div>';
        return;
    }
    queries.forEach(q => {
        const card = document.createElement('div');
        card.className = `query-card glass-card ${!q.read ? 'unread' : ''}`;
        const date = q.timestamp ? new Date(q.timestamp).toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown date';
        card.innerHTML = `
            <div class="query-header">
                <div class="query-identity">
                    <div class="query-avatar">${(q.firstName || '?')[0].toUpperCase()}</div>
                    <div>
                        <div class="query-name">${q.firstName || ''} ${q.lastName || ''}</div>
                        <div class="query-meta">${q.email || ''}${q.phone ? ' · ' + q.phone : ''}</div>
                    </div>
                </div>
                <div class="query-right">
                    <span class="query-service-tag">${q.service || 'General'}</span>
                    <span class="query-date">${date}</span>
                    ${!q.read ? '<span class="new-badge">NEW</span>' : ''}
                </div>
            </div>
            <div class="query-message">${q.message || ''}</div>
            <div class="query-actions">
                ${!q.read
                    ? `<button onclick="markRead('${q.id}', this)" class="btn btn-outline btn-sm">✔ Mark as Read</button>`
                    : `<button class="btn btn-sm" style="background:rgba(255,255,255,0.04);color:#64748b;border:1px solid rgba(255,255,255,0.06);cursor:default;">✔ Read</button>`}
                <a href="mailto:${q.email}" class="btn btn-outline btn-sm">✉ Reply</a>
                <button onclick="deleteQuery('${q.id}', this)" class="remove-btn" style="margin-top:0;">🗑 Delete</button>
            </div>`;
        list.appendChild(card);
    });
}

async function markRead(id, btn) {
    try {
        const res = await fetch(`${API_BASE}/queries/${id}`, {
            method: 'PATCH',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true, status: 'read' })
        });
        const result = await res.json();
        if (result.success) {
            const q = allQueries.find(x => x.id === id);
            if (q) q.read = true;
            const card = btn.closest('.query-card');
            card.classList.remove('unread');
            btn.outerHTML = `<button class="btn btn-sm" style="background:rgba(255,255,255,0.04);color:#64748b;border:1px solid rgba(255,255,255,0.06);cursor:default;">✔ Read</button>`;
            card.querySelector('.new-badge')?.remove();
            updateUnreadBadge(allQueries);
            renderQueriesSummary(allQueries);
        }
    } catch (e) {
        showNotification('Failed to update', 'error');
    }
}

async function deleteQuery(id, btn) {
    if (!confirm('Delete this query? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_BASE}/queries/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        const result = await res.json();
        if (result.success) {
            btn.closest('.query-card').remove();
            allQueries = allQueries.filter(q => q.id !== id);
            updateUnreadBadge(allQueries);
            renderQueriesSummary(allQueries);
            showNotification('Query deleted', 'success');
        }
    } catch (e) {
        showNotification('Failed to delete', 'error');
    }
}

function showNotification(msg, type) {
    const n = document.getElementById('notification');
    const msgSpan = document.getElementById('toastMessage');
    const iconSpan = n.querySelector('.toast-icon');

    msgSpan.textContent = msg;
    n.className = `glass-toast show ${type}`;
    
    if(type === 'success') iconSpan.textContent = '✅';
    else if(type === 'error') iconSpan.textContent = '❌';

    setTimeout(() => {
        n.classList.remove('show');
    }, 3000);
}
