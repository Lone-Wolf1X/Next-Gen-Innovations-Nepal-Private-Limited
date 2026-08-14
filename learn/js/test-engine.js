// =========================================================
// GyanBazi — Test Engine
// Handles: Timer, Navigation, Answer saving, Submission
// =========================================================

const TestEngine = (() => {

  let state = {
    modelSet: null,
    questions: [],
    attemptId: null,
    userId: null,
    currentIndex: 0,
    answers: {},           // questionId → 'a'|'b'|'c'|'d'
    markedForReview: new Set(),
    visitedQuestions: new Set(),
    timeRemainingSeconds: 0,
    timerInterval: null,
    autoSaveInterval: null,
    isSubmitting: false,
    isSaved: false,
  };

  // ─── INITIALIZE ──────────────────────────────────────────
  async function init(modelSetId, userId) {
    state.userId = userId;

    // Load model set with questions
    const setData = await DB.modelSets.getWithQuestions(modelSetId);
    if (!setData) throw new Error('Model set not found');

    state.modelSet = setData;
    state.questions = setData.questions;

    // Start or resume attempt
    const attempt = await DB.attempts.start(
      userId, modelSetId,
      state.questions.length,
      setData.timeLimitMinutes
    );

    state.attemptId = attempt.id;
    state.timeRemainingSeconds = attempt.timeRemainingSeconds;

    // Restore saved answers if resuming
    if (attempt.resumed && attempt.answers) {
      state.answers = { ...attempt.answers };
    }
    if (attempt.resumed && attempt.markedForReview) {
      state.markedForReview = new Set(attempt.markedForReview);
    }

    return { attempt, setData };
  }

  // ─── TIMER ───────────────────────────────────────────────
  function startTimer(onTick, onExpire) {
    updateTimerDisplay(onTick);
    state.timerInterval = setInterval(() => {
      state.timeRemainingSeconds--;
      updateTimerDisplay(onTick);
      if (state.timeRemainingSeconds <= 0) {
        clearInterval(state.timerInterval);
        onExpire();
      }
    }, 1000);
  }

  function updateTimerDisplay(onTick) {
    const el = document.getElementById('testTimer');
    if (!el) return;
    el.textContent = formatTime(state.timeRemainingSeconds);
    const timerWrap = el.closest('.test-timer');
    if (timerWrap) {
      timerWrap.className = 'test-timer';
      if (state.timeRemainingSeconds <= 300) timerWrap.classList.add('danger');
      else if (state.timeRemainingSeconds <= 600) timerWrap.classList.add('warning');
    }
    if (onTick) onTick(state.timeRemainingSeconds);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  // ─── AUTO-SAVE ───────────────────────────────────────────
  function startAutoSave() {
    state.autoSaveInterval = setInterval(async () => {
      if (state.attemptId && !state.isSubmitting) {
        await DB.attempts.saveTimer(state.attemptId, state.timeRemainingSeconds);
      }
    }, 30000); // every 30 seconds
  }

  function stopAutoSave() {
    clearInterval(state.autoSaveInterval);
  }

  // ─── NAVIGATION ──────────────────────────────────────────
  function goTo(index) {
    if (index < 0 || index >= state.questions.length) return;
    state.visitedQuestions.add(state.questions[state.currentIndex].id);
    state.currentIndex = index;
    renderQuestion();
    updateNavigator();
  }

  function next() { goTo(state.currentIndex + 1); }
  function prev() { goTo(state.currentIndex - 1); }

  // ─── ANSWER SELECTION ────────────────────────────────────
  async function selectAnswer(questionId, option) {
    state.answers[questionId] = option;
    updateNavigator();

    // Save to Firestore
    try {
      await DB.attempts.saveAnswer(state.attemptId, questionId, option, state.timeRemainingSeconds);
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  }

  async function clearAnswer(questionId) {
    delete state.answers[questionId];
    // Remove from Firestore
    await DB.attempts.saveAnswer(state.attemptId, questionId, null, state.timeRemainingSeconds);
    renderQuestion();
    updateNavigator();
  }

  async function toggleReview() {
    const qId = state.questions[state.currentIndex].id;
    const wasMarked = state.markedForReview.has(qId);
    if (wasMarked) {
      state.markedForReview.delete(qId);
    } else {
      state.markedForReview.add(qId);
    }
    await DB.attempts.toggleReview(state.attemptId, qId, !wasMarked);
    renderQuestion();
    updateNavigator();
    updateReviewBtn();
  }

  // ─── RENDER QUESTION ─────────────────────────────────────
  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    const selectedAnswer = state.answers[q.id];
    const isMarked = state.markedForReview.has(q.id);

    // Update question number display
    const qNumEl = document.getElementById('currentQNum');
    if (qNumEl) qNumEl.textContent = `Q ${state.currentIndex + 1} of ${state.questions.length}`;

    // Update progress bar
    const progressEl = document.getElementById('progressBar');
    if (progressEl) {
      progressEl.style.width = `${((state.currentIndex + 1) / state.questions.length) * 100}%`;
    }

    const container = document.getElementById('questionArea');
    if (!container) return;

    const optionKeys = ['a', 'b', 'c', 'd'];
    const optionLabels = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="question-card">
        <div class="question-header">
          <div class="question-num">${state.currentIndex + 1}</div>
          <div class="question-meta">
            <span class="badge badge-neutral">${q.subject || 'General'}</span>
            <span class="badge badge-${q.difficulty || 'medium'}">${(q.difficulty || 'Medium').charAt(0).toUpperCase() + (q.difficulty || 'medium').slice(1)}</span>
            ${isMarked ? '<span class="badge badge-warning">⚑ Marked</span>' : ''}
          </div>
        </div>

        <div class="question-text">${q.questionText}</div>

        <div class="options-list">
          ${optionKeys.map((key, i) => `
            <label class="option-item ${selectedAnswer === key ? 'selected' : ''}" onclick="TestEngine.selectAnswer('${q.id}', '${key}')">
              <input type="radio" name="q_${q.id}" value="${key}" ${selectedAnswer === key ? 'checked' : ''}>
              <div class="option-label">${optionLabels[i]}</div>
              <div class="option-text">${q.options[key] || ''}</div>
            </label>
          `).join('')}
        </div>

        <div class="question-nav-buttons">
          <button class="btn btn-ghost btn-sm" onclick="TestEngine.prev()" ${state.currentIndex === 0 ? 'disabled' : ''}>
            ← Previous
          </button>
          <button class="btn btn-ghost btn-sm" id="reviewBtn" onclick="TestEngine.toggleReview()">
            ${isMarked ? '⚑ Unmark' : '⚐ Mark for Review'}
          </button>
          <button class="btn btn-ghost btn-sm" onclick="TestEngine.clearAnswer('${q.id}')" ${!selectedAnswer ? 'disabled' : ''}>
            ✕ Clear
          </button>
          <button class="btn btn-primary btn-sm" onclick="${state.currentIndex < state.questions.length - 1 ? 'TestEngine.next()' : 'TestEngine.promptSubmit()'}" style="margin-left:auto;">
            ${state.currentIndex < state.questions.length - 1 ? 'Next →' : 'Submit Test'}
          </button>
        </div>
      </div>
    `;
  }

  function updateReviewBtn() {
    const qId = state.questions[state.currentIndex]?.id;
    const btn = document.getElementById('reviewBtn');
    if (btn && qId) {
      btn.textContent = state.markedForReview.has(qId) ? '⚑ Unmark' : '⚐ Mark for Review';
    }
  }

  // ─── QUESTION NAVIGATOR ───────────────────────────────────
  function updateNavigator() {
    const container = document.getElementById('questionNavigator');
    if (!container) return;

    container.innerHTML = state.questions.map((q, i) => {
      const isAnswered = !!state.answers[q.id];
      const isMarked = state.markedForReview.has(q.id);
      const isVisited = state.visitedQuestions.has(q.id);
      const isCurrent = i === state.currentIndex;

      let cls = 'q-nav-btn';
      if (isCurrent) cls += ' current';
      else if (isAnswered && isMarked) cls += ' answered marked';
      else if (isAnswered) cls += ' answered';
      else if (isMarked) cls += ' marked';
      else if (isVisited) cls += ' visited';

      return `<button class="${cls}" onclick="TestEngine.goTo(${i})" title="Q${i+1}">${i + 1}</button>`;
    }).join('');

    // Update summary counts
    const answered = Object.keys(state.answers).length;
    const marked = state.markedForReview.size;
    const unattempted = state.questions.length - answered;

    const summaryEl = document.getElementById('navSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="display:flex;gap:12px;padding:12px 16px;font-size:0.775rem;color:var(--text-muted);border-top:1px solid var(--border);flex-wrap:wrap;">
          <span><strong style="color:var(--success);">${answered}</strong> Answered</span>
          <span><strong style="color:var(--warning);">${marked}</strong> Marked</span>
          <span><strong style="color:var(--text-muted);">${unattempted}</strong> Unattempted</span>
        </div>
      `;
    }
  }

  // ─── SUBMISSION ───────────────────────────────────────────
  function promptSubmit() {
    const answered = Object.keys(state.answers).length;
    const unattempted = state.questions.length - answered;

    const msg = unattempted > 0
      ? `You have ${unattempted} unattempted question(s). Are you sure you want to submit?`
      : 'Submit the test? You cannot change answers after submission.';

    if (confirm(msg)) submitTest();
  }

  async function submitTest(isAutoSubmit = false) {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    stopTimer();
    stopAutoSave();

    if (isAutoSubmit) {
      showToast('Time is up! Submitting your test...', 'warning', 4000);
    }

    // Disable all option labels
    const optionItems = document.querySelectorAll('.option-item');
    optionItems.forEach(el => el.style.pointerEvents = 'none');

    // Show loading
    const submitBtn = document.querySelector('.test-topbar .btn-danger');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const result = await DB.results.submit(
        state.attemptId,
        state.userId,
        state.modelSet.id,
        { answers: state.answers, timeRemainingSeconds: state.timeRemainingSeconds },
        state.modelSet,
        state.questions
      );

      // Navigate to results page
      window.location.href = `/learn/result.html?id=${result.resultId}`;

    } catch (err) {
      console.error('Submit error:', err);
      showToast('Submission failed. Please try again.', 'error');
      state.isSubmitting = false;
    }
  }

  // ─── BROWSER UNLOAD WARNING ───────────────────────────────
  function enableUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
      if (!state.isSubmitting) {
        e.preventDefault();
        e.returnValue = 'Your test is in progress. Leaving will not lose your answers, but the timer will continue.';
        return e.returnValue;
      }
    });
  }

  // ─── GETTERS ─────────────────────────────────────────────
  function getState() { return state; }
  function getQuestion(index) { return state.questions[index]; }

  return {
    init,
    startTimer,
    stopTimer,
    startAutoSave,
    goTo,
    next,
    prev,
    selectAnswer,
    clearAnswer,
    toggleReview,
    renderQuestion,
    updateNavigator,
    promptSubmit,
    submitTest,
    enableUnloadWarning,
    getState,
    getQuestion,
  };
})();
