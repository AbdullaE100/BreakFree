import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Trophy, Star, DollarSign, Calendar } from 'lucide-react-native';

const achievements = [
  {
    id: '1',
    title: '7 Days Milestone',
    description: 'One week of sobriety completed',
    icon: Trophy,
    color: '#10B981',
    unlocked: true,
  },
  {
    id: '2',
    title: 'Money Saver',
    description: 'Saved $100 in recovery',
    icon: DollarSign,
    color: '#F59E0B',
    unlocked: true,
  },
  {
    id: '3',
    title: '30 Days Challenge',
    description: 'Complete one month sober',
    icon: Calendar,
    color: '#6366F1',
    unlocked: false,
    progress: 23,
  },
];

export default function MilestonesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Milestones</Text>
        <Text style={styles.subtitle}>Your recovery achievements</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Star size={24} color="#F59E0B" />
            <Text style={styles.statValue}>240</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          <View style={styles.stat}>
            <Trophy size={24} color="#10B981" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Badges Unlocked</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {achievements.map(achievement => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementLocked
            ]}
          >
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
              <achievement.icon size={24} color={achievement.color} />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              {achievement.progress !== undefined && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(achievement.progress / 30) * 100}%` }
                    ]}
                  />
                </View>
              )}
            </View>
            {achievement.unlocked && (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?q=80&w=100&auto=format&fit=crop' }}
                style={styles.achievementBadge}
              />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  achievementBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
});