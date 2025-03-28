import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Star, Plus, ArrowLeft, PenSquare, Brain, Heart, RefreshCw, Award, CheckCircle, AlertTriangle, Lightbulb, Zap, List } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { JournalEntry as DBJournalEntry, getJournalEntry, createOrUpdateJournalEntry } from '../../lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import JournalEntryList from '../components/JournalEntryList';

// Journal entry types
type JournalEntryType = 'daily' | 'cbt' | 'gratitude' | 'milestone' | 'relapse_prevention' | 'custom';

// Define types for UI Journal entries
interface JournalEntryUI {
  mood: number;
  hasEntry: boolean;
  hadUrge?: boolean;
  entryType?: JournalEntryType;
}

// Define type for UI Journal entries collection
type JournalEntriesUI = {
  [key: string]: JournalEntryUI;
};

export default function JournalScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Current date and view state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState<'calendar' | 'entry' | 'list' | 'detail'>('calendar');
  const [entryType, setEntryType] = useState<JournalEntryType>('daily');
  
  // Journal entry state
  const [moodRating, setMoodRating] = useState<number>(3);
  const [journalText, setJournalText] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Enhanced journal fields
  const [emotions, setEmotions] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<string[]>([]);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [goals, setGoals] = useState<string[]>(['']);
  const [physicalSymptoms, setPhysicalSymptoms] = useState<string[]>([]);
  const [recoveryWins, setRecoveryWins] = useState('');
  
  // Journal entries state
  const [journalEntries, setJournalEntries] = useState<JournalEntriesUI>({});
  
  // Check for date parameter from entry list
  useEffect(() => {
    if (params.date) {
      const dateParam = params.date as string;
      const dateObj = new Date(dateParam);
      setSelectedDate(dateObj);
      setCurrentMonth(dateObj.getMonth());
      setCurrentYear(dateObj.getFullYear());
      loadEntry(dateParam);
      setViewType('entry');
    }
  }, [params.date]);
  
  // Common emotions for addiction recovery
  const commonEmotions = [
    'Anxiety', 'Anger', 'Boredom', 'Craving', 'Depression', 
    'Fear', 'Guilt', 'Hope', 'Isolation', 'Joy', 
    'Loneliness', 'Pride', 'Shame', 'Stress', 'Relief'
  ];
  
  // Common triggers for addiction recovery
  const triggers = [
    'Boredom', 'Stress', 'Social Situations', 'Anxiety', 
    'Depression', 'Fatigue', 'Celebrations', 'Conflict',
    'Financial Stress', 'Relationship Issues', 'Work Pressure',
    'Negative Self-Talk', 'Physical Pain', 'Isolation'
  ];
  
  // Common thoughts during recovery
  const commonThoughts = [
    'I need it to cope', 'One time won\'t hurt', 'I deserve a reward',
    'I can\'t handle this feeling', 'Everyone else is doing it', 
    'I\'ll never be able to quit', 'What\'s the point of trying',
    'I\'ve failed before, I\'ll fail again', 'I can control it this time'
  ];
  
  // Common coping strategies
  const copingOptions = [
    'Deep breathing', 'Physical exercise', 'Calling a support person',
    'Mindfulness meditation', 'Urge surfing', 'Distraction techniques',
    'Playing the tape forward', 'HALT check (Hungry/Angry/Lonely/Tired)',
    'Grounding techniques', 'Positive self-talk', 'Attending a meeting'
  ];
  
  // Entry type options with descriptions
  const entryTypeOptions = [
    { 
      type: 'daily' as JournalEntryType, 
      name: 'Daily Check-in',
      icon: CheckCircle,
      description: 'Track your daily mood, triggers, and reflections' 
    },
    { 
      type: 'cbt' as JournalEntryType, 
      name: 'CBT Journal',
      icon: Brain,
      description: 'Identify and challenge unhelpful thoughts' 
    },
    { 
      type: 'gratitude' as JournalEntryType, 
      name: 'Gratitude',
      icon: Heart,
      description: 'Focus on positives to build resilience' 
    },
    { 
      type: 'relapse_prevention' as JournalEntryType, 
      name: 'Prevention Plan',
      icon: AlertTriangle,
      description: 'Create a plan for high-risk situations' 
    },
    { 
      type: 'milestone' as JournalEntryType, 
      name: 'Milestone',
      icon: Award,
      description: 'Celebrate and reflect on your progress' 
    },
  ];
  
  // Mock journal entries - in a real app this would come from a database
  const mockJournalEntries: JournalEntriesUI = {
    '2023-12-01': { mood: 2, hasEntry: true, hadUrge: true },
    '2023-12-03': { mood: 3, hasEntry: true },
    '2023-12-07': { mood: 4, hasEntry: true },
    '2023-12-12': { mood: 5, hasEntry: true },
    '2023-12-15': { mood: 2, hasEntry: true, hadUrge: true },
    '2023-12-18': { mood: 3, hasEntry: true },
  };
  
  // Helper functions for calendar
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Add empty spaces for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const journalEntry = journalEntries[dateString];
      const isToday = day === new Date().getDate() && 
                      currentMonth === new Date().getMonth() && 
                      currentYear === new Date().getFullYear();
      
      days.push(
        <Pressable
          key={day}
          style={styles.calendarDay}
          onPress={() => handleDayPress({day, dateString})}
        >
          <View style={[
            styles.calendarDayInner,
            isToday && styles.todayCircle,
            journalEntry && { backgroundColor: getMoodColor(journalEntry.mood, 0.2) }
          ]}>
            <Text style={[
              styles.calendarDayText,
              isToday && styles.todayText
            ]}>{day}</Text>
            {journalEntry && journalEntry.hasEntry && (
              <View style={[
                styles.moodDot, 
                { backgroundColor: getMoodColor(journalEntry.mood) }
              ]}/>
            )}
            {journalEntry && journalEntry.entryType && journalEntry.entryType !== 'daily' && (
              <View style={[
                styles.entryTypeDot,
                { backgroundColor: getEntryTypeColor(journalEntry.entryType) }
              ]} />
            )}
          </View>
        </Pressable>
      );
    }
    
    return days;
  };
  
  const changeMonth = (increment: number) => {
    const newDate = new Date(currentYear, currentMonth + increment, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };
  
  const handleDayPress = async (day: {day: number, dateString: string}) => {
    const fullDate = new Date(currentYear, currentMonth, day.day);
    setSelectedDate(fullDate);
    
    // Check if there's an entry for this date
    const journalEntry = journalEntries[day.dateString];
    
    if (journalEntry && journalEntry.hasEntry) {
      // Load entry data for viewing
      await loadEntry(day.dateString);
      setViewType('detail');
    } else {
      // Reset form for new entry
      resetForm();
      setViewType('entry');
    }
  };
  
  // Toggle selection functions
  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };
  
  const toggleEmotion = (emotion: string) => {
    if (emotions.includes(emotion)) {
      setEmotions(emotions.filter(e => e !== emotion));
    } else {
      setEmotions([...emotions, emotion]);
    }
  };
  
  const toggleThought = (thought: string) => {
    if (thoughts.includes(thought)) {
      setThoughts(thoughts.filter(t => t !== thought));
    } else {
      setThoughts([...thoughts, thought]);
    }
  };
  
  const toggleCopingStrategy = (strategy: string) => {
    if (copingStrategies.includes(strategy)) {
      setCopingStrategies(copingStrategies.filter(s => s !== strategy));
    } else {
      setCopingStrategies([...copingStrategies, strategy]);
    }
  };
  
  const togglePhysicalSymptom = (symptom: string) => {
    if (physicalSymptoms.includes(symptom)) {
      setPhysicalSymptoms(physicalSymptoms.filter(s => s !== symptom));
    } else {
      setPhysicalSymptoms([...physicalSymptoms, symptom]);
    }
  };
  
  // Update multi-input fields
  const updateGratitudeItem = (index: number, value: string) => {
    const updatedItems = [...gratitudeItems];
    updatedItems[index] = value;
    setGratitudeItems(updatedItems);
  };
  
  const updateGoal = (index: number, value: string) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = value;
    setGoals(updatedGoals);
  };
  
  const addGoal = () => {
    setGoals([...goals, '']);
  };
  
  // Entry type colors
  const getEntryTypeColor = (type: JournalEntryType) => {
    switch (type) {
      case 'cbt': return '#9333EA'; // Purple
      case 'gratitude': return '#F59E0B'; // Amber
      case 'milestone': return '#10B981'; // Green
      case 'relapse_prevention': return '#EF4444'; // Red
      case 'custom': return '#3B82F6'; // Blue
      default: return '#6B7280'; // Gray
    }
  };
  
  // Calendar view
  const renderCalendarView = () => (
    <>
      <View style={styles.viewToggle}>
        <Pressable 
          style={[styles.viewToggleButton, styles.viewToggleButtonActive]} 
          onPress={() => setViewType('calendar')}
        >
          <Calendar size={18} color="#3D56F0" />
          <Text style={[styles.viewToggleText, styles.viewToggleTextActive]}>Calendar</Text>
        </Pressable>
        
        <Pressable 
          style={styles.viewToggleButton} 
          onPress={() => setViewType('list')}
        >
          <List size={18} color="#6B7280" />
          <Text style={styles.viewToggleText}>List View</Text>
        </Pressable>
      </View>
    
      <View style={styles.monthSelector}>
        <Pressable style={styles.monthButton} onPress={() => changeMonth(-1)}>
          <ChevronLeft size={24} color="#4B5563" />
        </Pressable>
        
        <Text style={styles.monthYearText}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        
        <Pressable style={styles.monthButton} onPress={() => changeMonth(1)}>
          <ChevronRight size={24} color="#4B5563" />
        </Pressable>
      </View>
      
      <View style={styles.calendarHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.calendarHeaderText}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {generateCalendarDays()}
      </View>
      
      <Pressable 
        style={styles.createEntryButton}
        onPress={() => {
          setSelectedDate(new Date());
          resetForm();
          setViewType('entry');
        }}
      >
        <LinearGradient
          colors={['#3D56F0', '#5E72EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <PenSquare size={20} color="#FFFFFF" />
          <Text style={styles.createEntryButtonText}>New Entry</Text>
        </LinearGradient>
      </Pressable>
      
      <View style={styles.moodLegend}>
        <Text style={styles.moodLegendTitle}>Mood Legend</Text>
        <View style={styles.moodLegendContainer}>
          {[1, 2, 3, 4, 5].map(mood => (
            <View key={mood} style={styles.moodLegendItem}>
              <View 
                style={[
                  styles.moodLegendDot, 
                  { backgroundColor: getMoodColor(mood) }
                ]} 
              />
              <Text style={styles.moodLegendText}>
                {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][mood - 1]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
  
  // Generate insights from journal entries
  const renderJournalInsights = () => {
    // Count entries this month
    const entriesThisMonth = Object.values(journalEntries).filter(entry => entry.hasEntry).length;
    
    // Find most common mood
    const moodCounts: Record<number, number> = {};
    Object.values(journalEntries).forEach(entry => {
      if (entry.hasEntry && entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });
    
    let mostCommonMood = 3;
    let highestCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostCommonMood = Number(mood);
      }
    });
    
    // Calculate average mood
    let totalMood = 0;
    let moodEntryCount = 0;
    
    Object.values(journalEntries).forEach(entry => {
      if (entry.hasEntry && entry.mood) {
        totalMood += entry.mood;
        moodEntryCount++;
      }
    });
    
    const averageMood = moodEntryCount > 0 ? (totalMood / moodEntryCount).toFixed(1) : '0.0';
    
    // Count urges recorded
    const urgesRecorded = Object.values(journalEntries).filter(entry => entry.hadUrge).length;
    
    return (
      <>
        <Text style={styles.insightsStat}>
          <Text style={styles.insightsHighlight}>{entriesThisMonth}</Text> entries this month
        </Text>
        
        {entriesThisMonth > 0 && (
          <>
            <Text style={styles.insightsStat}>
              Average mood: <Text style={styles.insightsHighlight}>{averageMood}</Text>
              <Text style={styles.insightsMoodScale}> (on scale of 1-5)</Text>
            </Text>
            
            <Text style={styles.insightsStat}>
              Most common mood: <Text style={styles.insightsHighlight}>{getMoodLabel(mostCommonMood)}</Text>
            </Text>
            
            <Text style={styles.insightsStat}>
              <Text style={styles.insightsHighlight}>{urgesRecorded}</Text> urges recorded
            </Text>
            
            <View style={styles.moodScaleExplanation}>
              <Text style={styles.moodScaleTitle}>Mood Scale Explained:</Text>
              <Text style={styles.moodScaleItem}>1 - Very Low</Text>
              <Text style={styles.moodScaleItem}>2 - Low</Text>
              <Text style={styles.moodScaleItem}>3 - Neutral</Text>
              <Text style={styles.moodScaleItem}>4 - Good</Text>
              <Text style={styles.moodScaleItem}>5 - Excellent</Text>
            </View>
            
            <View style={styles.insightsTip}>
              <Lightbulb size={14} color="#3D56F0" />
              <Text style={styles.insightsTipText}>
                Regular journaling helps identify patterns and increases self-awareness
              </Text>
            </View>
          </>
        )}
      </>
    );
  };
  
  // Journal entry view
  const renderEntryView = () => (
    <>
      <View style={styles.entryHeader}>
        <Pressable style={styles.backButton} onPress={() => setViewType('calendar')}>
          <ArrowLeft size={20} color="#4B5563" />
        </Pressable>
        
        <Text style={styles.entryDate}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      
      <View style={styles.templateSelector}>
        <Text style={styles.templateTitle}>Journal Type:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateOptions}
        >
          {entryTypeOptions.map(option => {
            const Icon = option.icon;
            const isSelected = entryType === option.type;
            
            return (
              <Pressable
                key={option.type}
                style={[
                  styles.templateOption,
                  isSelected && styles.selectedTemplateOption
                ]}
                onPress={() => setEntryType(option.type)}
              >
                <Icon 
                  size={20} 
                  color={isSelected ? '#FFFFFF' : '#4B5563'} 
                />
                <Text style={[
                  styles.templateName,
                  isSelected && styles.selectedTemplateName
                ]}>
                  {option.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={styles.templateDescription}>
          {entryTypeOptions.find(o => o.type === entryType)?.description}
        </Text>
      </View>
      
      <View style={styles.entryCard}>
        {/* Mood entry for all templates */}
        <Text style={styles.entryPrompt}>How are you feeling today?</Text>
        
        <View style={styles.moodSelector}>
          {[1, 2, 3, 4, 5].map(rating => (
            <Pressable 
              key={rating} 
              style={[
                styles.moodButton,
                moodRating === rating && getMoodStyle(rating)
              ]}
              onPress={() => setMoodRating(rating)}
            >
              <Text style={[
                styles.moodEmoji,
                moodRating === rating && styles.selectedMoodEmoji
              ]}>
                {getMoodEmoji(rating)}
              </Text>
              
              <Text style={[
                styles.moodLabel,
                moodRating === rating && styles.selectedMoodLabel
              ]}>
                {getMoodLabel(rating)}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {/* Render template-specific content */}
        {renderTemplateContent()}
        
        <Pressable 
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={saveEntry}
          disabled={isSaving}
        >
          <LinearGradient
            colors={['#3D56F0', '#5B73FF']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Entry</Text>
          )}
        </Pressable>
      </View>
    </>
  );
  
  // Render the template-specific content
  const renderTemplateContent = () => {
    switch (entryType) {
      case 'cbt':
        return renderCbtTemplate();
      case 'gratitude':
        return renderGratitudeTemplate();
      case 'milestone':
        return renderMilestoneTemplate();
      case 'relapse_prevention':
        return renderPreventionTemplate();
      default:
        return renderDailyTemplate();
    }
  };
  
  // Daily check-in template
  const renderDailyTemplate = () => (
    <>
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <PenSquare size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Journal Entry</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="How was your day? What challenges did you face? What went well?"
          value={journalText}
          onChangeText={setJournalText}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Star size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Did you experience any triggers?</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {triggers.map((trigger, index) => (
            <Pressable
              key={index}
              style={[
                styles.tagButton,
                selectedTriggers.includes(trigger) && styles.selectedTagButton
              ]}
              onPress={() => toggleTrigger(trigger)}
            >
              <Text 
                style={[
                  styles.tagText,
                  selectedTriggers.includes(trigger) && styles.selectedTagText
                ]}
              >
                {trigger}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Zap size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>What emotions did you feel today?</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {commonEmotions.map((emotion, index) => (
            <Pressable
              key={index}
              style={[
                styles.tagButton,
                emotions.includes(emotion) && styles.selectedTagButton
              ]}
              onPress={() => toggleEmotion(emotion)}
            >
              <Text 
                style={[
                  styles.tagText,
                  emotions.includes(emotion) && styles.selectedTagText
                ]}
              >
                {emotion}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Award size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Recovery Win (Optional)</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="What's one positive step you took today, no matter how small?"
          value={recoveryWins}
          onChangeText={setRecoveryWins}
          textAlignVertical="top"
        />
      </View>
    </>
  );
  
  // CBT template
  const renderCbtTemplate = () => (
    <>
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Star size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Situation</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="Describe a challenging situation where you had urges or difficult thoughts"
          value={journalText}
          onChangeText={setJournalText}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Brain size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Unhelpful Thoughts</Text>
          <Text style={styles.entrySectionSubtitle}>(Select any that apply)</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {commonThoughts.map((thought, index) => (
            <Pressable
              key={index}
              style={[
                styles.tagButton,
                thoughts.includes(thought) && styles.selectedTagButton
              ]}
              onPress={() => toggleThought(thought)}
            >
              <Text 
                style={[
                  styles.tagText,
                  thoughts.includes(thought) && styles.selectedTagText
                ]}
              >
                {thought}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <RefreshCw size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Alternative Thoughts</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="What's a more balanced or helpful way to think about this situation?"
          value={lessonsLearned}
          onChangeText={setLessonsLearned}
          textAlignVertical="top"
        />
      </View>
    </>
  );
  
  // Gratitude template
  const renderGratitudeTemplate = () => (
    <>
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Heart size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Three Things I'm Grateful For Today</Text>
        </View>
        
        {gratitudeItems.map((item, index) => (
          <TextInput
            key={index}
            style={[styles.gratitudeInput, index < 2 && styles.gratitudeInputMargin]}
            placeholder={`I am grateful for... (#${index + 1})`}
            value={item}
            onChangeText={(text) => updateGratitudeItem(index, text)}
          />
        ))}
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Award size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>One Positive Action I Took Today</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="What's something positive you did today, no matter how small?"
          value={recoveryWins}
          onChangeText={setRecoveryWins}
          textAlignVertical="top"
        />
      </View>
    </>
  );
  
  // Milestone template
  const renderMilestoneTemplate = () => (
    <>
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Award size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Milestone Achievement</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="What milestone have you reached? (e.g., 7 days, 30 days, 6 months)"
          value={journalText}
          onChangeText={setJournalText}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <RefreshCw size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>How Have You Changed?</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="What positive changes have you noticed in yourself since you started recovery?"
          value={lessonsLearned}
          onChangeText={setLessonsLearned}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Lightbulb size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Looking Forward</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="What are you looking forward to as you continue your recovery journey?"
          value={recoveryWins}
          onChangeText={setRecoveryWins}
          textAlignVertical="top"
        />
      </View>
    </>
  );
  
  // Relapse prevention template
  const renderPreventionTemplate = () => (
    <>
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <AlertTriangle size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>High-Risk Situations</Text>
        </View>
        
        <TextInput
          style={styles.journalTextInput}
          multiline
          placeholder="Describe situations where you feel most vulnerable to relapse"
          value={journalText}
          onChangeText={setJournalText}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Star size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Early Warning Signs</Text>
          <Text style={styles.entrySectionSubtitle}>(Select any that apply)</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {['Isolation', 'Poor Sleep', 'Skipping Meetings', 'Romanticizing Use', 
            'Increased Stress', 'Overconfidence', 'Negative Thinking', 'Neglecting Self-Care',
            'Irritability', 'Lying', 'Skipping Medication'].map((symptom, index) => (
            <Pressable
              key={index}
              style={[
                styles.tagButton,
                physicalSymptoms.includes(symptom) && styles.selectedTagButton
              ]}
              onPress={() => togglePhysicalSymptom(symptom)}
            >
              <Text 
                style={[
                  styles.tagText,
                  physicalSymptoms.includes(symptom) && styles.selectedTagText
                ]}
              >
                {symptom}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <CheckCircle size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Coping Strategies</Text>
          <Text style={styles.entrySectionSubtitle}>(Select what works for you)</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {copingOptions.map((strategy, index) => (
            <Pressable
              key={index}
              style={[
                styles.tagButton,
                copingStrategies.includes(strategy) && styles.selectedTagButton
              ]}
              onPress={() => toggleCopingStrategy(strategy)}
            >
              <Text 
                style={[
                  styles.tagText,
                  copingStrategies.includes(strategy) && styles.selectedTagText
                ]}
              >
                {strategy}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.entrySection}>
        <View style={styles.entrySectionHeader}>
          <Zap size={16} color="#4B5563" />
          <Text style={styles.entrySectionTitle}>Emergency Contacts</Text>
        </View>
        
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalContainer}>
            <TextInput
              style={styles.goalInput}
              placeholder={`Name/Number to call when struggling`}
              value={goal}
              onChangeText={(text) => updateGoal(index, text)}
            />
            {index === goals.length - 1 && (
              <Pressable style={styles.addGoalButton} onPress={addGoal}>
                <Plus size={16} color="#3D56F0" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </>
  );
  
  // Load journal entries when user is authenticated
  useEffect(() => {
    if (user) {
      loadEntriesForMonth(currentYear, currentMonth);
    }
  }, [user, currentMonth, currentYear]);
  
  // Load journal entries for the selected month
  const loadEntriesForMonth = async (year: number, month: number) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Format date for first day of month
      const startDate = new Date(year, month, 1);
      // Format date for last day of month
      const endDate = new Date(year, month + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // In a real app, you would fetch entries for the entire month
      // For now, we'll create a mock implementation
      const monthEntries: JournalEntriesUI = {};
      
      // Fetch each day's data and add to monthEntries
      for (let day = 1; day <= endDate.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        try {
          const entry = await getJournalEntry(user.id, dateStr);
          
          if (entry) {
            monthEntries[dateStr] = {
              mood: entry.mood,
              hasEntry: true,
              hadUrge: entry.had_urge,
              entryType: entry.entry_type
            };
          }
        } catch (error) {
          console.error(`Error fetching entry for ${dateStr}:`, error);
        }
      }
      
      setJournalEntries(monthEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load a specific journal entry
  const loadEntry = async (dateString: string) => {
    if (!user) return;
    
    try {
      const entry = await getJournalEntry(user.id, dateString);
      
      if (entry) {
        // Set the basic state variables from the entry
        setMoodRating(entry.mood);
        setSelectedTriggers(entry.triggers || []);
        
        // Try to parse the content field to get the additional data
        try {
          const parsedContent = JSON.parse(entry.content || '{}');
          
          // If the content is in the new format with additional data
          if (parsedContent.additional) {
            // Set the journal text from the parsed content
            setJournalText(parsedContent.text || '');
            
            // Set all the additional state variables from the parsed content
            const additional = parsedContent.additional;
            setEntryType(additional.entry_type || 'daily');
            setEmotions(additional.emotions || []);
            setThoughts(additional.thoughts || []);
            setBehaviors(additional.behaviors || []);
            setCopingStrategies(additional.coping_strategies || []);
            setGratitudeItems(additional.gratitude_items?.length ? additional.gratitude_items : ['', '', '']);
            setLessonsLearned(additional.lessons_learned || '');
            setGoals(additional.goals?.length ? additional.goals : ['']);
            setPhysicalSymptoms(additional.physical_symptoms || []);
            setRecoveryWins(additional.recovery_wins || '');
          } else {
            // If the content is in the old format, just set it as the journal text
            setJournalText(entry.content || '');
            setEntryType('daily');
            resetAdditionalFields();
          }
        } catch (parseError) {
          // If there's an error parsing the JSON, assume it's just plain text
          console.error('Error parsing journal content:', parseError);
          setJournalText(entry.content || '');
          setEntryType('daily');
          resetAdditionalFields();
        }
      } else {
        // Reset form for a new entry
        resetForm();
      }
    } catch (error) {
      console.error('Error loading journal entry:', error);
      Alert.alert('Error', 'Failed to load journal entry');
      resetForm();
    }
  };
  
  // Reset additional fields only (not the basic fields)
  const resetAdditionalFields = () => {
    setEmotions([]);
    setThoughts([]);
    setBehaviors([]);
    setCopingStrategies([]);
    setGratitudeItems(['', '', '']);
    setLessonsLearned('');
    setGoals(['']);
    setPhysicalSymptoms([]);
    setRecoveryWins('');
  };
  
  // Save the current journal entry
  const saveEntry = async () => {
    if (!user) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    setIsSaving(true);
    try {
      // Prepare entry data based on the type - only use fields that exist in the database
      const entryData: Partial<Omit<DBJournalEntry, 'id' | 'user_id' | 'date' | 'created_at' | 'updated_at'>> = {
        mood: moodRating,
        content: journalText,
        triggers: selectedTriggers,
        had_urge: selectedTriggers.length > 0
      };
      
      // Store additional data as JSON in the content field if needed
      const additionalData = {
        entry_type: entryType,
        emotions,
        thoughts,
        behaviors,
        coping_strategies: copingStrategies,
        gratitude_items: gratitudeItems.filter(item => item.trim().length > 0),
        lessons_learned: lessonsLearned,
        goals: goals.filter(goal => goal.trim().length > 0),
        physical_symptoms: physicalSymptoms,
        recovery_wins: recoveryWins
      };
      
      // Append the additional data as JSON in the content
      entryData.content = JSON.stringify({
        text: journalText,
        additional: additionalData
      });
      
      await createOrUpdateJournalEntry(user.id, dateString, entryData);
      
      // Update local state
      setJournalEntries({
        ...journalEntries,
        [dateString]: {
          mood: moodRating,
          hasEntry: true,
          hadUrge: selectedTriggers.length > 0,
          entryType
        }
      });
      
      Alert.alert('Success', 'Journal entry saved successfully');
      setViewType('calendar');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setMoodRating(3);
    setJournalText('');
    setSelectedTriggers([]);
    setEntryType('daily');
    setEmotions([]);
    setThoughts([]);
    setBehaviors([]);
    setCopingStrategies([]);
    setGratitudeItems(['', '', '']);
    setLessonsLearned('');
    setGoals(['']);
    setPhysicalSymptoms([]);
    setRecoveryWins('');
  };
  
  // Add a detailed view for journal entries
  const renderDetailView = () => {
    // Get current entry data
    const dateString = selectedDate.toISOString().split('T')[0];
    const entry = journalEntries[dateString];
    if (!entry) return null;
    
    return (
      <>
        <View style={styles.detailHeader}>
          <Pressable style={styles.backButton} onPress={() => setViewType('calendar')}>
            <ArrowLeft size={20} color="#4B5563" />
          </Pressable>
          
          <Text style={styles.detailDate}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          
          <Pressable style={styles.editButton} onPress={() => setViewType('entry')}>
            <PenSquare size={18} color="#3D56F0" />
          </Pressable>
        </View>
        
        <View style={styles.detailCard}>
          {/* Entry type badge */}
          <View style={[styles.entryTypeBadge, { backgroundColor: getEntryTypeColor(entryType) + '20' }]}>
            <Text style={[styles.entryTypeBadgeText, { color: getEntryTypeColor(entryType) }]}>
              {entryTypeOptions.find(o => o.type === entryType)?.name || 'Journal Entry'}
            </Text>
          </View>
        
          {/* Mood display */}
          <View style={styles.detailMoodContainer}>
            <Text style={styles.detailSectionTitle}>Mood</Text>
            <View style={styles.detailMoodDisplay}>
              <View 
                style={[
                  styles.detailMoodBubble, 
                  { backgroundColor: getMoodColor(moodRating) }
                ]}
              >
                <Text style={styles.detailMoodEmoji}>{getMoodEmoji(moodRating)}</Text>
              </View>
              <View style={styles.detailMoodInfo}>
                <Text style={styles.detailMoodLabel}>{getMoodLabel(moodRating)}</Text>
                <Text style={styles.detailMoodScale}>
                  On a scale of 1-5, where 1 is very low and 5 is excellent
                </Text>
              </View>
            </View>
          </View>
          
          {/* Main journal content */}
          {journalText && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Journal Entry</Text>
              <Text style={styles.detailText}>{journalText}</Text>
            </View>
          )}
          
          {/* Emotions */}
          {emotions.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Emotions</Text>
              <View style={styles.detailTagsContainer}>
                {emotions.map((emotion, index) => (
                  <View key={index} style={styles.detailTag}>
                    <Text style={styles.detailTagText}>{emotion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Triggers */}
          {selectedTriggers.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Triggers</Text>
              <View style={styles.detailTagsContainer}>
                {selectedTriggers.map((trigger, index) => (
                  <View key={index} style={styles.detailTag}>
                    <Text style={styles.detailTagText}>{trigger}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Thoughts */}
          {thoughts.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Thoughts</Text>
              <View style={styles.detailTagsContainer}>
                {thoughts.map((thought, index) => (
                  <View key={index} style={styles.detailTag}>
                    <Text style={styles.detailTagText}>{thought}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Coping Strategies */}
          {copingStrategies.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Coping Strategies</Text>
              <View style={styles.detailTagsContainer}>
                {copingStrategies.map((strategy, index) => (
                  <View key={index} style={[styles.detailTag, styles.strategyTag]}>
                    <Text style={styles.detailTagText}>{strategy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Gratitude Items (for gratitude entries) */}
          {entryType === 'gratitude' && gratitudeItems.filter(item => item?.trim()).length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Gratitude</Text>
              {gratitudeItems.filter(item => item?.trim()).map((item, index) => (
                <View key={index} style={styles.detailListItem}>
                  <Text style={styles.detailListNumber}>{index + 1}.</Text>
                  <Text style={styles.detailListText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Recovery Wins (for milestone entries) */}
          {entryType === 'milestone' && recoveryWins && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Recovery Wins</Text>
              <Text style={styles.detailText}>{recoveryWins}</Text>
            </View>
          )}
          
          {/* Lessons Learned */}
          {lessonsLearned && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Lessons Learned</Text>
              <Text style={styles.detailText}>{lessonsLearned}</Text>
            </View>
          )}
        </View>
      </>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <BookOpen size={24} color="#3D56F0" />
          <Text style={styles.title}>Journal</Text>
        </View>
        
        {viewType === 'calendar' && renderCalendarView()}
        {viewType === 'list' && <JournalEntryList />}
        {viewType === 'entry' && renderEntryView()}
        {viewType === 'detail' && renderDetailView()}
        
        {viewType === 'calendar' && (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsTitle}>Insights</Text>
            {renderJournalInsights()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper functions for mood display
const getMoodColor = (rating: number, opacity: number = 1) => {
  const colors = {
    1: `rgba(239, 68, 68, ${opacity})`, // Red - Very difficult
    2: `rgba(245, 158, 11, ${opacity})`, // Amber - Difficult
    3: `rgba(59, 130, 246, ${opacity})`, // Blue - Neutral
    4: `rgba(16, 185, 129, ${opacity})`, // Green - Good
    5: `rgba(5, 150, 105, ${opacity})`, // Emerald - Excellent
  };
  return colors[rating as keyof typeof colors];
};

const getMoodLabel = (rating: number) => {
  const labels = {
    1: 'Difficult',
    2: 'Challenging',
    3: 'Neutral',
    4: 'Good',
    5: 'Excellent',
  };
  return labels[rating as keyof typeof labels];
};

const getMoodEmoji = (rating: number) => {
  const emojis = {
    1: '😞',
    2: '😐',
    3: '🙂',
    4: '😊',
    5: '😄',
  };
  return emojis[rating as keyof typeof emojis];
};

const getMoodStyle = (rating: number) => {
  const styles = {
    1: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.5)' },
    2: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.5)' },
    3: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.5)' },
    4: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.5)' },
    5: { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.5)' },
  };
  return styles[rating as keyof typeof styles];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  viewToggleTextActive: {
    color: '#3D56F0',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  calendarHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  calendarHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  calendarDayInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  todayCircle: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#3D56F0',
  },
  todayText: {
    color: '#3D56F0',
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  entryTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    marginLeft: 8,
  },
  createEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createEntryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  moodLegend: {
    padding: 20,
    marginBottom: 20,
  },
  moodLegendTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  moodLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  moodLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  moodLegendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  templateSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  templateTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 10,
  },
  templateOptions: {
    paddingBottom: 10,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedTemplateOption: {
    backgroundColor: '#3D56F0',
  },
  templateName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginLeft: 6,
  },
  selectedTemplateName: {
    color: '#FFFFFF',
  },
  templateDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryPrompt: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodButton: {
    width: '18%',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  selectedMoodEmoji: {
    transform: [{ scale: 1.2 }],
  },
  moodLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedMoodLabel: {
    color: '#1F2937',
  },
  entrySection: {
    marginBottom: 24,
  },
  entrySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entrySectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
  },
  entrySectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  journalTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tagButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedTagButton: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#3D56F0',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedTagText: {
    color: '#3D56F0',
  },
  gratitudeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  gratitudeInputMargin: {
    marginBottom: 12,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  addGoalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  entryFormActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
  },
  entryTypeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailMoodContainer: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  detailMoodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMoodBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailMoodEmoji: {
    fontSize: 24,
  },
  detailMoodInfo: {
    flex: 1,
  },
  detailMoodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailMoodScale: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  detailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  detailTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  strategyTag: {
    backgroundColor: '#EBF5FF',
  },
  detailTagText: {
    fontSize: 14,
    color: '#4B5563',
  },
  detailListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailListNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D56F0',
    width: 24,
  },
  detailListText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    flex: 1,
  },
  insightsSection: {
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  insightsStat: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  insightsHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  insightsTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  insightsTipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  insightsMoodScale: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
  moodScaleExplanation: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  moodScaleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  moodScaleItem: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
}); 