// ============================================================
// CodeQuest — Full HTML Curriculum (10 Lessons)
// ============================================================

const CODEQUEST_LANGUAGES = {
  html: {
    id: 'html',
    title: 'HTML',
    color: '#f97316',
    icon: '🌐',
    totalLessons: 10,
    lessons: [
      // ─── LESSON 1 ───────────────────────────────────────────────
      {
        id: 'html-l1',
        title: 'HTML kya hai?',
        xp: 30,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 1 — Introduction</span>
              <h2>HTML kya hai?</h2>
              <p>HTML ka full form hai <strong>HyperText Markup Language</strong>. Ye web pages ka skeleton (dhancha) banata hai. Browser HTML padh ke use ek sundar page mein convert karta hai.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Mera Pehla Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Namaste Duniya!&lt;/h1&gt;
    &lt;p&gt;Yeh mera pehla web page hai.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>DOCTYPE</strong> — Browser ko batata hai ki ye HTML5 document hai.</div>
              <div class="point">💡 <strong>&lt;html&gt;</strong> — Pura page is tag ke andar hota hai.</div>
              <div class="point">💡 <strong>&lt;head&gt;</strong> — Page ki settings (title, CSS link, etc.) yahaan aati hain.</div>
              <div class="point">💡 <strong>&lt;body&gt;</strong> — Jo kuch bhi screen pe dikhta hai, wo yahaan hota hai.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'HTML mein jo kuch bhi screen pe dikhta hai, wo kaunse tag ke andar likha jaata hai?',
          options: ['&lt;head&gt;', '&lt;html&gt;', '&lt;body&gt;', '&lt;title&gt;'],
          correctIndex: 2,
          explanation: '&lt;body&gt; tag ke andar jo bhi likho, wo browser screen pe dikhta hai!'
        },
        challenge: {
          instructions: 'Ek basic HTML page banao jisme <code>&lt;!DOCTYPE html&gt;</code>, <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, <code>&lt;title&gt;</code> aur <code>&lt;body&gt;</code> tag ho. Body mein "Namaste Duniya!" likho.',
          starterCode: `<!DOCTYPE html>
<html>
  <head>
    <title>Mera Page</title>
  </head>
  <body>
    <!-- Yahan likho -->
    
  </body>
</html>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<!doctype html>')) return { success: false, msg: '<!DOCTYPE html> add karo sabse upar.' };
            if (!c.includes('<html')) return { success: false, msg: '<html> tag nahi mila.' };
            if (!c.includes('<body')) return { success: false, msg: '<body> tag zaroor chahiye.' };
            if (!c.includes('</body>')) return { success: false, msg: '<body> tag close nahi kiya.' };
            if (!code.includes('Namaste Duniya!')) return { success: false, msg: 'Body ke andar "Namaste Duniya!" likho.' };
            return { success: true, msg: '🎉 Bahut badiya! Tumhara pehla HTML page ready hai!' };
          }
        }
      },

      // ─── LESSON 2 ───────────────────────────────────────────────
      {
        id: 'html-l2',
        title: 'Headings & Paragraphs',
        xp: 30,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 2 — Text Structure</span>
              <h2>Headings aur Paragraphs</h2>
              <p>HTML mein text ko structure karne ke liye headings (<code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>) aur paragraphs (<code>&lt;p&gt;</code>) use hote hain.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;h1&gt;Sabse Bada Heading&lt;/h1&gt;
&lt;h2&gt;Doosra Heading&lt;/h2&gt;
&lt;h3&gt;Teesra Heading&lt;/h3&gt;
&lt;p&gt;Yeh ek paragraph hai. Isme kai sentences ho sakte hain.&lt;/p&gt;
&lt;p&gt;Yeh doosra paragraph hai.&lt;/p&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>&lt;h1&gt;</strong> sabse bada, <strong>&lt;h6&gt;</strong> sabse chota heading hota hai.</div>
              <div class="point">💡 Har page pe sirf ek <strong>&lt;h1&gt;</strong> hona chahiye (SEO ke liye).</div>
              <div class="point">💡 <strong>&lt;p&gt;</strong> tag paragraphs ke liye use hota hai — ek nayi line se shuru hota hai.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Ek page pe kitne &lt;h1&gt; tags hone chahiye (SEO best practice)?',
          options: ['Kitne bhi', 'Sirf ek (1)', 'Do (2)', 'Koi bhi nahi'],
          correctIndex: 1,
          explanation: 'SEO ke liye ek page pe sirf ek <h1> hona chahiye. Ye page ka main title hota hai!'
        },
        challenge: {
          instructions: 'Ek HTML page banao jisme ek <code>&lt;h1&gt;</code> ho jisme "GyanBazi" likha ho, ek <code>&lt;h2&gt;</code> ho jisme "Apna Course" likha ho, aur ek <code>&lt;p&gt;</code> tag ho kisi bhi text ke saath.',
          starterCode: `<body>
  <!-- h1, h2 aur p tag yahan likho -->
  
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<h1')) return { success: false, msg: '<h1> tag chahiye.' };
            if (!c.includes('</h1>')) return { success: false, msg: '<h1> tag close nahi kiya.' };
            if (!code.includes('GyanBazi')) return { success: false, msg: 'h1 mein "GyanBazi" likho.' };
            if (!c.includes('<h2')) return { success: false, msg: '<h2> tag bhi chahiye.' };
            if (!code.includes('Apna Course')) return { success: false, msg: 'h2 mein "Apna Course" likho.' };
            if (!c.includes('<p')) return { success: false, msg: '<p> paragraph tag bhi chahiye.' };
            return { success: true, msg: '🎉 Perfect! Text structure samajh aa gaya!' };
          }
        }
      },

      // ─── LESSON 3 ───────────────────────────────────────────────
      {
        id: 'html-l3',
        title: 'Links — &lt;a&gt; Tag',
        xp: 40,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 3 — Hyperlinks</span>
              <h2>Links &lt;a&gt; Tag</h2>
              <p><strong>Hyperlinks</strong> (links) ek page se doosre page par jaane ka rasta dete hain. HTML mein <code>&lt;a&gt;</code> tag se links banate hain. <code>href</code> attribute mein URL dete hain.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;!-- Doosri website ka link --&gt;
&lt;a href="https://gyanbazi.com"&gt;GyanBazi Visit Karo&lt;/a&gt;

&lt;!-- Nayi tab mein kholne ke liye --&gt;
&lt;a href="https://google.com" target="_blank"&gt;Google&lt;/a&gt;

&lt;!-- Email link --&gt;
&lt;a href="mailto:info@gyanbazi.com"&gt;Email Karo&lt;/a&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>href</strong> attribute mein URL ya email address dete hain.</div>
              <div class="point">💡 <strong>target="_blank"</strong> se link nayi tab mein khulta hai.</div>
              <div class="point">💡 Link text (anchor text) <code>&lt;a&gt;</code> aur <code>&lt;/a&gt;</code> ke beech mein likhte hain.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Link ko nayi tab mein kholne ke liye kaunsa attribute use karte hain?',
          options: ['href="_blank"', 'target="_blank"', 'link="_new"', 'open="tab"'],
          correctIndex: 1,
          explanation: 'target="_blank" attribute se link nayi browser tab mein khulta hai!'
        },
        challenge: {
          instructions: 'Ek link banao jo "GyanBazi par Jao" text dikhaye aur "https://gyanbazi.com" par le jaye. Is link ko nayi tab mein kholna chahiye.',
          starterCode: `<body>
  <!-- a tag yahan banao -->
  
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<a ') && !c.includes('<a\n')) return { success: false, msg: '<a> tag chahiye.' };
            if (!c.includes('href=')) return { success: false, msg: 'href attribute chahiye.' };
            if (!c.includes('gyanbazi.com')) return { success: false, msg: 'href mein "https://gyanbazi.com" likho.' };
            if (!c.includes('target="_blank"')) return { success: false, msg: 'target="_blank" attribute add karo nayi tab ke liye.' };
            if (!code.includes('GyanBazi par Jao')) return { success: false, msg: 'Link text "GyanBazi par Jao" hona chahiye.' };
            return { success: true, msg: '🎉 Link ban gaya! Ab koi bhi click karke GyanBazi ja sakta hai.' };
          }
        }
      },

      // ─── LESSON 4 ───────────────────────────────────────────────
      {
        id: 'html-l4',
        title: 'Images — &lt;img&gt; Tag',
        xp: 40,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 4 — Images</span>
              <h2>Images &lt;img&gt; Tag</h2>
              <p>Web pages mein images add karne ke liye <code>&lt;img&gt;</code> tag use hota hai. Ye ek <strong>self-closing tag</strong> hai — isko close karne ki zaroorat nahi hoti.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;!-- Basic image --&gt;
&lt;img src="photo.jpg" alt="Meri photo"&gt;

&lt;!-- Online image --&gt;
&lt;img src="https://via.placeholder.com/300" alt="Placeholder"&gt;

&lt;!-- Size set karna --&gt;
&lt;img src="logo.png" alt="Logo" width="200" height="100"&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>src</strong> attribute mein image ka path ya URL dete hain.</div>
              <div class="point">💡 <strong>alt</strong> attribute mein image ka description dete hain (accessibility ke liye zaroor dalo!).</div>
              <div class="point">💡 <code>&lt;img&gt;</code> self-closing hai — &lt;/img&gt; likhne ki zaroorat nahi.</div>
            </div>
          </div>
        `,
        quiz: {
          question: '&lt;img&gt; tag mein image ka path ya URL kaunse attribute mein dete hain?',
          options: ['alt', 'href', 'src', 'url'],
          correctIndex: 2,
          explanation: 'src (source) attribute mein image ka path ya URL dete hain!'
        },
        challenge: {
          instructions: 'Ek image tag banao jo "https://via.placeholder.com/200" se image dikhaye. Alt text mein "Placeholder Image" likho.',
          starterCode: `<body>
  <!-- img tag yahan likho -->
  
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<img')) return { success: false, msg: '<img> tag chahiye.' };
            if (!c.includes('src=')) return { success: false, msg: 'src attribute chahiye image ka path dene ke liye.' };
            if (!c.includes('placeholder.com/200')) return { success: false, msg: 'src mein "https://via.placeholder.com/200" dalo.' };
            if (!c.includes('alt=')) return { success: false, msg: 'alt attribute zaroor daalo (accessibility)!' };
            if (!code.includes('Placeholder Image')) return { success: false, msg: 'alt mein "Placeholder Image" likho.' };
            return { success: true, msg: '🎉 Image tag bilkul sahi hai! Alt text bhi diya — well done!' };
          }
        }
      },

      // ─── LESSON 5 ───────────────────────────────────────────────
      {
        id: 'html-l5',
        title: 'Lists — ul, ol, li',
        xp: 40,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 5 — Lists</span>
              <h2>Lists — ul, ol, li</h2>
              <p>HTML mein do type ki lists hoti hain: <strong>Unordered List</strong> (bullets ke saath) aur <strong>Ordered List</strong> (numbers ke saath). Har item <code>&lt;li&gt;</code> tag mein aata hai.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;!-- Unordered list (bullets) --&gt;
&lt;ul&gt;
  &lt;li&gt;HTML&lt;/li&gt;
  &lt;li&gt;CSS&lt;/li&gt;
  &lt;li&gt;JavaScript&lt;/li&gt;
&lt;/ul&gt;

&lt;!-- Ordered list (numbers) --&gt;
&lt;ol&gt;
  &lt;li&gt;Pehle HTML seekho&lt;/li&gt;
  &lt;li&gt;Phir CSS seekho&lt;/li&gt;
  &lt;li&gt;Baad mein JavaScript&lt;/li&gt;
&lt;/ol&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>&lt;ul&gt;</strong> = Unordered List → bullets (•) dikhata hai.</div>
              <div class="point">💡 <strong>&lt;ol&gt;</strong> = Ordered List → numbers (1, 2, 3...) dikhata hai.</div>
              <div class="point">💡 <strong>&lt;li&gt;</strong> = List Item — har ek cheez &lt;li&gt; mein aati hai.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Numbered list (1, 2, 3...) banane ke liye kaunsa tag use karte hain?',
          options: ['&lt;ul&gt;', '&lt;li&gt;', '&lt;ol&gt;', '&lt;nl&gt;'],
          correctIndex: 2,
          explanation: '<ol> (Ordered List) se numbered list banati hai — 1, 2, 3... automatically aate hain!'
        },
        challenge: {
          instructions: 'Ek unordered list banao jisme teen items ho: "HTML", "CSS", "JavaScript". Phir ek ordered list banao jisme do items ho: "Theory Padho", "Code Likho".',
          starterCode: `<body>
  <!-- ul aur ol dono banao -->
  
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<ul')) return { success: false, msg: '<ul> tag chahiye unordered list ke liye.' };
            if (!c.includes('</ul>')) return { success: false, msg: '<ul> close karo.' };
            if (!c.includes('<ol')) return { success: false, msg: '<ol> tag chahiye ordered list ke liye.' };
            if (!c.includes('</ol>')) return { success: false, msg: '<ol> close karo.' };
            if (!code.includes('HTML')) return { success: false, msg: 'List mein "HTML" item daalo.' };
            if (!code.includes('CSS')) return { success: false, msg: 'List mein "CSS" item daalo.' };
            if (!code.includes('JavaScript')) return { success: false, msg: 'List mein "JavaScript" item daalo.' };
            const liCount = (c.match(/<li/g) || []).length;
            if (liCount < 5) return { success: false, msg: 'Kam se kam 5 list items chahiye (3 + 2).' };
            return { success: true, msg: '🎉 Dono lists bilkul sahi hain! Lists se data organize hota hai.' };
          }
        }
      },

      // ─── LESSON 6 ───────────────────────────────────────────────
      {
        id: 'html-l6',
        title: 'Tables — &lt;table&gt;',
        xp: 50,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 6 — Tables</span>
              <h2>Tables — &lt;table&gt;</h2>
              <p>HTML tables data ko rows aur columns mein organize karte hain — bilkul Excel spreadsheet ki tarah!</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;table&gt;
  &lt;tr&gt;                        &lt;!-- Table Row --&gt;
    &lt;th&gt;Naam&lt;/th&gt;           &lt;!-- Table Header --&gt;
    &lt;th&gt;Subject&lt;/th&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;Rahul&lt;/td&gt;          &lt;!-- Table Data --&gt;
    &lt;td&gt;HTML&lt;/td&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;Priya&lt;/td&gt;
    &lt;td&gt;CSS&lt;/td&gt;
  &lt;/tr&gt;
&lt;/table&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>&lt;table&gt;</strong> — Poori table ka wrapper.</div>
              <div class="point">💡 <strong>&lt;tr&gt;</strong> — Table Row (ek line).</div>
              <div class="point">💡 <strong>&lt;th&gt;</strong> — Table Header (bold, center hota hai).</div>
              <div class="point">💡 <strong>&lt;td&gt;</strong> — Table Data (normal cell).</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Table mein header cell (bold title) ke liye kaunsa tag use hota hai?',
          options: ['&lt;td&gt;', '&lt;tr&gt;', '&lt;th&gt;', '&lt;thead&gt;'],
          correctIndex: 2,
          explanation: '<th> (Table Header) cell bold aur centered hoti hai — headers ke liye use karo!'
        },
        challenge: {
          instructions: 'Ek table banao 2 headers: "Student" aur "Score". Neeche 2 data rows rakho: "Aarav" / "95" aur "Sita" / "88".',
          starterCode: `<body>
  <table>
    <!-- Table yahan banao -->
    
  </table>
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<table')) return { success: false, msg: '<table> tag chahiye.' };
            if (!c.includes('<tr')) return { success: false, msg: '<tr> (row) chahiye.' };
            if (!c.includes('<th')) return { success: false, msg: '<th> header cells chahiye.' };
            if (!c.includes('<td')) return { success: false, msg: '<td> data cells chahiye.' };
            if (!code.includes('Student')) return { success: false, msg: '"Student" header daalo.' };
            if (!code.includes('Score')) return { success: false, msg: '"Score" header daalo.' };
            if (!code.includes('Aarav')) return { success: false, msg: '"Aarav" row daalo.' };
            if (!code.includes('Sita')) return { success: false, msg: '"Sita" row daalo.' };
            return { success: true, msg: '🎉 Table bilkul perfect hai! Data clearly organize ho gaya.' };
          }
        }
      },

      // ─── LESSON 7 ───────────────────────────────────────────────
      {
        id: 'html-l7',
        title: 'Forms — &lt;form&gt;, Input',
        xp: 60,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 7 — Forms</span>
              <h2>Forms — &lt;form&gt; aur Input</h2>
              <p>HTML forms user se data collect karte hain — jaise login form, search box, feedback form. Forms mein alag alag types ke inputs hote hain.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;form action="/submit" method="POST"&gt;
  
  &lt;label for="naam"&gt;Apna Naam:&lt;/label&gt;
  &lt;input type="text" id="naam" name="naam" placeholder="Naam likho"&gt;

  &lt;label for="email"&gt;Email:&lt;/label&gt;
  &lt;input type="email" id="email" name="email"&gt;

  &lt;input type="submit" value="Submit Karo"&gt;

&lt;/form&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>&lt;form&gt;</strong> — Sab inputs ka wrapper. action = data kahaan jayega.</div>
              <div class="point">💡 <strong>&lt;label&gt;</strong> — Input ka label (naam). for attribute input ke id se match hona chahiye.</div>
              <div class="point">💡 <strong>&lt;input&gt;</strong> — Self-closing. type= "text", "email", "password", "submit".</div>
              <div class="point">💡 <strong>placeholder</strong> — Input box ke andar hint text dikhata hai.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Password field banane ke liye input mein kaunsa type use karte hain?',
          options: ['type="text"', 'type="hidden"', 'type="password"', 'type="secret"'],
          correctIndex: 2,
          explanation: 'type="password" se input mein jo bhi type karo, stars (•••) mein dikhta hai!'
        },
        challenge: {
          instructions: 'Ek simple login form banao jisme: ek email input (type="email"), ek password input (type="password"), aur ek submit button ho. Dono inputs ke upar labels bhi rakho.',
          starterCode: `<body>
  <form>
    <!-- Email, password fields aur submit button banao -->
    
  </form>
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<form')) return { success: false, msg: '<form> tag chahiye.' };
            if (!c.includes('type="email"')) return { success: false, msg: 'Email input chahiye: type="email".' };
            if (!c.includes('type="password"')) return { success: false, msg: 'Password input chahiye: type="password".' };
            if (!c.includes('type="submit"') && !c.includes('<button')) return { success: false, msg: 'Submit button chahiye.' };
            if (!c.includes('<label')) return { success: false, msg: 'Labels bhi daalo inputs ke liye.' };
            return { success: true, msg: '🎉 Login form ready hai! Forms se user data collect hota hai.' };
          }
        }
      },

      // ─── LESSON 8 ───────────────────────────────────────────────
      {
        id: 'html-l8',
        title: 'Divs & Spans — Layout',
        xp: 50,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 8 — Containers</span>
              <h2>Divs &amp; Spans — Layout ke liye</h2>
              <p><code>&lt;div&gt;</code> aur <code>&lt;span&gt;</code> HTML ke sabse common containers hain. Ye koi khaas meaning nahi rakhte — sirf group karne aur style karne ke kaam aate hain.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;!-- div = block level container (puri line leta hai) --&gt;
&lt;div class="card"&gt;
  &lt;h2&gt;HTML Course&lt;/h2&gt;
  &lt;p&gt;Beginner friendly course.&lt;/p&gt;
&lt;/div&gt;

&lt;!-- span = inline container (text ke beech kaam karta hai) --&gt;
&lt;p&gt;
  Yeh &lt;span style="color: red;"&gt;laal rang&lt;/span&gt; ka text hai.
&lt;/p&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>&lt;div&gt;</strong> — Block-level element. Ek nayi line se shuru hota hai. Layout ke liye use hota hai.</div>
              <div class="point">💡 <strong>&lt;span&gt;</strong> — Inline element. Text ke beech use hota hai, line nahi todta.</div>
              <div class="point">💡 <strong>class</strong> attribute — CSS styling ke liye naam dete hain element ko.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Text ke andar ek word ko alag style dene ke liye kaunsa tag sabse acha hai?',
          options: ['&lt;div&gt;', '&lt;section&gt;', '&lt;span&gt;', '&lt;block&gt;'],
          correctIndex: 2,
          explanation: '<span> inline hai — ye text flow nahi todta aur ek word ya sentence ko target kar sakta hai!'
        },
        challenge: {
          instructions: 'Ek <code>&lt;div&gt;</code> banao jisme class="profile-card" ho. Uske andar ek heading "Rahul Sharma" aur ek paragraph ho. Phir ek alag paragraph mein ek <code>&lt;span&gt;</code> use karo jisme "important" word ko style karo (color="red").',
          starterCode: `<body>
  <!-- div aur span dono use karo -->
  
</body>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<div')) return { success: false, msg: '<div> tag chahiye.' };
            if (!c.includes('class="profile-card"') && !c.includes("class='profile-card'")) return { success: false, msg: 'div ko class="profile-card" do.' };
            if (!code.includes('Rahul Sharma')) return { success: false, msg: 'div ke andar "Rahul Sharma" heading daalo.' };
            if (!c.includes('<span')) return { success: false, msg: '<span> tag bhi chahiye.' };
            return { success: true, msg: '🎉 Divs aur spans use kar liye! Ab CSS se inhe beautiful bana sakte ho.' };
          }
        }
      },

      // ─── LESSON 9 ───────────────────────────────────────────────
      {
        id: 'html-l9',
        title: 'Semantic HTML',
        xp: 60,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 9 — Semantic HTML</span>
              <h2>Semantic HTML</h2>
              <p>HTML5 mein kuch <strong>semantic tags</strong> aaye jo page ke alag-alag sections ka meaning batate hain. Sirf divs use karne se better hai — Google aur screen readers inhe samajhte hain.</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;header&gt;
  &lt;nav&gt;
    &lt;a href="/"&gt;Home&lt;/a&gt;
    &lt;a href="/about"&gt;About&lt;/a&gt;
  &lt;/nav&gt;
&lt;/header&gt;

&lt;main&gt;
  &lt;article&gt;
    &lt;h1&gt;Mera Blog Post&lt;/h1&gt;
    &lt;p&gt;Content yahaan...&lt;/p&gt;
  &lt;/article&gt;
  
  &lt;aside&gt;
    &lt;p&gt;Related links&lt;/p&gt;
  &lt;/aside&gt;
&lt;/main&gt;

&lt;footer&gt;
  &lt;p&gt;© 2026 GyanBazi&lt;/p&gt;
&lt;/footer&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>&lt;header&gt;</strong> — Page ya section ka header (logo, nav).</div>
              <div class="point">💡 <strong>&lt;main&gt;</strong> — Page ka main content.</div>
              <div class="point">💡 <strong>&lt;footer&gt;</strong> — Page ka bottom section.</div>
              <div class="point">💡 <strong>&lt;nav&gt;</strong> — Navigation links.</div>
              <div class="point">💡 <strong>&lt;article&gt;</strong> — Independent content (blog post, news).</div>
              <div class="point">💡 <strong>&lt;aside&gt;</strong> — Side content (sidebar).</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Page ke copyright aur contact info ke liye kaunsa semantic tag sabse sahi hai?',
          options: ['&lt;bottom&gt;', '&lt;footer&gt;', '&lt;end&gt;', '&lt;aside&gt;'],
          correctIndex: 1,
          explanation: '<footer> tag page ka neeche wala section hai — copyright, social links, contact info yahin aata hai!'
        },
        challenge: {
          instructions: 'Ek proper semantic HTML structure banao jisme <code>&lt;header&gt;</code> (ek nav link ke saath), <code>&lt;main&gt;</code> (ek heading ke saath), aur <code>&lt;footer&gt;</code> (copyright text ke saath) ho.',
          starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Semantic structure banao -->
  
</body>
</html>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('<header')) return { success: false, msg: '<header> tag chahiye.' };
            if (!c.includes('</header>')) return { success: false, msg: '<header> close karo.' };
            if (!c.includes('<main')) return { success: false, msg: '<main> tag chahiye.' };
            if (!c.includes('</main>')) return { success: false, msg: '<main> close karo.' };
            if (!c.includes('<footer')) return { success: false, msg: '<footer> tag chahiye.' };
            if (!c.includes('</footer>')) return { success: false, msg: '<footer> close karo.' };
            if (!c.includes('<nav')) return { success: false, msg: 'Header mein <nav> tag daalo.' };
            return { success: true, msg: '🎉 Excellent! Semantic HTML se Google aur accessibility improve hoti hai!' };
          }
        }
      },

      // ─── LESSON 10 ───────────────────────────────────────────────
      {
        id: 'html-l10',
        title: 'HTML Attributes & Meta Tags',
        xp: 70,
        theory: `
          <div class="theory-block">
            <div class="theory-intro">
              <span class="theory-tag">Lesson 10 — Final Chapter</span>
              <h2>Attributes &amp; Meta Tags</h2>
              <p>HTML attributes tags ko extra information dete hain. <strong>Meta tags</strong> page ke baare mein search engines ko information dete hain — SEO ke liye critical hain!</p>
            </div>
            <div class="theory-example">
              <div class="code-label">📄 Example</div>
              <pre><code>&lt;head&gt;
  &lt;!-- Character encoding --&gt;
  &lt;meta charset="UTF-8"&gt;
  
  &lt;!-- Mobile responsive --&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  
  &lt;!-- Google ke liye description --&gt;
  &lt;meta name="description" content="GyanBazi pe free coding seekho!"&gt;
  
  &lt;!-- Page title (browser tab mein dikhta hai) --&gt;
  &lt;title&gt;GyanBazi — Free Coding&lt;/title&gt;
&lt;/head&gt;</code></pre>
            </div>
            <div class="theory-points">
              <div class="point">💡 <strong>charset="UTF-8"</strong> — Hindi, Nepali characters support karta hai.</div>
              <div class="point">💡 <strong>viewport</strong> meta — Mobile pe page sahi dikhne ke liye zaroor daalo.</div>
              <div class="point">💡 <strong>description</strong> meta — Google search results mein dikhta hai.</div>
              <div class="point">💡 <strong>&lt;title&gt;</strong> — Browser tab mein aur Google search mein dikhta hai.</div>
            </div>
          </div>
        `,
        quiz: {
          question: 'Mobile pe page sahi dikhane ke liye kaunsa meta tag zaroor daalna chahiye?',
          options: [
            'meta name="mobile"',
            'meta name="viewport" content="width=device-width"',
            'meta name="responsive"',
            'meta type="mobile"'
          ],
          correctIndex: 1,
          explanation: 'viewport meta tag se page mobile screens pe sahi scale hota hai — ye aaj kal zaroor daalna chahiye!'
        },
        challenge: {
          instructions: 'Ek complete HTML page ka &lt;head&gt; section banao jisme: charset UTF-8 meta, viewport meta, description meta ("GyanBazi pe coding seekho"), aur title "CodeQuest — GyanBazi" ho.',
          starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags aur title yahan daalo -->
  
</head>
<body>
  <h1>My Professional Page</h1>
</body>
</html>`,
          test: (code) => {
            const c = code.toLowerCase();
            if (!c.includes('charset="utf-8"') && !c.includes("charset='utf-8'")) return { success: false, msg: 'charset="UTF-8" meta tag daalo.' };
            if (!c.includes('viewport')) return { success: false, msg: 'viewport meta tag chahiye mobile ke liye.' };
            if (!c.includes('width=device-width')) return { success: false, msg: 'viewport mein "width=device-width" content daalo.' };
            if (!c.includes('name="description"')) return { success: false, msg: 'description meta tag daalo.' };
            if (!code.includes('GyanBazi pe coding seekho')) return { success: false, msg: 'Description mein "GyanBazi pe coding seekho" likho.' };
            if (!c.includes('<title>')) return { success: false, msg: '<title> tag daalo.' };
            if (!code.includes('CodeQuest — GyanBazi')) return { success: false, msg: 'Title mein "CodeQuest — GyanBazi" likho.' };
            return { success: true, msg: '🏆 Congratulations! Tumne HTML ka poora course complete kar liya! Ab CSS ki taraf badho!' };
          }
        }
      }
    ] // end lessons
  }, // end html

  css: {
    id: 'css',
    title: 'CSS',
    color: '#3b82f6',
    icon: '🎨',
    totalLessons: 8,
    lessons: [] // Coming soon
  },

  js: {
    id: 'js',
    title: 'JavaScript',
    color: '#eab308',
    icon: '⚡',
    totalLessons: 12,
    lessons: [] // Coming soon
  }
};

window.CODEQUEST = CODEQUEST_LANGUAGES;
