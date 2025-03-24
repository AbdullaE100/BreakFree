import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Smile, Frown, Meh, ThermometerSun, BookOpen, TriangleAlert as AlertTriangle } from 'lucide-react-native';

const moods = [
  { id: 'great', icon: Smile, label: 'Great', color: '#10B981' },
  { id: 'okay', icon: Meh, label: 'Okay', color: '#F59E0B' },
  { id: 'difficult', icon: Frown, label: 'Difficult', color: '#EF4444' },
];

export default function CheckinScreen() {
  const [selectedMood, setSelectedMood] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Check-in</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>

      <View style={styles.moodContainer}>
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <Pressable
              key={mood.id}
              style={[
                styles.moodCard,
                isSelected && { borderColor: mood.color, borderWidth: 2 }
              ]}
              onPress={() => setSelectedMood(mood.id)}
            >
              <Icon size={32} color={mood.color} />
              <Text style={[styles.moodLabel, { color: mood.color }]}>
                {mood.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionsContainer}>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/checkin/mood')}
        >
          <ThermometerSun size={24} color="#4F46E5" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Track Cravings</Text>
            <Text style={styles.actionSubtitle}>Log your urge levels</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/checkin/journal')}
        >
          <BookOpen size={24} color="#4F46E5" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Journal Entry</Text>
            <Text style={styles.actionSubtitle}>Write about your day</Text>
          </View>
        </Pressable>

        <Pressable style={styles.actionCard}>
          <AlertTriangle size={24} color="#4F46E5" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Report Relapse</Text>
            <Text style={styles.actionSubtitle}>Log and learn from setbacks</Text>
          </View>
        </Pressable>
      </View>

      <Pressable
        style={[styles.submitButton, !selectedMood && styles.submitButtonDisabled]}
        disabled={!selectedMood}
      >
        <Text style={styles.submitButtonText}>Complete Check-in</Text>
      </Pressable>
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
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  actionsContainer: {
    padding: 20,
  },
  actionCard: {
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
  actionContent: {
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});