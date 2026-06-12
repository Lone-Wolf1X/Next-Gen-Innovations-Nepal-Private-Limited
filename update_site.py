import os
import glob
import re

# Adsense code to insert before </head>
adsense_code = """  <!-- Google Adsense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5547100647408071" crossorigin="anonymous"></script>
"""

amp_head_code = """  <!-- AMP Auto Ads Script -->
  <script async custom-element="amp-auto-ads"
        src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">
  </script>
"""

amp_body_code = """  <!-- AMP Auto Ads Element -->
  <amp-auto-ads type="adsense"
        data-ad-client="ca-pub-5547100647408071">
  </amp-auto-ads>
"""

def update_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Replace email
    content = content.replace("info@nextgennepal.com", "info@nextgeninnovations.com.np")

    # 2. Replace phone format 1
    content = content.replace("+977 9811305806", "+977-9852860110")
    # Replace any leftover phone number without the code
    content = content.replace("9811305806", "9852860110")

    # 3. Add adsense if not exists
    if "adsbygoogle.js" not in content:
        content = content.replace("</head>", adsense_code + "</head>")
        
    # 4. Add AMP auto ads script to head
    if "amp-auto-ads-0.1.js" not in content:
        content = content.replace("</head>", amp_head_code + "</head>")
        
    # 5. Add AMP auto ads element right after body tag
    if "<amp-auto-ads type=" not in content:
        content = re.sub(r'(<body[^>]*>)', r'\1\n' + amp_body_code, content, count=1)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    html_files = glob.glob("*.html") + glob.glob("admin/*.html")
    for filepath in html_files:
        update_html_file(filepath)
    print("Done updating HTML files.")
