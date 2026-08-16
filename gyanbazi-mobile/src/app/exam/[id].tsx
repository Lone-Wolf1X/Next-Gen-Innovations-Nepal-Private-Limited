import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function ExamScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [modelSet, setModelSet] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Prevent hardware back button from closing test accidentally
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit Test?', 'Are you sure you want to exit? Your progress is saved, but time will keep ticking if you resume later.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const initTest = async () => {
    if (!user || !id) return;
    try {
      // 1. Fetch Model Set
      const setRes = await apiClient.get(`model_sets.php?action=getById&id=${id}`);
      if (!setRes.data) throw new Error('Test not found');
      
      let qData = setRes.data.questions;
      
      // Normalize questions array -> object (for AI imports)
      qData.forEach((q: any) => {
        if (typeof q.options === 'string') {
          try { q.options = JSON.parse(q.options); } catch(e){}
        }
        if (Array.isArray(q.options)) {
          const obj: any = {};
          const keys = ['a', 'b', 'c', 'd'];
          q.options.forEach((opt: string, i: number) => {
            if (i < 4) obj[keys[i]] = opt;
          });
          if (q.correctOption && q.correctOption.length > 1) {
            const idx = q.options.findIndex((o: string) => o === q.correctOption);
            if (idx !== -1 && idx < 4) q.correctOption = keys[idx];
            else {
              const firstChar = q.correctOption.charAt(0).toLowerCase();
              if (keys.includes(firstChar)) q.correctOption = firstChar;
            }
          }
          q.options = obj;
        }
      });

      setModelSet(setRes.data);
      setQuestions(qData);

      // 2. Start Attempt
      const attemptRes = await apiClient.post('attempts.php?action=start', {
        userId: user.uid,
        modelSetId: id
      });

      const attempt = attemptRes.data;
      setAttemptId(attempt.id);
      setTimeRemaining(attempt.timeRemainingSeconds);
      
      // Restore saved answers
      if (attempt.answers && typeof attempt.answers === 'object') {
        setAnswers(attempt.answers);
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        Alert.alert('Limit Reached', 'You have reached your daily limit of free tests. Upgrade to Premium to continue.');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to start test. Please try again.');
        router.back();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    Alert.alert('Time is up!', 'Your test will now be automatically submitted.');
    submitTest();
  };

  const selectAnswer = async (qId: string, option: string) => {
    const newAnswers = { ...answers, [qId]: option };
    setAnswers(newAnswers);
    
    // Auto-save to server (fire and forget)
    apiClient.post('attempts.php?action=saveAnswer', {
      attemptId,
      questionId: qId,
      selectedOption: option,
      timeRemainingSeconds: timeRemaining
    }).catch(e => console.warn('Auto-save failed', e));
  };

  const toggleMarkReview = (qId: string) => {
    setMarked({ ...marked, [qId]: !marked[qId] });
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Build attempt object expected by backend
      const attemptPayload = {
        answers,
        timeRemainingSeconds: timeRemaining
      };

      const res = await apiClient.post('results.php?action=submit', {
        attemptId,
        userId: user?.uid,
        modelSetId: id,
        attempt: attemptPayload,
        set: modelSet,
        questionList: questions
      });

      if (res.data && res.data.success) {
        // Navigate to Result screen
        router.replace(`/result/${res.data.id}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Submission Error', 'Failed to submit test. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A56DB" />
        <Text style={{marginTop: 10, color: '#64748B'}}>Preparing your test...</Text>
      </View>
    );
  }

  const currentQ = questions[currentIndex];
  const qId = currentQ?.id;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowNavGrid(true)} style={styles.headerBtn}>
          <Ionicons name="grid" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={20} color="#EF4444" />
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        </View>

        <TouchableOpacity onPress={() => {
          Alert.alert('Submit Test', 'Are you sure you want to submit your test?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Submit', style: 'default', onPress: submitTest }
          ]);
        }} style={styles.submitBtnHeader}>
          <Text style={styles.submitBtnTextHeader}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
      </View>

      {/* Question Area */}
      <ScrollView style={styles.qContainer}>
        <View style={styles.qHeader}>
          <Text style={styles.qNumber}>Question {currentIndex + 1} of {questions.length}</Text>
          <View style={styles.qMarks}>
            <Text style={styles.qMarksText}>{currentQ.marks || 1} Marks</Text>
          </View>
        </View>

        <Text style={styles.qText}>{currentQ.questionText}</Text>

        <View style={styles.optionsContainer}>
          {Object.keys(currentQ.options || {}).map((optKey, idx) => {
            const isSelected = answers[qId] === optKey;
            const labels = ['A', 'B', 'C', 'D'];
            return (
              <TouchableOpacity 
                key={optKey} 
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => selectAnswer(qId, optKey)}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.optLabel}>{labels[idx]}.</Text>
                <Text style={[styles.optText, isSelected && styles.optTextSelected]}>{currentQ.options[optKey]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={() => toggleMarkReview(qId)}
        >
          <Ionicons name={marked[qId] ? "bookmark" : "bookmark-outline"} size={24} color={marked[qId] ? "#F59E0B" : "#64748B"} />
          <Text style={[styles.controlBtnText, marked[qId] && {color: '#F59E0B'}]}>Review</Text>
        </TouchableOpacity>
        
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity 
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex(prev => prev - 1)}
          >
            <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? "#CBD5E1" : "#1E293B"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navBtn, currentIndex === questions.length - 1 && styles.navBtnDisabled]}
            disabled={currentIndex === questions.length - 1}
            onPress={() => setCurrentIndex(prev => prev + 1)}
          >
            <Ionicons name="chevron-forward" size={24} color={currentIndex === questions.length - 1 ? "#CBD5E1" : "#1E293B"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigator Modal */}
      <Modal visible={showNavGrid} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Question Navigator</Text>
              <TouchableOpacity onPress={() => setShowNavGrid(false)}>
                <Ionicons name="close" size={28} color="#1E293B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#10B981'}]}/><Text style={styles.legendText}>Answered</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#F59E0B'}]}/><Text style={styles.legendText}>Marked</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#E2E8F0'}]}/><Text style={styles.legendText}>Unvisited</Text></View>
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
              {questions.map((q, i) => {
                const isAns = !!answers[q.id];
                const isMark = !!marked[q.id];
                const isCurr = i === currentIndex;
                
                let bg = '#E2E8F0';
                let txt = '#475569';
                if (isAns) { bg = '#10B981'; txt = 'white'; }
                if (isMark) { bg = '#F59E0B'; txt = 'white'; }

                return (
                  <TouchableOpacity 
                    key={q.id}
                    style={[styles.gridBox, {backgroundColor: bg}, isCurr && styles.gridBoxCurrent]}
                    onPress={() => { setCurrentIndex(i); setShowNavGrid(false); }}
                  >
                    <Text style={[styles.gridText, {color: txt}]}>{i + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => {
              setShowNavGrid(false);
              Alert.alert('Submit Test', 'Are you sure you want to submit your test?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit', style: 'default', onPress: submitTest }
              ]);
            }}>
              <Text style={styles.modalSubmitText}>Submit Test Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{color: 'white', marginTop: 15, fontSize: 18, fontWeight: 'bold'}}>Evaluating Test...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  headerBtn: { padding: 8 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
  timerText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
  submitBtnHeader: { backgroundColor: '#1A56DB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  submitBtnTextHeader: { color: 'white', fontWeight: 'bold' },
  progressBarBg: { height: 4, backgroundColor: '#E2E8F0', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#10B981' },
  
  qContainer: { flex: 1, padding: 20 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  qNumber: { color: '#64748B', fontWeight: 'bold' },
  qMarks: { backgroundColor: '#E0E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  qMarksText: { color: '#4338CA', fontSize: 12, fontWeight: 'bold' },
  qText: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 25, lineHeight: 28 },
  
  optionsContainer: { gap: 12, paddingBottom: 40 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  optionCardSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  radioCircleSelected: { borderColor: '#3B82F6' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  optLabel: { fontWeight: 'bold', marginRight: 8, color: '#475569' },
  optText: { flex: 1, fontSize: 16, color: '#334155' },
  optTextSelected: { color: '#1E3A8A', fontWeight: '500' },

  bottomControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderTopWidth: 1, borderColor: '#E2E8F0' },
  controlBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  controlBtnText: { color: '#64748B', fontWeight: '600', fontSize: 16 },
  navBtn: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8 },
  navBtnDisabled: { opacity: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#64748B' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 20 },
  gridBox: { width: '17%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  gridBoxCurrent: { borderWidth: 3, borderColor: '#1E293B' },
  gridText: { fontWeight: 'bold', fontSize: 16 },
  modalSubmitBtn: { backgroundColor: '#1A56DB', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalSubmitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  submittingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
});
