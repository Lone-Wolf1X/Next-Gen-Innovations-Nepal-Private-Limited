'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { Question, ModelSet, TestState } from '@/types/test';

export function useTestEngine(modelSetId: string) {
  const [state, setState] = useState<TestState>({
    modelSet: null,
    questions: [],
    attemptId: null,
    currentIndex: 0,
    answers: {},
    markedForReview: new Set(),
    visitedQuestions: new Set(),
    timeRemainingSeconds: 0,
    isSubmitting: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(state); // For accessing latest state in intervals

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // INITIALIZATION
  useEffect(() => {
    async function initTest() {
      if (!modelSetId) return;
      try {
        setLoading(true);
        // Load model set
        const setData = await fetchAPI(`model_sets.php?action=getWithQuestions&id=${modelSetId}`);
        if (!setData) throw new Error('Model set not found');

        // Start Attempt via API
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        const attempt = await fetchAPI('attempts.php?action=start', 'POST', {
          userId: user.uid,
          modelSetId: setData.id,
          totalQuestions: setData.questions.length,
          timeLimitMinutes: setData.timeLimitMinutes
        });

        // Normalize questions if needed (handling old JSON string formats from DB)
        const questions = setData.questions.map((q: any) => {
          let opts = q.options;
          if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch(e){}
          }
          if (Array.isArray(opts)) {
            const obj: any = {};
            const keys = ['a', 'b', 'c', 'd'];
            opts.forEach((o, i) => { if(i<4) obj[keys[i]] = o; });
            opts = obj;
          }
          return { ...q, options: opts };
        });

        const initialState: TestState = {
          modelSet: setData,
          questions,
          attemptId: attempt.id,
          currentIndex: 0,
          answers: attempt.resumed && attempt.answers ? attempt.answers : {},
          markedForReview: attempt.resumed && attempt.markedForReview 
            ? new Set(attempt.markedForReview) 
            : new Set(),
          visitedQuestions: new Set([questions[0]?.id]), // Visit first question
          timeRemainingSeconds: attempt.timeRemainingSeconds || (setData.timeLimitMinutes * 60),
          isSubmitting: false,
        };

        setState(initialState);
        startTimers();
      } catch (err: any) {
        setError(err.message || 'Failed to initialize test');
      } finally {
        setLoading(false);
      }
    }
    initTest();

    return () => stopTimers();
  }, [modelSetId]);

  const startTimers = useCallback(() => {
    // Main Timer Countdown
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemainingSeconds <= 1) {
          stopTimers();
          handleAutoSubmit();
          return { ...prev, timeRemainingSeconds: 0 };
        }
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);

    // Auto-save Timer (every 30 seconds)
    autoSaveRef.current = setInterval(() => {
      const { attemptId, timeRemainingSeconds, isSubmitting } = stateRef.current;
      if (attemptId && !isSubmitting) {
        fetchAPI(`attempts.php?action=saveTimer&id=${attemptId}`, 'POST', { timeRemainingSeconds })
          .catch(err => console.warn('Autosave timer failed', err));
      }
    }, 30000);
  }, []);

  const stopTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    submitTest(true);
  }, []);

  // NAVIGATION
  const goTo = (index: number) => {
    if (index < 0 || index >= state.questions.length) return;
    setState(prev => {
      const newVisited = new Set(prev.visitedQuestions);
      newVisited.add(prev.questions[index].id);
      return { ...prev, currentIndex: index, visitedQuestions: newVisited };
    });
  };
  const next = () => goTo(state.currentIndex + 1);
  const prev = () => goTo(state.currentIndex - 1);

  // ANSWER MANAGEMENT
  const selectAnswer = async (questionId: string, option: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option }
    }));
    
    // Save to API
    if (state.attemptId) {
      fetchAPI(`attempts.php?action=saveAnswer&id=${state.attemptId}`, 'POST', {
        questionId,
        selectedOption: option,
        timeRemainingSeconds: stateRef.current.timeRemainingSeconds
      }).catch(e => console.warn('Save answer API failed', e));
    }
  };

  const clearAnswer = async (questionId: string) => {
    setState(prev => {
      const newAnswers = { ...prev.answers };
      delete newAnswers[questionId];
      return { ...prev, answers: newAnswers };
    });

    if (state.attemptId) {
      fetchAPI(`attempts.php?action=saveAnswer&id=${state.attemptId}`, 'POST', {
        questionId,
        selectedOption: null,
        timeRemainingSeconds: stateRef.current.timeRemainingSeconds
      }).catch(e => console.warn('Clear answer API failed', e));
    }
  };

  const toggleReview = async () => {
    const qId = state.questions[state.currentIndex].id;
    setState(prev => {
      const newMarked = new Set(prev.markedForReview);
      const isMarked = newMarked.has(qId);
      if (isMarked) newMarked.delete(qId);
      else newMarked.add(qId);
      
      if (prev.attemptId) {
        fetchAPI(`attempts.php?action=toggleReview&id=${prev.attemptId}`, 'POST', {
          questionId: qId,
          isMarked: !isMarked
        });
      }
      return { ...prev, markedForReview: newMarked };
    });
  };

  // SUBMIT
  const submitTest = async (isAuto = false) => {
    if (stateRef.current.isSubmitting) return;
    setState(prev => ({ ...prev, isSubmitting: true }));
    stopTimers();

    const { attemptId, answers, timeRemainingSeconds, modelSet, questions } = stateRef.current;
    
    try {
      const user = auth.currentUser;
      const res = await fetchAPI('results.php?action=submit', 'POST', {
        attemptId,
        userId: user?.uid,
        modelSetId: modelSet?.id,
        attemptData: { answers, timeRemainingSeconds },
        modelSet,
        questions
      });

      // Navigate to results
      window.location.href = `/results/${res.resultId}`;
    } catch (err) {
      console.error('Submit failed', err);
      alert('Submission failed. Please try again.');
      setState(prev => ({ ...prev, isSubmitting: false }));
      startTimers(); // resume if failed
    }
  };

  return {
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
  };
}
