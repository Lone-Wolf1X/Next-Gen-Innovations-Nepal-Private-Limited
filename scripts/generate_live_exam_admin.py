import os
import re

admin_dir = "/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/admin"
index_path = os.path.join(admin_dir, "index.html")

with open(index_path, "r", encoding="utf-8") as f:
    index_html = f.read()

# Extract header
header_match = re.search(r'(.*?<div class="app-layout" id="appLayout".*?>)', index_html, re.DOTALL)
header = header_match.group(1) if header_match else ""

# Extract sidebar
sidebar_match = re.search(r'(<aside class="sidebar">.*?</aside>)', index_html, re.DOTALL)
sidebar = sidebar_match.group(1) if sidebar_match else ""

footer = """
</div>
<script type="module">
import { Auth } from '../js/auth.js';
window.Auth = Auth;

window.onload = async () => {
    document.getElementById('pageLoader').style.display = 'none';
    document.getElementById('appLayout').style.display = 'flex';
    
    Auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '/learn/login.html';
            return;
        }
        document.getElementById('adminName').textContent = user.displayName || 'Admin';
        document.getElementById('adminEmail').textContent = user.email;
        if(window.initPage) window.initPage(user);
    });
};
</script>
</body>
</html>
"""

def generate_page(filename, title, main_content):
    page_sidebar = sidebar.replace(
        f'href="/learn/admin/{filename}" class="sidebar-link admin-sidebar-link"',
        f'href="/learn/admin/{filename}" class="sidebar-link admin-sidebar-link active"'
    )
    if filename != "index.html":
        page_sidebar = page_sidebar.replace('href="/learn/admin/index.html" class="sidebar-link admin-sidebar-link active"', 'href="/learn/admin/index.html" class="sidebar-link admin-sidebar-link"')

    full_html = f"{header}\n{page_sidebar}\n<main class=\"main-content\">\n{main_content}\n</main>\n{footer}"
    with open(os.path.join(admin_dir, filename), "w", encoding="utf-8") as f:
        f.write(full_html)

