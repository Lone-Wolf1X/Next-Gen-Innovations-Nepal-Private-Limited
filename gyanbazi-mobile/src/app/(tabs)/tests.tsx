import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from '../../api/client';

export default function TestsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [modelSets, setModelSets] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fetchData = async () => {
    try {
      const [catRes, setRes] = await Promise.all([
        apiClient.get('categories.php?action=getAll'),
        apiClient.get('model_sets.php?action=getPublished')
      ]);
      
      if (catRes.data) setCategories(catRes.data);
      if (setRes.data) setModelSets(setRes.data.filter((s: any) => !s.isDailyLive));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredSets = activeCategory === 'all' 
    ? modelSets 
    : modelSets.filter(s => s.categoryId === activeCategory);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Mock Tests</Text>
        <Text style={styles.headerSubtitle}>Select a category to filter tests</Text>
      </View>

      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, activeCategory === 'all' && styles.filterChipActive]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.filterText, activeCategory === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.filterText, activeCategory === cat.id && styles.filterTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56DB']} />}
      >
        {filteredSets.length > 0 ? (
          filteredSets.map(test => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.testInfo}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{categories.find(c => c.id === test.categoryId)?.name || 'General'}</Text>
                </View>
                <Text style={styles.testTitle}>{test.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>📝 {test.totalQuestions} Questions</Text>
                  <Text style={styles.metaText}>⏱ {test.timeLimitMinutes} Mins</Text>
                  <Text style={styles.metaText}>🏆 {test.totalMarks} Marks</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={() => router.push(`/exam/${test.id}`)}>
                <Ionicons name="play" size={16} color="white" />
                <Text style={styles.startBtnText}>Start Test</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No mock tests found in this category.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  filterScrollWrapper: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  filterScroll: { paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  filterText: { color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  testCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  testInfo: { flex: 1, marginRight: 15 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E0E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#4338CA' },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: '#64748B' },
  startBtn: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  startBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyStateText: { marginTop: 10, color: '#94A3B8', fontSize: 14 }
});
