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

# Subjective HTML
subjective_main = """
<div class="page-topbar">
  <div><div class="page-title">Subjective Bank</div><div class="page-subtitle">Manage theoretical questions, answers, and writing guides.</div></div>
  <button class="btn btn-primary" onclick="showForm()">+ New Question</button>
</div>
<div class="page-body">
  <div style="margin-bottom:20px; display:flex; gap:12px;">
    <select id="filterVacancy" class="input-field" style="width:300px;" onchange="loadTopics()">
        <option value="">Select Vacancy...</option>
    </select>
    <select id="filterTopic" class="input-field" style="width:300px;" onchange="loadQuestions()">
        <option value="">Select Topic...</option>
    </select>
  </div>
  
  <div id="questionsList">
    <div class="card card-padded" style="text-align:center; color:#666;">Select a vacancy and topic to view questions.</div>
  </div>

  <!-- Form Modal -->
  <div id="questionFormModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:999; justify-content:center; align-items:center; padding:20px;">
    <div class="card card-padded" style="width:100%; max-width:800px; max-height:90vh; overflow-y:auto; background:white;">
      <h3 style="margin-bottom:20px;" id="formTitle">Add Subjective Question</h3>
      
      <form id="questionForm" onsubmit="saveQuestion(event)">
        <input type="hidden" id="q_id" />
        
        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Topic</label>
          <select id="q_topic_id" class="input-field" required></select>
        </div>
        
        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Question Text</label>
          <textarea id="q_text" class="input-field" rows="3" required></textarea>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Writing Guide (HTML Supported)</label>
          <div style="font-size:0.8rem; color:#666; margin-bottom:8px;">Instructions on how to structure the answer.</div>
          <textarea id="q_guide" class="input-field" rows="4" style="font-family:monospace;"></textarea>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block; font-weight:600; margin-bottom:8px;">Sample Answer / Core Points (HTML Supported)</label>
          <textarea id="q_sample" class="input-field" rows="5" style="font-family:monospace;"></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button type="button" class="btn" style="background:#e5e7eb; color:#374151;" onclick="document.getElementById('questionFormModal').style.display='none'">Cancel</button>
          <button type="submit" class="btn btn-primary" id="saveBtn">Save Question</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
window.initPage = async (user) => {
    currentUser = user;
    loadVacancies();
};

let currentUser = null;
let allTopics = [];
let allQuestions = [];

async function loadVacancies() {
    try {
        const res = await fetch('/learn/backend/api/admin.php?action=getVacancies', {
            headers: { 'Authorization': `Bearer ${currentUser.uid}` }
        }).then(r=>r.json());
        
        const sel = document.getElementById('filterVacancy');
        res.forEach(v => {
            if(v.has_subjective == 1) {
                const opt = document.createElement('option');
                opt.value = v.id; opt.textContent = v.title;
                sel.appendChild(opt);
            }
        });
    } catch(e) { console.error(e); }
}

async function loadTopics() {
    const vid = document.getElementById('filterVacancy').value;
    if(!vid) return;
    
    try {
        const res = await fetch(`/learn/backend/api/admin.php?action=getSubjectiveTopics&vacancy_id=${vid}`, {
            headers: { 'Authorization': `Bearer ${currentUser.uid}` }
        }).then(r=>r.json());
        
        allTopics = res;
        const sel = document.getElementById('filterTopic');
        const f_topic = document.getElementById('q_topic_id');
        
        sel.innerHTML = '<option value="">Select Topic...</option>';
        f_topic.innerHTML = '';
        
        res.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id; opt.textContent = t.title;
            sel.appendChild(opt);
            
            const opt2 = document.createElement('option');
            opt2.value = t.id; opt2.textContent = t.title;
            f_topic.appendChild(opt2);
        });
        
        document.getElementById('questionsList').innerHTML = '<div class="card card-padded" style="text-align:center; color:#666;">Select a topic to view questions.</div>';
    } catch(e) { console.error(e); }
}

async function loadQuestions() {
    const tid = document.getElementById('filterTopic').value;
    if(!tid) return;
    
    try {
        const res = await fetch(`/learn/backend/api/admin.php?action=getSubjectiveQuestions&topic_id=${tid}`, {
            headers: { 'Authorization': `Bearer ${currentUser.uid}` }
        }).then(r=>r.json());
        
        allQuestions = res;
        
        if (res.length === 0) {
            document.getElementById('questionsList').innerHTML = '<div class="card card-padded">No questions found for this topic.</div>';
            return;
        }

        let html = '<div style="display:grid; gap:16px;">';
        res.forEach(q => {
            html += `
              <div class="card card-padded" style="display:flex; justify-content:space-between; align-items:start;">
                 <div style="flex:1;">
                    <h4 style="margin-bottom:8px; font-weight:600;">${q.question_text}</h4>
                 </div>
                 <button class="btn" onclick="editQuestion('${q.id}')" style="background:#e5e7eb; margin-left:12px;">Edit</button>
              </div>
            `;
        });
        html += '</div>';
        document.getElementById('questionsList').innerHTML = html;
        
    } catch(e) { console.error(e); }
}

function showForm() {
    if(allTopics.length === 0) {
        alert("Please select a Vacancy first to load its topics.");
        return;
    }
    document.getElementById('questionForm').reset();
    document.getElementById('q_id').value = '';
    
    const tid = document.getElementById('filterTopic').value;
    if(tid) document.getElementById('q_topic_id').value = tid;
    
    document.getElementById('formTitle').textContent = 'Add Question';
    document.getElementById('questionFormModal').style.display = 'flex';
}

function editQuestion(id) {
    const q = allQuestions.find(x => x.id === id);
    if(!q) return;
    
    document.getElementById('formTitle').textContent = 'Edit Question';
    document.getElementById('q_id').value = q.id;
    document.getElementById('q_topic_id').value = q.topic_id;
    document.getElementById('q_text').value = q.question_text;
    document.getElementById('q_guide').value = q.writing_guide || '';
    document.getElementById('q_sample').value = q.sample_answer || '';
    
    document.getElementById('questionFormModal').style.display = 'flex';
}

async function saveQuestion(e) {
    e.preventDefault();
    document.getElementById('saveBtn').textContent = 'Saving...';
    
    const payload = {
        id: document.getElementById('q_id').value,
        topic_id: document.getElementById('q_topic_id').value,
        question_text: document.getElementById('q_text').value,
        writing_guide: document.getElementById('q_guide').value,
        sample_answer: document.getElementById('q_sample').value
    };
    
    try {
        const res = await fetch('/learn/backend/api/admin.php?action=saveSubjectiveQuestion', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.uid}` },
            body: JSON.stringify(payload)
        }).then(r=>r.json());
        
        if(res.success) {
            document.getElementById('questionFormModal').style.display = 'none';
            // Reload if we are viewing the same topic
            if(document.getElementById('filterTopic').value == payload.topic_id) {
                loadQuestions();
            }
        } else {
            alert(res.error || 'Failed to save');
        }
    } catch(e) {
        alert('Network error');
    }
    document.getElementById('saveBtn').textContent = 'Save Question';
}
</script>
"""

generate_page("subjective-bank.html", "Subjective Bank", subjective_main)
print("Generated subjective-bank.html")
