import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { useStore } from '@/store';
import { Heart, TrendingUp, DollarSign } from 'lucide-react-native';

const MOTIVATION_QUOTES = [
  "Every day is a new beginning.",
  "Progress, not perfection.",
  "You are stronger than you know.",
  "One day at a time.",
];

export default function HomeScreen() {
  const { addiction, goals } = useStore();
  const [soberDays, setSoberDays] = useState(0);
  const [quote, setQuote] = useState(MOTIVATION_QUOTES[0]);

  useEffect(() => {
    // In a real app, calculate this from the start date
    setSoberDays(7);
  }, []);

  const moneySaved = soberDays * (goals?.savings || 0) / 30;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=1000&auto=format&fit=crop' }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.days}>{soberDays}</Text>
          <Text style={styles.daysLabel}>DAYS SOBER</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.quoteCard}>
          <Text style={styles.quote}>{quote}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Heart color="#4F46E5" size={24} />
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Health</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp color="#4F46E5" size={24} />
            <Text style={styles.statValue}>7 Days</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign color="#4F46E5" size={24} />
            <Text style={styles.statValue}>${moneySaved.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        <Pressable style={styles.checkInButton}>
          <Text style={styles.checkInText}>Daily Check-in</Text>
        </Pressable>
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
    height: 300,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  days: {
    fontSize: 72,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  daysLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 8,
  },
  content: {
    padding: 20,
    marginTop: -40,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quote: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
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
  checkInButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkInText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});