import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar as CalendarIcon, Clock, TrendingUp } from 'lucide-react-native';

export default function ProgressScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your recovery journey</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CalendarIcon color="#4F46E5" size={24} />
          <Text style={styles.cardTitle}>Milestone Calendar</Text>
        </View>
        {/* Calendar component will go here */}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock color="#4F46E5" size={24} />
          <Text style={styles.cardTitle}>Time Breakdown</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>168</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Week</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp color="#4F46E5" size={24} />
          <Text style={styles.cardTitle}>Weekly Overview</Text>
        </View>
        {/* Chart component will go here */}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    marginTop: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
});