import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useRouter } from 'expo-router';
import apiClient from '../../api/client';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ points: 0, streak: 0, testsTakenToday: 0 });
  const [recommendedTests, setRecommendedTests] = useState<any[]>([]);
  const [dailySprint, setDailySprint] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // 1. Fetch User Stats
      const userRes = await apiClient.get(`users.php?action=getById&uid=${user.uid}`);
      if (userRes.data) {
        setStats({
          points: userRes.data.totalPoints || 0,
          streak: userRes.data.currentStreak || 0,
          testsTakenToday: userRes.data.testsTakenToday || 0
        });
      }

      // 2. Fetch Recommended Tests (Published Sets)
      const setsRes = await apiClient.get('model_sets.php?action=getPublished');
      if (setsRes.data && Array.isArray(setsRes.data)) {
        // Filter out daily live for recommended section
        const normalSets = setsRes.data.filter(s => !s.isDailyLive).slice(0, 5);
        setRecommendedTests(normalSets);
        
        // Find an active daily live sprint
        const sprint = setsRes.data.find(s => s.isDailyLive);
        if (sprint) setDailySprint(sprint);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await signOut(auth);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.logoText}>GyanBazi</Text>
        </View>
        <TouchableOpacity onPress={() => setShowProfileMenu(true)} style={styles.avatarBtn}>
          {user?.photoURL ? (
            <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center'}}>
               <Text style={{fontWeight: 'bold', color: '#1E293B'}}>{user.displayName?.[0] || 'U'}</Text>
            </View>
          ) : (
            <Ionicons name="person-circle" size={40} color="#1A56DB" />
          )}
        </TouchableOpacity>
      </View>

      {/* Profile/Logout Modal */}
      <Modal visible={showProfileMenu} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowProfileMenu(false)}>
          <View style={styles.dropdownMenu}>
            <Text style={styles.menuUserName}>{user?.displayName || 'Student'}</Text>
            <Text style={styles.menuEmail}>{user?.email}</Text>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowProfileMenu(false); router.push('/(tabs)/profile'); }}>
              <Ionicons name="person" size={20} color="#475569" />
              <Text style={styles.menuText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56DB']} />}
      >
        {/* Header greeting & Stats */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Namaste, {user?.displayName?.split(' ')[0] || 'Student'}! 👋</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>🔥 {stats.streak}-day Streak</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>⭐ {stats.points} Points</Text>
            </View>
          </View>
        </View>

        {/* Daily Sprint Highlight */}
        {dailySprint && (
          <View style={[styles.card, { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, { color: '#F8FAFC', marginBottom: 0 }]}>⚡ Daily Sprint Live</Text>
              <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>LIVE NOW</Text>
              </View>
            </View>
            <Text style={{ color: '#94A3B8', marginBottom: 16 }}>{dailySprint.title}</Text>
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 16 }}>
              <Text style={{ color: '#E2E8F0', fontSize: 13 }}>📝 {dailySprint.totalQuestions} MCQs</Text>
              <Text style={{ color: '#E2E8F0', fontSize: 13 }}>⏱ {dailySprint.timeLimitMinutes} min</Text>
              <Text style={{ color: '#E2E8F0', fontSize: 13 }}>🏆 {dailySprint.totalMarks} Marks</Text>
            </View>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: '#3B82F6' }]} onPress={() => {}}>
              <Text style={styles.startBtnText}>Participate Now →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Today's Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((stats.testsTakenToday / 10) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{stats.testsTakenToday}/10 Free Tests Available</Text>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessRow}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/tests')}>
            <Ionicons name="library" size={24} color="#1A56DB" />
            <Text style={styles.quickActionText}>Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/leaderboard')}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.quickActionText}>Rankings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person" size={24} color="#10B981" />
            <Text style={styles.quickActionText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Tests */}
        <Text style={styles.sectionTitle}>🎯 Recommended Practice Sets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {recommendedTests.length > 0 ? recommendedTests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <Text style={styles.testTitle} numberOfLines={2}>{test.title}</Text>
              <View style={{flexDirection: 'row', gap: 10, marginBottom: 15, flexWrap: 'wrap'}}>
                <Text style={styles.testMeta}>📝 {test.totalQuestions} Qs</Text>
                <Text style={styles.testMeta}>⏱ {test.timeLimitMinutes} min</Text>
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={() => {}}>
                <Text style={styles.startBtnText}>Attempt Now</Text>
              </TouchableOpacity>
            </View>
          )) : (
            <Text style={{marginHorizontal: 20, color: '#64748B'}}>No recommended tests available right now.</Text>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  logoText: { fontSize: 20, fontWeight: '900', color: '#1A56DB' },
  avatarBtn: { padding: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 20 },
  dropdownMenu: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, width: 200, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  menuUserName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  menuEmail: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  menuDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  menuText: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
  header: { padding: 20, backgroundColor: '#FFFFFF' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBadge: { backgroundColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statText: { fontWeight: '600', color: '#334155' },
  card: { backgroundColor: '#FFFFFF', margin: 20, padding: 20, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#1E293B' },
  progressBarBg: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#10B981' },
  progressText: { fontSize: 14, color: '#64748B', marginBottom: 5 },
  rankText: { fontSize: 14, fontWeight: 'bold', color: '#1A56DB' },
  quickAccessRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  quickAction: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', padding: 15, marginHorizontal: 5, borderRadius: 12, elevation: 1 },
  quickActionText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#475569' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10, color: '#1E293B' },
  horizontalScroll: { paddingHorizontal: 15, paddingBottom: 30 },
  testCard: { backgroundColor: '#FFFFFF', padding: 15, marginHorizontal: 5, borderRadius: 12, width: 250, elevation: 2 },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  testMeta: { fontSize: 14, color: '#64748B', marginBottom: 15 },
  startBtn: { backgroundColor: '#1A56DB', padding: 10, borderRadius: 8, alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontWeight: 'bold' }
});
