import glob
import os

for html_file in glob.glob("*.html"):
    if html_file in ["learning.html", "rbb-5th-level.html", "sangathit-sangh-license.html"]:
        continue
    
    with open(html_file, 'r') as f:
        content = f.read()
    
    if "learning.html" not in content and '<li><a href="contact.html" class="nav-cta">Contact Us</a></li>' in content:
        content = content.replace(
            '<li><a href="contact.html" class="nav-cta">Contact Us</a></li>',
            '<li><a href="learning.html">Learning</a></li>\n        <li><a href="contact.html" class="nav-cta">Contact Us</a></li>'
        )
        with open(html_file, 'w') as f:
            f.write(content)
        print(f"Updated {html_file}")
