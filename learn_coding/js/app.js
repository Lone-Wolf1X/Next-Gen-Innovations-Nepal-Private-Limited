// ============================================================
// CodeQuest — App Logic (learn.html)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // ── State ──────────────────────────────────────────────────
  const state = {
    lang: new URLSearchParams(window.location.search).get('lang') || 'html',
    lessons: [],
    currentIdx: 0,
    currentStep: 1, // 1=theory, 2=quiz, 3=code
    userStats: { xp: 0, streak: 0 },
    completedLessons: {}, // { lessonId: true }
    editor: null,
    currentUser: null,
    starterCode: ''
  };

  // ── Elements ───────────────────────────────────────────────
  const el = {
    navCourseTag: document.getElementById('nav-course-tag'),
    navStreak: document.getElementById('nav-streak'),
    navXp: document.getElementById('nav-xp'),
    navUser: document.getElementById('nav-user'),
    lessonFill: document.getElementById('lesson-progress-fill'),
    lessonLabel: document.getElementById('lesson-progress-label'),
    sidebarList: document.getElementById('sidebar-lessons'),
    // Stepper
    si1: document.getElementById('si-1'),
    si2: document.getElementById('si-2'),
    si3: document.getElementById('si-3'),
    // Panes
    paneTheory: document.getElementById('pane-theory'),
    paneQuiz: document.getElementById('pane-quiz'),
    paneCode: document.getElementById('pane-code'),
    // Theory
    theoryBody: document.getElementById('theory-body'),
    btnToQuiz: document.getElementById('btn-to-quiz'),
    // Quiz
    quizQ: document.getElementById('quiz-q'),
    quizOptions: document.getElementById('quiz-options'),
    quizFeedback: document.getElementById('quiz-feedback'),
    quizExplanation: document.getElementById('quiz-explanation'),
    // Code
    codeInstructions: document.getElementById('code-instructions'),
    btnRun: document.getElementById('btn-run'),
    btnReset: document.getElementById('btn-reset'),
    consoleOut: document.getElementById('console-out'),
    editorLangLabel: document.getElementById('editor-lang-label'),
    // Modal
    modal: document.getElementById('modal-success'),
    modalXpBadge: document.getElementById('modal-xp-badge'),
    modalCompletionMsg: document.getElementById('modal-completion-msg'),
    btnNextLesson: document.getElementById('btn-next-lesson'),
    // Toast
    toast: document.getElementById('toast')
  };

  // ── Init ───────────────────────────────────────────────────
  function init() {
    const langData = window.CODEQUEST?.[state.lang];
    if (!langData || !langData.lessons.length) {
      showToast('❌ Is language ka curriculum abhi available nahi hai.', 'error');
      setTimeout(() => window.location.href = '/learn_coding/index.html', 2000);
      return;
    }

    state.lessons = langData.lessons;
    el.navCourseTag.textContent = langData.title;
    el.editorLangLabel.textContent = langData.title;
    document.title = `${langData.title} — CodeQuest GyanBazi`;

    // Firebase Auth
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        el.navUser.innerHTML = '<a href="/learn_coding/login.html" style="color:var(--primary);font-weight:700;">Login karo</a>';
        return;
      }
      state.currentUser = user;
      const name = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      el.navUser.textContent = name;
      loadUserProgress(user.uid);
    });

    // Init editor
    initEditor(langData.id);
    attachEvents();
    renderSidebar();
    loadLesson(0);
  }

  // ── Firebase ───────────────────────────────────────────────
  async function loadUserProgress(uid) {
    try {
      const db = firebase.firestore();
      const doc = await db.collection('codequest_users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data();
        state.userStats.xp = data.xp || 0;
        state.userStats.streak = data.streak || 0;

        // Load per-language progress
        if (data.progress && data.progress[state.lang]) {
          state.completedLessons = data.progress[state.lang];
        }

        updateNavStats();
        renderSidebar(); // Re-render with completed marks
        updateLessonProgressBar();

        // Jump to first incomplete lesson
        const firstIncomplete = state.lessons.findIndex(l => !state.completedLessons[l.id]);
        if (firstIncomplete > 0) loadLesson(firstIncomplete);
      }
    } catch(e) { console.error('Progress load error:', e); }
  }

  async function saveProgress(lessonId, xpEarned) {
    if (!state.currentUser) return;
    state.userStats.xp += xpEarned;
    state.completedLessons[lessonId] = true;
    updateNavStats();
    updateLessonProgressBar();
    renderSidebar();

    try {
      const db = firebase.firestore();
      const ref = db.collection('codequest_users').doc(state.currentUser.uid);
      await ref.set({
        uid: state.currentUser.uid,
        email: state.currentUser.email,
        displayName: state.currentUser.displayName || '',
        xp: firebase.firestore.FieldValue.increment(xpEarned),
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
        [`progress.${state.lang}.${lessonId}`]: true,
        [`lastLesson.${state.lang}`]: lessonId
      }, { merge: true });
    } catch(e) { console.error('Save error:', e); }
  }

  // ── UI Helpers ─────────────────────────────────────────────
  function updateNavStats() {
    el.navXp.textContent = state.userStats.xp;
    el.navStreak.textContent = state.userStats.streak;
  }

  function updateLessonProgressBar() {
    const completed = Object.keys(state.completedLessons).length;
    const total = state.lessons.length;
    const pct = Math.round((completed / total) * 100);
    el.lessonFill.style.width = pct + '%';
    el.lessonLabel.textContent = `${completed} / ${total}`;
  }

  function renderSidebar() {
    el.sidebarList.innerHTML = '';
    state.lessons.forEach((lesson, idx) => {
      const isDone = !!state.completedLessons[lesson.id];
      const isActive = idx === state.currentIdx;
      const li = document.createElement('li');
      li.className = `sidebar-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`;
      li.innerHTML = `
        <div class="si-num">${isDone ? '✓' : idx + 1}</div>
        <span>${lesson.title}</span>
        ${isDone ? '<span class="si-check">✅</span>' : ''}
      `;
      li.addEventListener('click', () => loadLesson(idx));
      el.sidebarList.appendChild(li);
    });
  }

  // ── Lesson Loading ─────────────────────────────────────────
  function loadLesson(idx) {
    if (idx < 0 || idx >= state.lessons.length) return;
    state.currentIdx = idx;
    const lesson = state.lessons[idx];
    state.starterCode = lesson.challenge.starterCode;

    // Reset state to step 1
    setStep(1);
    el.theoryBody.innerHTML = lesson.theory;

    // Quiz
    el.quizQ.innerHTML = lesson.quiz.question;
    el.quizOptions.innerHTML = '';
    el.quizFeedback.textContent = '';
    el.quizFeedback.className = 'quiz-feedback';
    el.quizExplanation.style.display = 'none';

    lesson.quiz.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.innerHTML = opt;
      btn.addEventListener('click', () => handleQuiz(btn, i, lesson.quiz.correctIndex, lesson.quiz.explanation));
      el.quizOptions.appendChild(btn);
    });

    // Code
    el.codeInstructions.innerHTML = lesson.challenge.instructions;
    state.editor.setValue(lesson.challenge.starterCode);
    el.consoleOut.textContent = '// Output yahaan dikhega...';
    el.consoleOut.className = 'console-pre';

    // Update editor mode
    const mode = state.lang === 'html' ? 'htmlmixed' : state.lang === 'css' ? 'css' : 'javascript';
    state.editor.setOption('mode', mode);

    renderSidebar();
  }

  function setStep(n) {
    state.currentStep = n;

    // Panes
    [el.paneTheory, el.paneQuiz, el.paneCode].forEach(p => p.classList.remove('active'));
    if (n === 1) el.paneTheory.classList.add('active');
    else if (n === 2) el.paneQuiz.classList.add('active');
    else if (n === 3) { el.paneCode.classList.add('active'); setTimeout(() => state.editor.refresh(), 80); }

    // Stepper
    el.si1.className = 'step-item';
    el.si2.className = 'step-item';
    el.si3.className = 'step-item';

    if (n === 1) el.si1.classList.add('active');
    else if (n === 2) { el.si1.classList.add('done'); el.si2.classList.add('active'); }
    else if (n === 3) { el.si1.classList.add('done'); el.si2.classList.add('done'); el.si3.classList.add('active'); }
  }

  // ── Quiz ───────────────────────────────────────────────────
  function handleQuiz(btn, selected, correct, explanation) {
    const opts = el.quizOptions.querySelectorAll('.quiz-opt');
    opts.forEach(o => o.disabled = true);

    if (selected === correct) {
      btn.classList.add('correct');
      el.quizFeedback.textContent = '✅ Bilkul sahi! Aage badho.';
      el.quizFeedback.className = 'quiz-feedback ok';
      if (explanation) {
        el.quizExplanation.textContent = '💡 ' + explanation;
        el.quizExplanation.style.display = 'block';
      }
      setTimeout(() => setStep(3), 1600);
    } else {
      btn.classList.add('wrong');
      opts[correct].classList.add('correct');
      el.quizFeedback.textContent = '❌ Galat! Sahi answer dekho aur theory dobara padho.';
      el.quizFeedback.className = 'quiz-feedback err';
      if (explanation) {
        el.quizExplanation.textContent = '💡 ' + explanation;
        el.quizExplanation.style.display = 'block';
      }
      setTimeout(() => {
        opts.forEach(o => { o.disabled = false; o.classList.remove('correct', 'wrong'); });
        el.quizFeedback.textContent = '';
        el.quizExplanation.style.display = 'none';
      }, 2500);
    }
  }

  // ── Code Execution ─────────────────────────────────────────
  function runCode() {
    const code = state.editor.getValue();
    const lesson = state.lessons[state.currentIdx];

    el.consoleOut.textContent = 'Running...\n';
    el.consoleOut.className = 'console-pre';

    setTimeout(() => {
      try {
        const result = lesson.challenge.test(code);
        if (result.success) {
          el.consoleOut.textContent = '✅ ' + result.msg;
          el.consoleOut.className = 'console-pre success-out';
          handleLessonComplete(lesson);
        } else {
          el.consoleOut.textContent = '❌ ' + result.msg;
          el.consoleOut.className = 'console-pre error-out';
        }
      } catch(e) {
        el.consoleOut.textContent = '⚠️ Error: ' + e.message;
        el.consoleOut.className = 'console-pre error-out';
      }
    }, 300);
  }

  // ── Lesson Complete ────────────────────────────────────────
  function handleLessonComplete(lesson) {
    const xp = lesson.xp || 50;
    const isAlreadyDone = !!state.completedLessons[lesson.id];

    if (!isAlreadyDone) {
      saveProgress(lesson.id, xp);
      el.modalXpBadge.textContent = `+${xp} XP`;
    } else {
      el.modalXpBadge.textContent = 'Already Completed!';
    }

    // Check if last lesson
    const isLast = state.currentIdx === state.lessons.length - 1;
    el.modalCompletionMsg.textContent = isLast
      ? '🏆 Tum ne HTML ka poora course complete kar liya! CSS seekhne ke liye aage badho.'
      : '';

    el.modal.classList.remove('hidden');
  }

  // ── Editor ─────────────────────────────────────────────────
  function initEditor(lang) {
    const modeMap = { html: 'htmlmixed', css: 'css', js: 'javascript' };
    state.editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
      lineNumbers: true,
      mode: modeMap[lang] || 'htmlmixed',
      theme: 'dracula',
      indentUnit: 2,
      tabSize: 2,
      lineWrapping: false,
      autoCloseTags: true,
      matchBrackets: true,
    });
  }

  // ── Events ─────────────────────────────────────────────────
  function attachEvents() {
    el.btnToQuiz.addEventListener('click', () => setStep(2));
    el.btnRun.addEventListener('click', runCode);
    el.btnReset.addEventListener('click', () => { state.editor.setValue(state.starterCode); el.consoleOut.textContent = '// Output yahaan dikhega...'; el.consoleOut.className = 'console-pre'; });

    el.btnNextLesson.addEventListener('click', () => {
      el.modal.classList.add('hidden');
      const next = state.currentIdx + 1;
      if (next < state.lessons.length) {
        loadLesson(next);
      } else {
        window.location.href = '/learn_coding/index.html';
      }
    });
  }

  // ── Toast ──────────────────────────────────────────────────
  function showToast(msg, type = '') {
    el.toast.textContent = msg;
    el.toast.className = `cq-toast show ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    setTimeout(() => el.toast.classList.remove('show'), 3000);
  }

  // Boot!
  init();
});
