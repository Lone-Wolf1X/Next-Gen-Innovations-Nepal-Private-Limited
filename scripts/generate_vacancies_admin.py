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
    # Remove active from index.html if it's there
    if filename != "index.html":
        page_sidebar = page_sidebar.replace('href="/learn/admin/index.html" class="sidebar-link admin-sidebar-link active"', 'href="/learn/admin/index.html" class="sidebar-link admin-sidebar-link"')

    full_html = f"{header}\n{page_sidebar}\n<main class=\"main-content\">\n{main_content}\n</main>\n{footer}"
    
    with open(os.path.join(admin_dir, filename), "w", encoding="utf-8") as f:
        f.write(full_html)

# 1. Vacancies HTML
vacancies_main = """
<div class="page-topbar">
  <div><div class="page-title">Vacancies Management</div><div class="page-subtitle">Manage exams, courses, and syllabus roadmaps.</div></div>
  <button class="btn btn-primary" onclick="showForm()">+ New Vacancy</button>
</div>
<div class="page-body">
  <div id="vacanciesList">
    <div class="loading-spinner"></div>
  </div>

  <!-- Form Modal -->
  <div id="vacancyFormModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:999; justify-content:center; align-items:center; padding:20px;">
    <div class="card card-padded" style="width:100%; max-width:800px; max-height:90vh; overflow-y:auto; background:white;">
      <h3 style="margin-bottom:20px;" id="formTitle">Create Vacancy</h3>
      
      <form id="vacancyForm" onsubmit="saveVacancy(event)">
        <input type="hidden" id="v_id" />
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">Title</label>
            <input type="text" id="v_title" class="input-field" required placeholder="e.g. RBB Level 4" />
          </div>
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">Category</label>
            <select id="v_category_id" class="input-field" required>
              <option value="cat-rbb">RBB</option>
              <option value="cat-sanstha">Sangathit Sanstha</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Description</label>
          <textarea id="v_description" class="input-field" rows="2"></textarea>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">App Open Date</label>
            <input type="date" id="v_open" class="input-field" />
          </div>
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">App Close Date</label>
            <input type="date" id="v_close" class="input-field" />
          </div>
          <div>
            <label style="display:block; font-weight:600; margin-bottom:8px;">Exam Date</label>
            <input type="date" id="v_exam" class="input-field" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <label style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="v_objective" checked /> Has Objective (MCQs)
            </label>
            <label style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="v_subjective" checked /> Has Subjective
            </label>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Syllabus / Roadmap (HTML Supported)</label>
          <div style="font-size:0.8rem; color:#666; margin-bottom:8px;">Paste AI-generated HTML here.</div>
          <textarea id="v_roadmap" class="input-field" rows="6" style="font-family:monospace;"></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button type="button" class="btn" style="background:#e5e7eb; color:#374151;" onclick="document.getElementById('vacancyFormModal').style.display='none'">Cancel</button>
          <button type="submit" class="btn btn-primary" id="saveBtn">Save Vacancy</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
window.initPage = async (user) => {
    loadVacancies(user);
};

let currentUser = null;
let allVacancies = [];

async function loadVacancies(user) {
    currentUser = user;
    try {
        const res = await fetch('/learn/backend/api/admin.php?action=getVacancies', {
            headers: { 'Authorization': `Bearer ${user.uid}` }
        }).then(r=>r.json());
        
        allVacancies = res;
        
        if (res.length === 0) {
            document.getElementById('vacanciesList').innerHTML = '<div class="card card-padded">No vacancies found. Create one!</div>';
            return;
        }

        let html = '<div style="display:grid; gap:16px;">';
        res.forEach(v => {
            html += `
              <div class="card card-padded" style="display:flex; justify-content:space-between; align-items:center;">
                 <div>
                    <h3 style="margin-bottom:4px; color:var(--primary-dark);">${v.title}</h3>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${v.category_name || v.category_id} | Exam: ${v.exam_date || 'TBA'}</div>
                 </div>
                 <button class="btn" onclick="editVacancy('${v.id}')" style="background:#e5e7eb;">Edit</button>
              </div>
            `;
        });
        html += '</div>';
        document.getElementById('vacanciesList').innerHTML = html;
        
    } catch(e) {
        console.error(e);
        document.getElementById('vacanciesList').innerHTML = '<div style="color:red;">Error loading data</div>';
    }
}

function showForm() {
    document.getElementById('vacancyForm').reset();
    document.getElementById('v_id').value = '';
    document.getElementById('formTitle').textContent = 'Create Vacancy';
    document.getElementById('vacancyFormModal').style.display = 'flex';
}

function editVacancy(id) {
    const v = allVacancies.find(x => x.id === id);
    if(!v) return;
    
    document.getElementById('formTitle').textContent = 'Edit Vacancy';
    document.getElementById('v_id').value = v.id;
    document.getElementById('v_title').value = v.title;
    document.getElementById('v_category_id').value = v.category_id;
    document.getElementById('v_description').value = v.description || '';
    document.getElementById('v_open').value = v.application_open_date || '';
    document.getElementById('v_close').value = v.application_close_date || '';
    document.getElementById('v_exam').value = v.exam_date || '';
    document.getElementById('v_objective').checked = v.has_objective == 1;
    document.getElementById('v_subjective').checked = v.has_subjective == 1;
    document.getElementById('v_roadmap').value = v.roadmap_html || '';
    
    document.getElementById('vacancyFormModal').style.display = 'flex';
}

async function saveVacancy(e) {
    e.preventDefault();
    document.getElementById('saveBtn').textContent = 'Saving...';
    
    const payload = {
        id: document.getElementById('v_id').value,
        title: document.getElementById('v_title').value,
        category_id: document.getElementById('v_category_id').value,
        description: document.getElementById('v_description').value,
        application_open_date: document.getElementById('v_open').value,
        application_close_date: document.getElementById('v_close').value,
        exam_date: document.getElementById('v_exam').value,
        has_objective: document.getElementById('v_objective').checked,
        has_subjective: document.getElementById('v_subjective').checked,
        roadmap_html: document.getElementById('v_roadmap').value
    };
    
    try {
        const res = await fetch('/learn/backend/api/admin.php?action=saveVacancy', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.uid}` },
            body: JSON.stringify(payload)
        }).then(r=>r.json());
        
        if(res.success) {
            document.getElementById('vacancyFormModal').style.display = 'none';
            loadVacancies(currentUser);
        } else {
            alert(res.error || 'Failed to save');
        }
    } catch(e) {
        alert('Network error');
    }
    document.getElementById('saveBtn').textContent = 'Save Vacancy';
}
</script>
"""

generate_page("vacancies.html", "Vacancies Management", vacancies_main)
print("Generated vacancies.html")
