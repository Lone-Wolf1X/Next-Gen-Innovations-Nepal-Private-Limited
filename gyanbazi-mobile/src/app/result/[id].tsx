import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await apiClient.get(`results.php?action=getById&id=${id}`);
      if (res.data) {
        setResult(res.data);
      }
    } catch (e) {
      console.error('Error fetching result', e);
    } finally {
      setLoading(false);
    }
  };

  const openReview = (index: number) => {
    if (!result || !result.questionReview) return;
    const q = result.questionReview[index];
    setSelectedQuestion({ ...q, index });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A56DB" />
        <Text style={{marginTop: 10, color: '#64748B'}}>Analyzing your performance...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={{color: '#EF4444'}}>Result not found.</Text>
        <TouchableOpacity style={[styles.primaryBtn, {marginTop: 20}]} onPress={() => router.replace('/(tabs)')}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Performance Report</Text>
          {result.isPersonalBest && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏆 New Personal Best!</Text>
            </View>
          )}
        </View>

        {/* Big Score Ring */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercent}>{result.scorePercentage}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, {borderColor: '#10B981'}]}>
            <Text style={[styles.statNum, {color: '#10B981'}]}>{result.correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={[styles.statBox, {borderColor: '#EF4444'}]}>
            <Text style={[styles.statNum, {color: '#EF4444'}]}>{result.incorrectAnswers}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={[styles.statBox, {borderColor: '#CBD5E1'}]}>
            <Text style={[styles.statNum, {color: '#64748B'}]}>{result.unattemptedQuestions}</Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>
        </View>

        {/* Detailed Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Ionicons name="analytics" size={24} color="#3B82F6" />
            <View>
              <Text style={styles.metricTitle}>Final Score</Text>
              <Text style={styles.metricValue}>{result.finalScore?.toFixed(2) ?? 0} <Text style={{fontSize: 12, color: '#94A3B8'}}>out of {result.totalMarks}</Text></Text>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="trending-down" size={24} color="#EF4444" />
            <View>
              <Text style={styles.metricTitle}>Negative Marks</Text>
              <Text style={[styles.metricValue, {color: '#EF4444'}]}>- {result.negativeMarks?.toFixed(2) ?? 0}</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="speedometer" size={24} color="#10B981" />
            <View>
              <Text style={styles.metricTitle}>Accuracy</Text>
              <Text style={styles.metricValue}>{result.accuracy}%</Text>
            </View>
          </View>
        </View>

        {/* View Answers Grid */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Detailed Review</Text>
          <Text style={styles.sectionSubtitle}>Tap a number to view answer & explanation.</Text>
          
          <View style={styles.gridContainer}>
            {result.questionReview && result.questionReview.map((q: any, i: number) => {
              let bg = '#E2E8F0';
              let color = '#475569';
              if (q.status === 'correct') { bg = '#D1FAE5'; color = '#059669'; }
              else if (q.status === 'incorrect') { bg = '#FEE2E2'; color = '#DC2626'; }

              return (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.gridBox, {backgroundColor: bg}]}
                  onPress={() => openReview(i)}
                >
                  <Text style={[styles.gridText, {color}]}>{i + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Return to Dashboard</Text>
        </TouchableOpacity>
        <View style={{height: 40}} />
      </ScrollView>

      {/* Answer Review Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedQuestion && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <Text style={styles.modalTitle}>Question {selectedQuestion.index + 1}</Text>
                    {selectedQuestion.status === 'correct' && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                    {selectedQuestion.status === 'incorrect' && <Ionicons name="close-circle" size={24} color="#EF4444" />}
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#1E293B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.qText}>{selectedQuestion.questionText}</Text>
                
                <View style={styles.optionsList}>
                  {Object.keys(selectedQuestion.options || {}).map((optKey) => {
                    const isCorrect = optKey === selectedQuestion.correctOption;
                    const isUserAns = optKey === selectedQuestion.userAnswer;
                    
                    let cardStyle: any = styles.optCard;
                    let icon = null;

                    if (isCorrect) {
                      cardStyle = [styles.optCard, styles.optCardCorrect];
                      icon = <Ionicons name="checkmark" size={20} color="#059669" />;
                    } else if (isUserAns && !isCorrect) {
                      cardStyle = [styles.optCard, styles.optCardWrong];
                      icon = <Ionicons name="close" size={20} color="#DC2626" />;
                    }

                    return (
                      <View key={optKey} style={cardStyle}>
                        <Text style={styles.optKeyLabel}>{optKey.toUpperCase()}.</Text>
                        <Text style={styles.optContent}>{selectedQuestion.options[optKey]}</Text>
                        {icon}
                      </View>
                    );
                  })}
                </View>

                {selectedQuestion.explanation ? (
                  <View style={styles.explanationBox}>
                    <Text style={styles.expTitle}>Explanation:</Text>
                    <Text style={styles.expText}>{selectedQuestion.explanation}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  badgeText: { color: '#D97706', fontWeight: 'bold', fontSize: 12 },
  
  scoreSection: { padding: 30, alignItems: 'center', backgroundColor: '#FFFFFF' },
  scoreCircle: { width: 150, height: 150, borderRadius: 75, borderWidth: 8, borderColor: '#1A56DB', justifyContent: 'center', alignItems: 'center' },
  scorePercent: { fontSize: 40, fontWeight: '900', color: '#1E293B' },
  scoreLabel: { fontSize: 16, color: '#64748B', marginTop: -5 },
  
  statsRow: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  statBox: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 15, marginHorizontal: 5, backgroundColor: '#F8FAFC' },
  statNum: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#475569', fontWeight: '500' },

  metricsContainer: { padding: 20, gap: 12 },
  metricCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, gap: 15 },
  metricTitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },

  reviewSection: { padding: 20, backgroundColor: '#FFFFFF', marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridBox: { width: '17%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  gridText: { fontWeight: 'bold', fontSize: 16 },

  primaryBtn: { backgroundColor: '#1A56DB', padding: 16, borderRadius: 12, alignItems: 'center', margin: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  qText: { fontSize: 17, fontWeight: '600', color: '#334155', marginBottom: 20, lineHeight: 26 },
  optionsList: { gap: 10 },
  optCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  optCardCorrect: { backgroundColor: '#D1FAE5', borderColor: '#059669' },
  optCardWrong: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  optKeyLabel: { fontWeight: 'bold', marginRight: 10, color: '#475569' },
  optContent: { flex: 1, fontSize: 15, color: '#1E293B' },
  
  explanationBox: { marginTop: 25, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 10, borderLeftWidth: 4, borderColor: '#3B82F6' },
  expTitle: { fontWeight: 'bold', color: '#1E3A8A', marginBottom: 5 },
  expText: { color: '#334155', lineHeight: 22 }
});
