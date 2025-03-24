import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { X, Calendar, Heart, Brain, CheckCircle, AlertTriangle, Award, ArrowLeft, Edit2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { JournalEntry, getJournalEntry } from '../../lib/supabase';

type JournalEntryWithParsedContent = JournalEntry & {
  parsedContent: {
    text: string;
    additional?: {
      entry_type?: string;
      emotions?: string[];
      thoughts?: string[];
      behaviors?: string[];
      coping_strategies?: string[];
      gratitude_items?: string[];
      lessons_learned?: string;
      goals?: string[];
      physical_symptoms?: string[];
      recovery_wins?: string;
    };
  };
};

interface JournalEntryViewerProps {
  entryId?: string;
  userId: string;
  date: string;
  onClose: () => void;
  onEdit?: () => void;
}

export default function JournalEntryViewer({ 
  entryId, 
  userId, 
  date, 
  onClose,
  onEdit 
}: JournalEntryViewerProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntryWithParsedContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (userId && date) {
      loadJournalEntry();
    }
  }, [userId, date]);
  
  const loadJournalEntry = async () => {
    try {
      setLoading(true);
      const journalEntry = await getJournalEntry(userId, date);
      
      if (journalEntry) {
        // Parse the content field which contains JSON
        try {
          let parsedContent;
          try {
            parsedContent = JSON.parse(journalEntry.content);
          } catch (e) {
            // Handle old format where content is just text
            parsedContent = { text: journalEntry.content };
          }
          
          setEntry({
            ...journalEntry,
            parsedContent
          });
        } catch (e) {
          console.error('Error parsing entry content:', e);
          setEntry({
            ...journalEntry,
            parsedContent: { text: journalEntry.content || '' }
          });
        }
      }
    } catch (error) {
      console.error('Error loading journal entry:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getEntryTypeIcon = (type: string | undefined) => {
    switch(type) {
      case 'cbt': return <Brain size={24} color="#9333EA" />;
      case 'gratitude': return <Heart size={24} color="#F59E0B" />;
      case 'milestone': return <Award size={24} color="#10B981" />;
      case 'relapse_prevention': return <AlertTriangle size={24} color="#EF4444" />;
      default: return <CheckCircle size={24} color="#3B82F6" />;
    }
  };
  
  const getEntryTypeLabel = (type: string | undefined) => {
    switch(type) {
      case 'cbt': return 'CBT Journal';
      case 'gratitude': return 'Gratitude Journal';
      case 'milestone': return 'Milestone Reflection';
      case 'relapse_prevention': return 'Relapse Prevention Plan';
      default: return 'Daily Check-in';
    }
  };
  
  const getEntryTypeColor = (type: string | undefined) => {
    switch(type) {
      case 'cbt': return '#9333EA'; // Purple
      case 'gratitude': return '#F59E0B'; // Amber
      case 'milestone': return '#10B981'; // Green
      case 'relapse_prevention': return '#EF4444'; // Red
      default: return '#3B82F6'; // Blue
    }
  };
  
  const getMoodColor = (mood: number) => {
    const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'];
    return colors[Math.min(Math.max(0, mood - 1), 4)];
  };
  
  const getMoodLabel = (mood: number) => {
    return ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][mood - 1];
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D56F0" />
        <Text style={styles.loadingText}>Loading journal entry...</Text>
      </View>
    );
  }
  
  if (!entry) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No entry found for this date.</Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    );
  }
  
  const entryType = entry.entry_type || entry.parsedContent?.additional?.entry_type || 'daily';
  const entryContent = entry.parsedContent?.text || '';
  const emotions = entry.emotions || entry.parsedContent?.additional?.emotions || [];
  const thoughts = entry.thoughts || entry.parsedContent?.additional?.thoughts || [];
  const behaviors = entry.behaviors || entry.parsedContent?.additional?.behaviors || [];
  const copingStrategies = entry.coping_strategies || entry.parsedContent?.additional?.coping_strategies || [];
  const gratitudeItems = entry.parsedContent?.additional?.gratitude_items || [];
  const lessonsLearned = entry.parsedContent?.additional?.lessons_learned || '';
  const goals = entry.parsedContent?.additional?.goals || [];
  const physicalSymptoms = entry.physical_symptoms || entry.parsedContent?.additional?.physical_symptoms || [];
  const recoveryWins = entry.parsedContent?.additional?.recovery_wins || '';
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <ArrowLeft size={24} color="#4B5563" />
          </Pressable>
          
          <Pressable style={styles.editButton} onPress={onEdit}>
            <Edit2 size={20} color="#3D56F0" />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>
        
        <View style={styles.entryMeta}>
          <View style={styles.dateContainer}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
          </View>
          
          <View 
            style={[
              styles.entryTypeTag,
              { backgroundColor: `${getEntryTypeColor(entryType)}20` }
            ]}
          >
            {getEntryTypeIcon(entryType)}
            <Text 
              style={[
                styles.entryTypeText,
                { color: getEntryTypeColor(entryType) }
              ]}
            >
              {getEntryTypeLabel(entryType)}
            </Text>
          </View>
        </View>
        
        <View style={styles.moodContainer}>
          <Text style={styles.moodLabel}>Mood</Text>
          <View style={styles.moodIndicator}>
            <LinearGradient
              colors={['#F9FAFB', getMoodColor(entry.mood)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.moodGradient}
            >
              <View 
                style={[
                  styles.moodDot, 
                  { 
                    backgroundColor: getMoodColor(entry.mood),
                    left: `${((entry.mood - 1) / 4) * 100}%` 
                  }
                ]} 
              />
            </LinearGradient>
            <Text style={styles.moodText}>{getMoodLabel(entry.mood)}</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Journal Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal Entry</Text>
          <View style={styles.textContainer}>
            <Text style={styles.entryText}>{entryContent}</Text>
          </View>
        </View>
        
        {/* Emotions */}
        {emotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotions</Text>
            <View style={styles.tagsContainer}>
              {emotions.map((emotion, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Triggers */}
        {entry.triggers && entry.triggers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Triggers</Text>
            <View style={styles.tagsContainer}>
              {entry.triggers.map((trigger, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Thoughts */}
        {thoughts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thoughts</Text>
            <View style={styles.tagsContainer}>
              {thoughts.map((thought, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{thought}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Behaviors */}
        {behaviors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Behaviors</Text>
            <View style={styles.tagsContainer}>
              {behaviors.map((behavior, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{behavior}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Physical Symptoms / Warning Signs */}
        {physicalSymptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {entryType === 'relapse_prevention' ? 'Warning Signs' : 'Physical Symptoms'}
            </Text>
            <View style={styles.tagsContainer}>
              {physicalSymptoms.map((symptom, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{symptom}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Coping Strategies */}
        {copingStrategies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coping Strategies</Text>
            <View style={styles.tagsContainer}>
              {copingStrategies.map((strategy, index) => (
                <View key={index} style={[styles.tag, styles.strategyTag]}>
                  <Text style={[styles.tagText, styles.strategyText]}>{strategy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Gratitude Items */}
        {gratitudeItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gratitude List</Text>
            {gratitudeItems.map((item, index) => (
              <View key={index} style={styles.gratitudeItem}>
                <Text style={styles.gratitudeNumber}>{index + 1}.</Text>
                <Text style={styles.gratitudeText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Lessons Learned */}
        {lessonsLearned && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lessons Learned</Text>
            <View style={styles.textContainer}>
              <Text style={styles.entryText}>{lessonsLearned}</Text>
            </View>
          </View>
        )}
        
        {/* Recovery Wins */}
        {recoveryWins && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recovery Wins</Text>
            <View style={styles.textContainer}>
              <Text style={styles.entryText}>{recoveryWins}</Text>
            </View>
          </View>
        )}
        
        {/* Goals */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {entryType === 'relapse_prevention' ? 'Emergency Contacts' : 'Goals'}
            </Text>
            {goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Text style={styles.goalNumber}>{index + 1}.</Text>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginLeft: 6,
  },
  entryMeta: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginLeft: 6,
  },
  entryTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  entryTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  moodContainer: {
    marginTop: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  moodIndicator: {
    alignItems: 'center',
  },
  moodGradient: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  moodDot: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  moodText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  textContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  strategyTag: {
    backgroundColor: '#EBF5FF',
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  strategyText: {
    color: '#3D56F0',
  },
  gratitudeItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gratitudeNumber: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#3D56F0',
    marginRight: 8,
    width: 20,
  },
  gratitudeText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  goalItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalNumber: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#3D56F0',
    marginRight: 8,
    width: 20,
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
}); 