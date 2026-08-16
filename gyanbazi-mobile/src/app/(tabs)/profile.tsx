import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useRouter } from 'expo-router';
import apiClient from '../../api/client';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [userData, setUserData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const [uRes, aRes] = await Promise.all([
        apiClient.get(`users.php?action=getById&uid=${user.uid}`),
        apiClient.get(`users.php?action=getAnalytics&uid=${user.uid}`)
      ]);
      if (uRes.data) setUserData(uRes.data);
      if (aRes.data) setAnalytics(aRes.data);
    } catch (e) {
      console.error('Error fetching profile', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await signOut(auth);
        router.replace('/(auth)/login');
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="settings-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56DB']} />}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userData?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.name || 'Student'}</Text>
            <Text style={styles.userEmail}>{userData?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userData?.subscriptionTier?.toUpperCase() || 'FREE'}</Text>
            </View>
          </View>
        </View>

        {/* Global Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userData?.totalTestsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userData?.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{analytics?.averageScore || 0}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Subjects Analytics */}
        {analytics?.strongSubjects && analytics.strongSubjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Strong Subjects</Text>
            {analytics.strongSubjects.map((sub: any, i: number) => (
              <View key={i} style={styles.subjectRow}>
                <Text style={styles.subjectName} numberOfLines={1}>{sub.subjectName}</Text>
                <View style={[styles.accBadge, {backgroundColor: '#D1FAE5'}]}>
                  <Text style={[styles.accText, {color: '#059669'}]}>{sub.accuracy}% Acc</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {analytics?.weakSubjects && analytics.weakSubjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Needs Improvement</Text>
            {analytics.weakSubjects.map((sub: any, i: number) => (
              <View key={i} style={styles.subjectRow}>
                <Text style={styles.subjectName} numberOfLines={1}>{sub.subjectName}</Text>
                <View style={[styles.accBadge, {backgroundColor: '#FEE2E2'}]}>
                  <Text style={[styles.accText, {color: '#DC2626'}]}>{sub.accuracy}% Acc</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Settings & Logout */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#475569" />
            <Text style={styles.menuText}>Push Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-buoy-outline" size={24} color="#475569" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={[styles.menuText, {color: '#EF4444'}]}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  
  userCard: { flexDirection: 'row', padding: 20, backgroundColor: '#FFFFFF', alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#4338CA' },
  userInfo: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },

  statsGrid: { flexDirection: 'row', padding: 15, gap: 10 },
  statBox: { flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1A56DB' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },

  section: { backgroundColor: '#FFFFFF', marginTop: 15, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  subjectName: { flex: 1, fontSize: 15, color: '#475569' },
  accBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  accText: { fontSize: 12, fontWeight: 'bold' },

  settingsSection: { marginTop: 20, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuText: { fontSize: 16, color: '#1E293B' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold' }
});
