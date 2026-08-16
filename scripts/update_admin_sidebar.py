import os
import re

SIDEBAR_HTML = """<aside class="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo" style="background:linear-gradient(135deg,#DC2626,#B91C1C);">A</div>
      <div><div class="sidebar-name">Admin Panel</div><div class="sidebar-tagline">GyanBazi</div></div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-title">Overview</div>
      <a href="/learn/admin/index.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
        Dashboard
      </a>
      <a href="/learn/admin/vacancies.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
        Vacancies
      </a>
      <a href="/learn/admin/live-exam.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
        Daily Sprint
      </a>

      <div class="sidebar-section-title">Content</div>
      <a href="/learn/admin/categories.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
        Categories & Subjects
      </a>
      <a href="/learn/admin/objective-topics.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
        Objective Topics
      </a>
      <a href="/learn/admin/questions.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
        Questions
      </a>
      <a href="/learn/admin/modelsets.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
        Model Sets
      </a>
      <a href="/learn/admin/subjective-bank.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>
        Subjective Bank
      </a>
      <a href="/learn/admin/ai-import.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
        AI JSON Importer
      </a>

      <div class="sidebar-section-title">Users</div>
      <a href="/learn/admin/users.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
        Users
      </a>

      <div class="sidebar-section-title">System</div>
      <a href="/learn/index.html" class="sidebar-link admin-sidebar-link">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/></svg>
        Back to Platform
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="Auth.signOut()">
        <div class="sidebar-avatar" id="adminAvatar">A</div>
        <div class="sidebar-user-info"><div class="sidebar-user-name" id="adminName">Admin</div><div class="sidebar-user-email" id="adminEmail">...</div></div>
      </div>
    </div>
  </aside>"""

admin_dir = "/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/admin"
for filename in os.listdir(admin_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(admin_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace the entire <aside class="sidebar">...</aside> block
        pattern = re.compile(r'<aside class="sidebar">.*?</aside>', re.DOTALL)
        new_content = pattern.sub(SIDEBAR_HTML, content)
        
        # Also need to make the current page active.
        # find the href that ends with filename and add 'active' class
        # It looks like: class="sidebar-link admin-sidebar-link"
        active_pattern = re.compile(rf'href="/learn/admin/{filename}" class="sidebar-link admin-sidebar-link"')
        new_content = active_pattern.sub(f'href="/learn/admin/{filename}" class="sidebar-link admin-sidebar-link active"', new_content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
print("Updated all admin sidebars.")
