'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTestEngine } from '@/hooks/useTestEngine';
import { Timer, Flag, ChevronLeft, ChevronRight, X } from 'lucide-react';
import '../TestInterface.css';

export default function TestInterface() {
  const { modelSetId } = useParams();
  const router = useRouter();
  
  const {
    state,
    loading,
    error,
    goTo,
    next,
    prev,
    selectAnswer,
    clearAnswer,
    toggleReview,
    submitTest
  } = useTestEngine(modelSetId as string);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !state.modelSet) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Failed to load test</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/courses')}>Back to Courses</button>
      </div>
    );
  }

  const { questions, currentIndex, answers, markedForReview, visitedQuestions, timeRemainingSeconds } = state;
  const currentQ = questions[currentIndex];
  
  const selectedAnswer = answers[currentQ?.id];
  const isMarked = markedForReview.has(currentQ?.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerClass = timeRemainingSeconds <= 300 ? 'timer-wrap danger' : timeRemainingSeconds <= 600 ? 'timer-wrap warning' : 'timer-wrap';

  return (
    <div className="test-layout">
      {/* Topbar */}
      <header className="test-topbar">
        <div>
          <div className="test-title">{state.modelSet.title}</div>
          <div className="test-progress-text">Q {currentIndex + 1} of {questions.length}</div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>

        <div className={timerClass}>
          <Timer size={18} />
          <span>{formatTime(timeRemainingSeconds)}</span>
        </div>

        <button className="btn btn-danger btn-sm" onClick={() => {
          if (confirm('Submit the test? You cannot change answers after submission.')) submitTest();
        }}>
          Submit Test
        </button>
      </header>

      {/* Main Question Area */}
      <main className="test-main">
        <div className="question-container">
          <div className="question-header">
            <div className="q-num">{currentIndex + 1}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-neutral">{currentQ.subject || 'General'}</span>
              <span className={`badge badge-${currentQ.difficulty || 'medium'}`}>{currentQ.difficulty || 'Medium'}</span>
              {isMarked && <span className="badge badge-warning"><Flag size={14} /> Marked</span>}
            </div>
          </div>

          <div className="q-text">{currentQ.questionText}</div>

          <div className="options-grid">
            {['a', 'b', 'c', 'd'].map((key) => (
              <div 
                key={key} 
                className={`option-item ${selectedAnswer === key ? 'selected' : ''}`}
                onClick={() => selectAnswer(currentQ.id, key)}
              >
                <div className="option-letter">{key.toUpperCase()}</div>
                <div>{currentQ.options[key as keyof typeof currentQ.options]}</div>
              </div>
            ))}
          </div>

          <div className="test-actions">
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={prev} disabled={currentIndex === 0}>
                <ChevronLeft size={16} /> Previous
              </button>
              <button className="btn btn-ghost" onClick={toggleReview}>
                <Flag size={16} /> {isMarked ? 'Unmark' : 'Mark for Review'}
              </button>
              <button className="btn btn-ghost" onClick={() => clearAnswer(currentQ.id)} disabled={!selectedAnswer}>
                <X size={16} /> Clear
              </button>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (currentIndex < questions.length - 1) next();
                else if (confirm('You reached the end. Submit test?')) submitTest();
              }}
            >
              {currentIndex < questions.length - 1 ? (
                <>Next <ChevronRight size={16} /></>
              ) : 'Submit Test'}
            </button>
          </div>
        </div>
      </main>

      {/* Sidebar Navigator */}
      <aside className="test-sidebar">
        <div style={{ padding: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>
          Question Navigator
        </div>
        
        <div className="nav-grid">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isQMarked = markedForReview.has(q.id);
            const isVisited = visitedQuestions.has(q.id);
            const isCurrent = i === currentIndex;

            let cls = 'nav-btn';
            if (isCurrent) cls += ' current';
            else if (isAnswered && isQMarked) cls += ' answered marked';
            else if (isAnswered) cls += ' answered';
            else if (isQMarked) cls += ' marked';
            else if (isVisited) cls += ' visited';

            return (
              <button key={q.id} className={cls} onClick={() => goTo(i)}>
                {i + 1}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--success)' }}>■ Answered</span>
            <span style={{ color: 'var(--danger)' }}>■ Not Answered (Visited)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--warning)' }}>■ Marked</span>
            <span style={{ color: 'var(--text-muted)' }}>■ Not Visited</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
