import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function LeaderboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const res = await apiClient.get('users.php?action=getLeaderboard');
      if (res.data && Array.isArray(res.data)) {
        setLeaderboard(res.data);
      }
    } catch (e) {
      console.error('Error fetching leaderboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons name="trophy" size={28} color="#F59E0B" />
          <Text style={styles.headerTitle}>Daily Top Rankers</Text>
        </View>
        <Text style={styles.headerSubtitle}>Climb the ranks by playing tests daily!</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{padding: 20}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F59E0B']} />}
      >
        {leaderboard.length > 0 ? leaderboard.map((user, index) => {
          let rankColor = '#475569';
          if (index === 0) rankColor = '#F59E0B'; // Gold
          if (index === 1) rankColor = '#94A3B8'; // Silver
          if (index === 2) rankColor = '#B45309'; // Bronze

          return (
            <View key={index} style={[styles.rankCard, index < 3 && styles.topRankCard]}>
              <View style={styles.rankBadge}>
                <Text style={[styles.rankText, {color: rankColor}]}>#{index + 1}</Text>
              </View>

              <View style={styles.avatarCircle}>
                {user.photoUrl ? (
                  <Image source={{uri: user.photoUrl}} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || 'U'}</Text>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.userStreak}>🔥 {user.currentStreak} day streak</Text>
              </View>

              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{user.dailyPoints} pts</Text>
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyState}>
            <Ionicons name="medal-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No rankings available today yet. Be the first!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 25 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 8 },
  
  rankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  topRankCard: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, borderColor: '#F1F5F9' },
  
  rankBadge: { width: 40, alignItems: 'center' },
  rankText: { fontSize: 18, fontWeight: '900' },

  avatarCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginRight: 15 },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#4338CA' },

  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  userStreak: { fontSize: 13, color: '#64748B', marginTop: 2 },

  pointsBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pointsText: { color: '#D97706', fontWeight: 'bold', fontSize: 14 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94A3B8', marginTop: 15, fontSize: 15, textAlign: 'center', paddingHorizontal: 40 }
});