# Live Exam HTML
live_exam_main = """
<div class="page-topbar">
  <div><div class="page-title">Daily Sprints (Live Exams)</div><div class="page-subtitle">Configure today's live competitive exams.</div></div>
  <button class="btn btn-primary" onclick="showForm()">+ Schedule Sprint</button>
</div>
<div class="page-body">
  
  <div id="sprintsList">
    <div class="loading-spinner"></div>
  </div>

  <!-- Form Modal -->
  <div id="sprintFormModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:999; justify-content:center; align-items:center; padding:20px;">
    <div class="card card-padded" style="width:100%; max-width:600px; background:white;">
      <h3 style="margin-bottom:20px;" id="formTitle">Schedule Sprint</h3>
      
      <form id="sprintForm" onsubmit="saveSprint(event)">
        <input type="hidden" id="s_id" />
        
        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Select Model Set</label>
          <select id="s_model_set" class="input-field" required></select>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Sprint Date (YYYY-MM-DD)</label>
          <input type="date" id="s_date" class="input-field" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">Start Time</label>
            <input type="datetime-local" id="s_start" class="input-field" required />
          </div>
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">End Time</label>
            <input type="datetime-local" id="s_end" class="input-field" required />
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Status</label>
          <select id="s_status" class="input-field">
             <option value="active">Active (Visible)</option>
             <option value="completed">Completed (Archived)</option>
          </select>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button type="button" class="btn" style="background:#e5e7eb; color:#374151;" onclick="document.getElementById('sprintFormModal').style.display='none'">Cancel</button>
          <button type="submit" class="btn btn-primary" id="saveBtn">Save Sprint</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
window.initPage = async (user) => {
    currentUser = user;
    loadDependencies();
    loadSprints();
};

let currentUser = null;
let allSprints = [];

async function loadDependencies() {
    // Fetch all model sets to populate the dropdown
    try {
        const res = await fetch('/learn/backend/api/model_sets.php?action=list').then(r=>r.json());
        const sel = document.getElementById('s_model_set');
        res.forEach(ms => {
            const opt = document.createElement('option');
            opt.value = ms.id; opt.textContent = ms.title;
            sel.appendChild(opt);
        });
    } catch(e) { console.error(e); }
}

async function loadSprints() {
    try {
        const res = await fetch('/learn/backend/api/admin.php?action=getDailySprints', {
            headers: { 'Authorization': `Bearer ${currentUser.uid}` }
        }).then(r=>r.json());
        
        allSprints = res;
        
        if (res.length === 0) {
            document.getElementById('sprintsList').innerHTML = '<div class="card card-padded">No daily sprints found.</div>';
            return;
        }

        let html = '<div style="display:grid; gap:16px;">';
        res.forEach(s => {
            const isActive = s.status === 'active';
            html += `
              <div class="card card-padded" style="display:flex; justify-content:space-between; align-items:center; border-left: 4px solid ${isActive ? 'var(--primary)' : 'var(--border)'}">
                 <div>
                    <h3 style="margin-bottom:4px; color:var(--primary-dark);">${s.model_set_title}</h3>
                    <div style="font-size:0.85rem; color:var(--text-muted);">
                      Date: <strong>${s.sprint_date}</strong> | Status: ${s.status.toUpperCase()}
                    </div>
                    <div style="font-size:0.75rem; color:#888; margin-top:4px;">
                      From: ${new Date(s.start_time).toLocaleString()} <br>
                      To: ${new Date(s.end_time).toLocaleString()}
                    </div>
                 </div>
                 <button class="btn" onclick="editSprint('${s.id}')" style="background:#e5e7eb;">Edit</button>
              </div>
            `;
        });
        html += '</div>';
        document.getElementById('sprintsList').innerHTML = html;
        
    } catch(e) { console.error(e); }
}

function showForm() {
    document.getElementById('sprintForm').reset();
    document.getElementById('s_id').value = '';
    
    // Default to today and a 24hr window
    const now = new Date();
    document.getElementById('s_date').value = now.toISOString().split('T')[0];
    
    // Formatting local datetime for input type="datetime-local" is tricky, doing a simple slice
    const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, -1);
    const localStart = localISOTime.substring(0, 16);
    
    const tomorrow = new Date(Date.now() + 86400000 - tzOffset).toISOString().slice(0, 16);
    
    document.getElementById('s_start').value = localStart;
    document.getElementById('s_end').value = tomorrow;
    
    document.getElementById('formTitle').textContent = 'Schedule Sprint';
    document.getElementById('sprintFormModal').style.display = 'flex';
}

function editSprint(id) {
    const s = allSprints.find(x => x.id === id);
    if(!s) return;
    
    document.getElementById('formTitle').textContent = 'Edit Sprint';
    document.getElementById('s_id').value = s.id;
    document.getElementById('s_model_set').value = s.model_set_id;
    document.getElementById('s_date').value = s.sprint_date;
    
    // Convert to datetime-local format (YYYY-MM-DDThh:mm)
    document.getElementById('s_start').value = s.start_time.replace(' ', 'T').substring(0, 16);
    document.getElementById('s_end').value = s.end_time.replace(' ', 'T').substring(0, 16);
    document.getElementById('s_status').value = s.status;
    
    document.getElementById('sprintFormModal').style.display = 'flex';
}

async function saveSprint(e) {
    e.preventDefault();
    document.getElementById('saveBtn').textContent = 'Saving...';
    
    const payload = {
        id: document.getElementById('s_id').value,
        model_set_id: document.getElementById('s_model_set').value,
        sprint_date: document.getElementById('s_date').value,
        start_time: document.getElementById('s_start').value.replace('T', ' ') + ':00',
        end_time: document.getElementById('s_end').value.replace('T', ' ') + ':00',
        status: document.getElementById('s_status').value
    };
    
    try {
        const res = await fetch('/learn/backend/api/admin.php?action=saveSprint', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.uid}` },
            body: JSON.stringify(payload)
        }).then(r=>r.json());
        
        if(res.success) {
            document.getElementById('sprintFormModal').style.display = 'none';
            loadSprints();
        } else {
            alert(res.error || 'Failed to save');
        }
    } catch(e) {
        alert('Network error');
    }
    document.getElementById('saveBtn').textContent = 'Save Sprint';
}
</script>
"""

generate_page("live-exam.html", "Live Exam", live_exam_main)
print("Generated live-exam.html")
