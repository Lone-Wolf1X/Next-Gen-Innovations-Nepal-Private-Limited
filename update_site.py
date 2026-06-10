import os
import glob

# Adsense code to insert before </head>
adsense_code = """  <!-- Google Adsense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5547100647408071" crossorigin="anonymous"></script>
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

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    html_files = glob.glob("*.html") + glob.glob("admin/*.html")
    for filepath in html_files:
        update_html_file(filepath)
    print("Done updating HTML files.")
