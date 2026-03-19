let currentTab = 'founders';
let adminPassword = '';
const API_BASE = '/api';

// Auth
function login() {
    const pass = document.getElementById('adminPassword').value;
    if (!pass) return showNotification('Please enter a password', 'error');
    
    // Test auth with a simple GET
    adminPassword = pass;
    fetchData('notices').then(data => {
        if (data && !data.error) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminNav').style.display = 'flex';
            document.getElementById('adminMain').style.display = 'block';
            loadCurrentTabData();
            showNotification('Welcome back, Admin!', 'success');
        } else {
            showNotification('Invalid password', 'error');
            adminPassword = '';
        }
    });
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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
    
    document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
    document.getElementById(`${tab}Tab`).style.display = 'block';
    
    loadCurrentTabData();
}

function loadCurrentTabData() {
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
    data.forEach((f, index) => {
        const card = document.createElement('div');
        card.className = 'card founder-card';
        card.innerHTML = `
            <div class="form-group"><label>Name</label><input type="text" value="${f.name}" class="form-control f-name"></div>
            <div class="form-group"><label>Role</label><input type="text" value="${f.role}" class="form-control f-role"></div>
            <div class="form-group"><label>Avatar Initials</label><input type="text" value="${f.avatar}" class="form-control f-avatar"></div>
            <div class="form-group"><label>Bio</label><textarea class="form-control f-bio">${f.bio}</textarea></div>
            <div class="form-group"><label>Color Gradient</label><input type="text" value="${f.color}" class="form-control f-color"></div>
            <div class="form-group"><label>Tag</label><input type="text" value="${f.tag || ''}" class="form-control f-tag"></div>
        `;
        list.appendChild(card);
    });
}

function saveFounders() {
    const cards = document.querySelectorAll('.founder-card');
    const data = Array.from(cards).map(c => ({
        name: c.querySelector('.f-name').value,
        role: c.querySelector('.f-role').value,
        avatar: c.querySelector('.f-avatar').value,
        bio: c.querySelector('.f-bio').value,
        color: c.querySelector('.f-color').value,
        tag: c.querySelector('.f-tag').value
    }));
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
    document.getElementById('termsTitle').value = data.title;
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

function showNotification(msg, type) {
    const n = document.getElementById('notification');
    n.textContent = msg;
    n.className = `notification show ${type}`;
    setTimeout(() => {
        n.classList.remove('show');
    }, 3000);
}
