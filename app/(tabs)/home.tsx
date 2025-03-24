import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image, 
  ActivityIndicator, 
  RefreshControl, 
  Dimensions,
  Animated,
  Platform,
  Share,
  Alert
} from 'react-native';
import {
  Shield, 
  Clock, 
  Calendar, 
  Activity, 
  TrendingUp, 
  ChevronRight, 
  Bell, 
  X,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  Award,
  Heart,
  Share2,
  Zap,
  Sun,
  Moon,
  MessageSquare,
  BookOpen,
  RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getTodaysUrges, 
  getAchievements, 
  Achievement, 
  Urge, 
  createOrUpdateJournalEntry,
  getJournalEntry,
  supabase
} from '../../lib/supabase';
import * as Haptics from 'expo-haptics';
// import { Audio } from 'expo-av';
// import * as Notifications from 'expo-notifications';
import { Easing } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Confetti for celebrations
import ConfettiCannon from 'react-native-confetti-cannon';

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define motivational quote categories
const QUOTE_CATEGORIES = {
  MORNING: 'morning',
  EVENING: 'evening',
  URGE: 'urge',
  MILESTONE: 'milestone',
  GENERAL: 'general',
};

// Smart quote system
const MOTIVATIONAL_QUOTES = [
  // Morning quotes
  { text: "Today is a new opportunity to strengthen your resolve.", category: QUOTE_CATEGORIES.MORNING },
  { text: "Each morning offers a fresh start. Embrace it with courage.", category: QUOTE_CATEGORIES.MORNING },
  { text: "Morning by morning, building a better you.", category: QUOTE_CATEGORIES.MORNING },
  
  // Evening quotes
  { text: "You've made it through another day. Be proud of yourself.", category: QUOTE_CATEGORIES.EVENING },
  { text: "Reflect on your victories today, no matter how small.", category: QUOTE_CATEGORIES.EVENING },
  { text: "Rest well tonight. Tomorrow brings new strength.", category: QUOTE_CATEGORIES.EVENING },
  
  // Urge-specific quotes
  { text: "Urges are temporary, but freedom is permanent.", category: QUOTE_CATEGORIES.URGE },
  { text: "Every urge resisted is a victory gained.", category: QUOTE_CATEGORIES.URGE },
  { text: "The strongest among us are those who can sit with discomfort.", category: QUOTE_CATEGORIES.URGE },
  
  // Milestone quotes
  { text: "Look how far you've come! Your journey inspires others.", category: QUOTE_CATEGORIES.MILESTONE },
  { text: "Milestones aren't the end, they're proof you can go further.", category: QUOTE_CATEGORIES.MILESTONE },
  { text: "Celebrate your progress. You've earned this moment.", category: QUOTE_CATEGORIES.MILESTONE },
  
  // General motivation
  { text: "Progress, not perfection.", category: QUOTE_CATEGORIES.GENERAL },
  { text: "You are stronger than you know.", category: QUOTE_CATEGORIES.GENERAL },
  { text: "One day at a time.", category: QUOTE_CATEGORIES.GENERAL },
  { text: "The struggle you feel today develops the strength you need tomorrow.", category: QUOTE_CATEGORIES.GENERAL },
];

// Quick reflection prompts
const REFLECTION_PROMPTS = [
  "What's one thing you're grateful for today?",
  "What triggered you today, and how did you respond?",
  "What's one small victory you had today?",
  "What's something kind you can do for yourself right now?",
  "Who can you reach out to for support if needed?",
  "What's a healthy activity you can plan for tomorrow?",
  "What's a skill you've improved since starting recovery?",
];

// Mood options for quick entry
const MOOD_OPTIONS = [
  { value: 5, label: "Great", icon: Smile, color: "#10B981" },
  { value: 4, label: "Good", icon: ThumbsUp, color: "#3B82F6" },
  { value: 3, label: "Okay", icon: Meh, color: "#F59E0B" },
  { value: 2, label: "Difficult", icon: Frown, color: "#EF4444" },
  { value: 1, label: "Struggling", icon: RefreshCw, color: "#6B7280" },
];

// Helper function to get time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// Animation values
const fadeAnim = new Animated.Value(0);
const scaleAnim = new Animated.Value(0.95);

export default function HomeScreen() {
  const { user, profile, streak, isLoading, refreshStreak } = useAuth();
  const [urges, setUrges] = useState<Urge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [quote, setQuote] = useState('');
  const [quoteCategory, setQuoteCategory] = useState(QUOTE_CATEGORIES.GENERAL);
  const [journalPrompt, setJournalPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showMoodEntry, setShowMoodEntry] = useState(false);
  const [moodNote, setMoodNote] = useState('');
  const [savingMood, setSavingMood] = useState(false);
  const [streakInsight, setStreakInsight] = useState('');
  const [dailyChallenge, setDailyChallenge] = useState({ title: '', description: '' });
  const [showWeeklyChart, setShowWeeklyChart] = useState(false);
  const [weeklyMoodData, setWeeklyMoodData] = useState<{day: string, value: number}[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hasMoodToday, setHasMoodToday] = useState(false);
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [sound, setSound] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data when the user is authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
      checkDailyCheckin();
      loadAppropriateQuote();
      generateJournalPrompt();
      loadWeeklyMoodData();
      setupNotificationsIfNeeded();

      // Start entrance animations
      startEntryAnimations();
    }
    
    return () => {
      // Clean up sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [user]);

  // Update visuals based on time of day
  useEffect(() => {
    generateDailyChallenge();
    generateStreakInsight();
  }, [streak]);

  // Start entry animations
  const startEntryAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Check if user has already checked in today
  const checkDailyCheckin = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const entry = await getJournalEntry(user.id, today);
      setHasCheckedInToday(!!entry);
      setHasMoodToday(entry?.mood !== undefined);
      
      // If they've already logged a mood, set it
      if (entry?.mood) {
        setSelectedMood(entry.mood);
      }
    } catch (error) {
      console.error('Error checking daily check-in:', error);
    }
  };

  // Load weekly mood data for the chart
  const loadWeeklyMoodData = async () => {
    if (!user) return;
    
    try {
      // Get the past 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      // Get journal entries for those days
      const { data, error } = await supabase
        .from('journal_entries')
        .select('date, mood')
        .eq('user_id', user.id)
        .in('date', days);
      
      if (error) throw error;
      
      // Map days to mood values, using 0 if no mood data
      const moodMap = (data || []).reduce((acc, entry) => {
        acc[entry.date] = entry.mood;
        return acc;
      }, {} as Record<string, number>);
      
      const moodData = days.map(day => {
        // Get day of week for label (Mon, Tue, etc.)
        const date = new Date(day);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        return {
          day: dayOfWeek,
          value: moodMap[day] || 0,
        };
      });
      
      setWeeklyMoodData(moodData);
    } catch (error) {
      console.error('Error loading weekly mood data:', error);
    }
  };

  // Generate a journal prompt
  const generateJournalPrompt = () => {
    const randomIndex = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
    setJournalPrompt(REFLECTION_PROMPTS[randomIndex]);
  };

  // Generate daily challenge
  const generateDailyChallenge = () => {
    // Get date as a seed for consistent daily challenge
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
    
    const challenges = [
      { 
        title: 'Mindful Breathing', 
        description: 'Take 5 minutes to practice deep breathing exercises.' 
      },
      { 
        title: 'Gratitude Practice', 
        description: 'Write down 3 things you\'re grateful for today.' 
      },
      { 
        title: 'Physical Activity', 
        description: 'Go for a 15-minute walk outdoors.' 
      },
      { 
        title: 'Reach Out', 
        description: 'Connect with a supportive friend or family member.' 
      },
      { 
        title: 'Self-Care', 
        description: 'Do something kind for yourself today.' 
      },
      { 
        title: 'Digital Detox', 
        description: 'Take a 2-hour break from all screens.' 
      },
      { 
        title: 'Hydration', 
        description: 'Drink at least 8 glasses of water today.' 
      }
    ];
    
    // Use seed to select today's challenge
    const challenge = challenges[seed % challenges.length];
    setDailyChallenge(challenge);
  };

  // Generate streak insight
  const generateStreakInsight = () => {
    if (!streak) return;
    
    const insights = [
      `You've been sober for ${streak.current_streak} ${streak.current_streak === 1 ? 'day' : 'days'}. That's incredible progress!`,
      `${streak.current_streak} ${streak.current_streak === 1 ? 'day' : 'days'} clean! Your brain is healing more each day.`,
      `${streak.current_streak} ${streak.current_streak === 1 ? 'day' : 'days'} of freedom. You're building a new life.`,
      `Each of your ${streak.current_streak} ${streak.current_streak === 1 ? 'day' : 'days'} represents a choice toward health.`,
    ];
    
    // Special milestones
    if (streak.current_streak === 1) {
      setStreakInsight('Day 1! The journey of a thousand miles begins with a single step.');
    } else if (streak.current_streak === 7) {
      setStreakInsight('One week! Your body is already thanking you for this positive change.');
    } else if (streak.current_streak === 30) {
      setStreakInsight('One month clean! You\'ve proven your commitment to yourself.');
    } else if (streak.current_streak === 90) {
      setStreakInsight('90 days! This is a major milestone in recovery. Be incredibly proud.');
    } else if (streak.current_streak === 365) {
      setStreakInsight('ONE YEAR SOBER! This is an extraordinary achievement. You\'re an inspiration.');
    } else {
      // Regular insights for other days
      const randomIndex = (streak.current_streak + new Date().getDate()) % insights.length;
      setStreakInsight(insights[randomIndex]);
    }
    
    // Check if we should trigger celebration
    const milestones = [1, 7, 30, 60, 90, 180, 365];
    if (milestones.includes(streak.current_streak)) {
      triggerCelebration();
    }
  };

  // Trigger celebration animation and sound
  const triggerCelebration = async () => {
    setCongratsVisible(true);
    setConfettiActive(true);
    
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Play celebration sound - disabled until sound file is added
    // try {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require('../../assets/sounds/success.mp3')
    //   );
    //   setSound(sound);
    //   await sound.playAsync();
    // } catch (error) {
    //   console.error('Error playing sound:', error);
    // }
    
    // Hide after 5 seconds
    setTimeout(() => {
      setCongratsVisible(false);
      setConfettiActive(false);
    }, 5000);
  };

  // Setup notifications if not already done
  const setupNotificationsIfNeeded = async () => {
    if (!user || !profile?.notifications_enabled) return;
    
    try {
      const hasSetup = await AsyncStorage.getItem('notificationsSetup');
      if (hasSetup) return;
      
      // Request permissions - commented out until expo-notifications is properly imported
      // const { status } = await Notifications.requestPermissionsAsync();
      // if (status !== 'granted') return;
      
      // Schedule daily check-in reminder - commented out until expo-notifications is properly imported
      // await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: 'Daily Check-in',
      //     body: 'How are you feeling today? Take a moment to check in with yourself.',
      //   },
      //   trigger: {
      //     hour: 20, // 8 PM
      //     minute: 0,
      //     repeats: true,
      //   },
      // });
      
      // Schedule morning motivation - commented out until expo-notifications is properly imported
      // await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: 'Morning Motivation',
      //     body: 'A new day of strength and healing ahead. You\'ve got this!',
      //   },
      //   trigger: {
      //     hour: 8, // 8 AM
      //     minute: 30,
      //     repeats: true,
      //   },
      // });
      
      await AsyncStorage.setItem('notificationsSetup', 'true');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  // Load appropriate quote based on time of day and user context
  const loadAppropriateQuote = () => {
    const timeOfDay = getTimeOfDay();
    let category = QUOTE_CATEGORIES.GENERAL;
    
    // If morning, use morning quote
    if (timeOfDay === 'morning') {
      category = QUOTE_CATEGORIES.MORNING;
    } 
    // If evening, use evening quote
    else if (timeOfDay === 'evening') {
      category = QUOTE_CATEGORIES.EVENING;
    }
    // If user had urges today, prioritize urge-related quotes
    else if (urges.length > 0) {
      category = QUOTE_CATEGORIES.URGE;
    }
    // If user hit a milestone recently, use milestone quote
    else if (streak && [1, 7, 30, 90, 180, 365].includes(streak.current_streak)) {
      category = QUOTE_CATEGORIES.MILESTONE;
    }
    
    // Filter quotes by category
    const filteredQuotes = MOTIVATIONAL_QUOTES.filter(q => q.category === category);
    
    // If no quotes in this category, use general quotes
    const quotesToUse = filteredQuotes.length > 0 ? filteredQuotes : MOTIVATIONAL_QUOTES;
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * quotesToUse.length);
    setQuote(quotesToUse[randomIndex].text);
    setQuoteCategory(quotesToUse[randomIndex].category);
  };

  // Save mood entry to journal
  const saveMoodEntry = async () => {
    if (!user || selectedMood === null) return;
    
    setSavingMood(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await createOrUpdateJournalEntry(user.id, today, {
        mood: selectedMood,
        content: moodNote || `Mood tracked: ${MOOD_OPTIONS.find(m => m.value === selectedMood)?.label}`,
      });
      
      // Update check-in status
      setHasCheckedInToday(true);
      setHasMoodToday(true);
      
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Close mood entry
      setShowMoodEntry(false);
      
      // Update weekly chart
      loadWeeklyMoodData();
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Could not save your mood. Please try again.');
    } finally {
      setSavingMood(false);
    }
  };

  // Fetch user data from Supabase
  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // Load today's urges
      const todaysUrges = await getTodaysUrges(user.id);
      setUrges(todaysUrges);
      
      // Load achievements
      const userAchievements = await getAchievements(user.id);
      setAchievements(userAchievements);
      
      // Refresh streak data
      refreshStreak();
      
      // Update quote based on new data
      loadAppropriateQuote();
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Calculate today's data
  const todayData = {
    urges: urges.length,
    urgesOvercome: urges.filter(urge => urge.overcome).length,
    mood: selectedMood ? MOOD_OPTIONS.find(m => m.value === selectedMood)?.label || 'Unknown' : 'Not set',
    energy: hasMoodToday ? 'Tracked' : 'Not tracked',
  };

  // Share your progress
  const shareProgress = async () => {
    try {
      // Trigger haptic feedback before sharing
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const message = streak 
        ? `I've been sober for ${streak.current_streak} days using BreakFree! 💪 #RecoveryJourney`
        : `I'm on my journey to freedom with BreakFree! 💪 #RecoveryJourney`;
        
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing progress:', error);
    }
  };

  // Handle navigating to the urge tracker
  const handleRecordUrge = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/urge-tracker');
  };

  // Handle navigating to emergency help
  const handleEmergencyHelp = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/tools');
  };
  
  // Handle refreshing data (pull to refresh)
  const handleRefresh = () => {
    loadUserData();
    checkDailyCheckin();
    loadWeeklyMoodData();
  };
  
  // Handle quick mood entry
  const handleQuickMood = (mood: number) => {
    // Trigger haptic feedback
    Haptics.selectionAsync();
    
    setSelectedMood(mood);
    // Briefly delay to show the selected state before saving
    setTimeout(() => {
      saveMoodEntry();
    }, 300);
  };
  
  // Function to handle urge responses
  const handleUrgeResponse = async (urge: Urge, response: 'resisted' | 'indulged') => {
    try {
      // Play haptic feedback
      if (response === 'resisted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      // Update the urge in Supabase
      const { error } = await supabase
        .from('urges')
        .update({ 
          overcome: response === 'resisted',
          responded_at: new Date().toISOString() 
        })
        .eq('id', urge.id);
      
      if (error) throw error;
      
      // Update local state
      setUrges(urges.map(u => 
        u.id === urge.id 
          ? { ...u, overcome: response === 'resisted', responded_at: new Date().toISOString() } 
          : u
      ));
      
      // Check for streak increment
      if (response === 'resisted') {
        // Show confetti for resisted urges
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3000);
        
        // Check for achievements
        checkForAchievements();
      }
      
      // Force refresh the data
      loadUserData();
    } catch (error) {
      console.error('Error handling urge response:', error);
      Alert.alert('Error', 'Failed to record your response. Please try again.');
    }
  };

  // Check for achievements after resisting an urge
  const checkForAchievements = async () => {
    if (!user) return;
    
    try {
      // Get the latest achievements
      const achievements = await getAchievements(user.id);
      
      // Find any new achievements that aren't displayed yet
      const newAchievement = achievements.find(a => a.achieved && !(a as any).displayed);
      
      if (newAchievement) {
        // Update the achievement as displayed
        const { error: updateError } = await supabase
          .from('achievements')
          .update({ displayed: true })
          .eq('id', newAchievement.id);
          
        if (updateError) throw updateError;
        
        // Show the achievement modal
        setActiveAchievement(newAchievement);
        setShowReward(true);
        
        // Show confetti for new achievement
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 5000);
      }
    } catch (error) {
      console.error('Error checking for achievements:', error);
    }
  };

  // Function to refresh data from the server
  const refreshData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await loadUserData();
      // Refresh other data as needed
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Display home content
  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoadingData} onRefresh={handleRefresh} />
        }
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                Good {getTimeOfDay()}, {profile?.name || 'Friend'}
              </Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            <Pressable 
              style={styles.notificationButton} 
              onPress={() => router.push('/profile')}
              android_ripple={{ color: '#E2E8F0', radius: 20 }}
            >
              <Bell size={24} color="#1F2937" />
            </Pressable>
          </View>
          
          {/* Streak Card with Insight */}
          <View style={styles.streakCard}>
            <LinearGradient
              colors={['#3D56F0', '#5B73FF']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.streakContent}>
              <View style={styles.streakIconContainer}>
                <Shield size={28} color="#FFFFFF" />
              </View>
              
              <View style={styles.streakInfo}>
                <Text style={styles.streakCount}>{streak?.current_streak || 0} Days</Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
              </View>
              
              <View style={styles.bestStreakContainer}>
                <Text style={styles.bestStreakLabel}>Best</Text>
                <Text style={styles.bestStreakCount}>{streak?.best_streak || 0}</Text>
              </View>
            </View>
            
            {/* Streak Insight */}
            <View style={styles.streakInsightContainer}>
              <Text style={styles.streakInsight}>{streakInsight}</Text>
              
              <Pressable 
                style={styles.shareButton}
                onPress={shareProgress}
              >
                <Share2 size={16} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share</Text>
              </Pressable>
            </View>
          </View>
          
          {/* Today's Challenge */}
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeHeaderLeft}>
                <Award size={20} color="#3D56F0" />
                <Text style={styles.challengeTitle}>Today's Challenge</Text>
              </View>
              
              <Pressable style={styles.refreshButton} onPress={generateDailyChallenge}>
                <RefreshCw size={16} color="#6B7280" />
              </Pressable>
            </View>
            
            <Text style={styles.challengeName}>{dailyChallenge.title}</Text>
            <Text style={styles.challengeDescription}>{dailyChallenge.description}</Text>
            
            <View style={styles.challengeActions}>
              <Pressable style={styles.challengeButton}>
                <Text style={styles.challengeButtonText}>Complete</Text>
                <ChevronRight size={16} color="#3D56F0" />
              </Pressable>
            </View>
          </View>
          
          {/* Quick Mood Entry */}
          {!hasMoodToday && (
            <View style={styles.moodCard}>
              <Text style={styles.moodTitle}>How are you feeling today?</Text>
              <View style={styles.moodOptions}>
                {MOOD_OPTIONS.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <Pressable
                      key={mood.value}
                      style={[styles.moodOption]}
                      onPress={() => handleQuickMood(mood.value)}
                    >
                      <View style={[styles.moodIconContainer, { backgroundColor: `${mood.color}15` }]}>
                        <Icon size={24} color={mood.color} />
                      </View>
                      <Text style={styles.moodLabel}>{mood.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              
              <Pressable 
                style={styles.moodDetailButton}
                onPress={() => setShowMoodEntry(true)}
              >
                <Text style={styles.moodDetailButtonText}>Add details</Text>
                <ChevronRight size={16} color="#3D56F0" />
              </Pressable>
            </View>
          )}
          
          {/* Today's Data */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today</Text>
            {hasMoodToday && (
              <Pressable onPress={() => setShowMoodEntry(true)}>
                <Text style={styles.viewAllText}>Update</Text>
              </Pressable>
            )}
          </View>
          
          <View style={styles.todayCard}>
            <View style={styles.todayMetrics}>
              <View style={styles.metric}>
                <View style={[styles.metricIcon, { backgroundColor: '#EBF5FF' }]}>
                  <Activity size={18} color="#3B82F6" />
                </View>
                <Text style={styles.metricValue}>{todayData.urges}</Text>
                <Text style={styles.metricLabel}>Urges</Text>
              </View>
              
              <View style={styles.metric}>
                <View style={[styles.metricIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Shield size={18} color="#10B981" />
                </View>
                <Text style={styles.metricValue}>{todayData.urgesOvercome}</Text>
                <Text style={styles.metricLabel}>Overcome</Text>
              </View>
              
              <View style={styles.metric}>
                <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Heart size={18} color="#F59E0B" />
                </View>
                <Text style={styles.metricValue}>{todayData.mood}</Text>
                <Text style={styles.metricLabel}>Mood</Text>
              </View>
              
              <View style={styles.metric}>
                <View style={[styles.metricIcon, { backgroundColor: '#FFEDD5' }]}>
                  <Clock size={18} color="#FB923C" />
                </View>
                <Text style={styles.metricValue}>{selectedMood || 0}</Text>
                <Text style={styles.metricLabel}>Rating</Text>
              </View>
            </View>
            
            {/* Weekly Mood Chart Toggle */}
            <Pressable 
              style={styles.chartToggle}
              onPress={() => setShowWeeklyChart(!showWeeklyChart)}
            >
              <Text style={styles.chartToggleText}>
                {showWeeklyChart ? 'Hide weekly chart' : 'Show weekly chart'}
              </Text>
              <ChevronRight size={16} color="#3D56F0" style={{
                transform: [{ rotate: showWeeklyChart ? '90deg' : '0deg' }]
              }} />
            </Pressable>
            
            {/* Weekly Mood Chart */}
            {showWeeklyChart && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Your Week in Moods</Text>
                <View style={styles.chart}>
                  {weeklyMoodData.map((item, index) => (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.barContainer}>
                        <View style={[
                          styles.bar, 
                          { 
                            height: `${Math.max(item.value * 20, 5)}%`,
                            backgroundColor: item.value > 0 
                              ? MOOD_OPTIONS.find(m => m.value === item.value)?.color || '#3D56F0'
                              : '#E5E7EB'
                          }
                        ]} />
                      </View>
                      <Text style={styles.barLabel}>{item.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
          
          {/* Motivational Quote */}
          <View style={styles.quoteCard}>
            <View style={styles.quoteIconContainer}>
              <Heart size={20} color="#EF4444" fill="#EF4444" />
            </View>
            <Text style={styles.quote}>{quote}</Text>
          </View>
          
          {/* Active Urges Section */}
          {urges.filter(urge => urge.overcome === undefined).length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Urges</Text>
                <Pressable onPress={handleRecordUrge}>
                  <Text style={styles.viewAllText}>New</Text>
                </Pressable>
              </View>
              
              <View style={styles.activeUrgesContainer}>
                {urges
                  .filter(urge => urge.overcome === undefined)
                  .map(urge => (
                    <View key={urge.id} style={styles.urgeCard}>
                      <View style={styles.urgeHeader}>
                        <View style={styles.urgeTime}>
                          <Clock size={16} color="#6B7280" />
                          <Text style={styles.urgeTimeText}>
                            {new Date(urge.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                        <View style={styles.urgeIntensity}>
                          <Text style={styles.urgeIntensityText}>
                            Intensity: {urge.intensity}/10
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.urgeDescription}>
                        {urge.trigger || "No trigger specified"}
                      </Text>
                      
                      <View style={styles.urgeActions}>
                        <Pressable 
                          style={[styles.urgeButton, styles.urgeButtonResist]}
                          onPress={() => handleUrgeResponse(urge, 'resisted')}
                        >
                          <ThumbsUp size={16} color="#FFFFFF" />
                          <Text style={styles.urgeButtonText}>I Resisted</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.urgeButton, styles.urgeButtonIndulge]}
                          onPress={() => handleUrgeResponse(urge, 'indulged')}
                        >
                          <Frown size={16} color="#FFFFFF" />
                          <Text style={styles.urgeButtonText}>I Indulged</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
              </View>
            </>
          )}
          
          {/* Completed Urges Section */}
          {urges.filter(urge => urge.overcome !== undefined).length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Responses</Text>
              </View>
              
              <View style={styles.completedUrgesContainer}>
                {urges
                  .filter(urge => urge.overcome !== undefined)
                  .map(urge => (
                    <View 
                      key={urge.id} 
                      style={[
                        styles.completedUrgeCard,
                        urge.overcome ? styles.resistedUrge : styles.indulgedUrge
                      ]}
                    >
                      <View style={styles.urgeHeader}>
                        <View style={styles.urgeTime}>
                          <Clock size={16} color={urge.overcome ? "#FFFFFF" : "#FFFFFF"} />
                          <Text style={[styles.urgeTimeText, {color: "#FFFFFF"}]}>
                            {new Date(urge.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                        
                        <View style={styles.urgeStatus}>
                          {urge.overcome ? (
                            <ThumbsUp size={16} color="#FFFFFF" />
                          ) : (
                            <Frown size={16} color="#FFFFFF" />
                          )}
                          <Text style={styles.urgeStatusText}>
                            {urge.overcome ? "Resisted" : "Indulged"}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.urgeDescription, {color: "#FFFFFF"}]}>
                        {urge.trigger || "No trigger specified"}
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
          
          {/* Tips of the Day */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>Tip of the Day</Text>
              <Pressable style={styles.dismissButton}>
                <X size={16} color="#6B7280" />
              </Pressable>
            </View>
            
            <Text style={styles.tipText}>
              Urges usually last 15-20 minutes. Having a plan for distraction during these critical moments can significantly increase your success rate.
            </Text>
            
            <Pressable 
              style={styles.tipButton} 
              onPress={() => router.push('/tools')}
            >
              <Text style={styles.tipButtonText}>View Distraction Techniques</Text>
              <ChevronRight size={16} color="#3D56F0" />
            </Pressable>
          </View>
          
          {/* Journal Prompt */}
          <View style={styles.journalPromptCard}>
            <View style={styles.journalPromptHeader}>
              <BookOpen size={20} color="#3D56F0" />
              <Text style={styles.journalPromptTitle}>Reflection Prompt</Text>
            </View>
            
            <Text style={styles.journalPromptText}>{journalPrompt}</Text>
            
            <Pressable 
              style={styles.journalPromptButton}
              onPress={() => router.push('/journal')}
            >
              <Text style={styles.journalPromptButtonText}>Write in Journal</Text>
              <ChevronRight size={16} color="#3D56F0" />
            </Pressable>
          </View>
          
          {/* Achievement Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Pressable onPress={() => router.push('/profile')}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>
          
          <View style={styles.achievementsCard}>
            {achievements.length > 0 ? (
              achievements.slice(0, 3).map((achievement, index) => (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementItem,
                    index < achievements.length - 1 && styles.achievementItemBorder
                  ]}
                >
                  <View style={styles.achievementInfo}>
                    <View 
                      style={[
                        styles.achievementStatus,
                        achievement.achieved ? styles.achievementComplete : styles.achievementIncomplete
                      ]}
                    >
                      {achievement.achieved ? (
                        <Shield size={14} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.achievementProgress}>
                          {achievement.progress || 0}/{achievement.total || 1}
                        </Text>
                      )}
                    </View>
                    
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  </View>
                  
                  <ChevronRight size={18} color="#9CA3AF" />
                </View>
              ))
            ) : (
              <View style={styles.emptyAchievements}>
                <Text style={styles.emptyText}>No achievements yet. Keep going!</Text>
              </View>
            )}
          </View>
          
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Pressable 
              style={styles.quickActionButton} 
              onPress={handleRecordUrge}
            >
              <LinearGradient
                colors={['#EF4444', '#F87171']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Activity size={20} color="#FFFFFF" style={styles.quickActionIcon} />
              <Text style={styles.quickActionText}>Record Urge</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickActionButton} 
              onPress={handleEmergencyHelp}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Shield size={20} color="#FFFFFF" style={styles.quickActionIcon} />
              <Text style={styles.quickActionText}>Emergency Help</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Mood Entry Modal */}
      {showMoodEntry && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How are you feeling?</Text>
              <Pressable 
                onPress={() => setShowMoodEntry(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>
            
            <View style={styles.moodSelector}>
              {MOOD_OPTIONS.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.value;
                
                return (
                  <Pressable
                    key={mood.value}
                    style={[
                      styles.moodSelectorOption,
                      isSelected && { 
                        backgroundColor: `${mood.color}15`,
                        borderColor: mood.color 
                      }
                    ]}
                    onPress={() => setSelectedMood(mood.value)}
                  >
                    <Icon 
                      size={24} 
                      color={mood.color} 
                      style={styles.moodSelectorIcon} 
                    />
                    <Text 
                      style={[
                        styles.moodSelectorLabel,
                        isSelected && { color: mood.color, fontFamily: 'Inter-SemiBold' }
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            
            <Pressable 
              style={[
                styles.saveMoodButton,
                (!selectedMood || savingMood) && styles.saveMoodButtonDisabled
              ]}
              onPress={saveMoodEntry}
              disabled={!selectedMood || savingMood}
            >
              {savingMood ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveMoodButtonText}>Save Mood</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
      
      {/* Celebration Overlay */}
      {congratsVisible && (
        <View style={styles.congratsOverlay}>
          <View style={styles.congratsContent}>
            <Award size={64} color="#F59E0B" />
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsText}>
              {streak?.current_streak} days of sobriety is a tremendous achievement. 
              Be proud of your progress!
            </Text>
            <Pressable 
              style={styles.congratsButton}
              onPress={() => setCongratsVisible(false)}
            >
              <Text style={styles.congratsButtonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      )}
      <RewardModal visible={showReward} onClose={() => setShowReward(false)} achievement={activeAchievement} />
      {loading && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#007AFF" /></View>}
      {confettiActive && (
        <ConfettiCannon
          count={200}
          origin={{x: Dimensions.get('window').width / 2, y: 0}}
          explosionSpeed={350}
          fallSpeed={3000}
          fadeOut={true}
        />
      )}
    </>
  );
}

// Reward Modal Component
const RewardModal = ({ visible, onClose, achievement }: { visible: boolean, onClose: () => void, achievement: Achievement | null }) => {
  if (!visible || !achievement) return null;

  return (
    <View style={rewardStyles.modalContainer}>
      <View style={rewardStyles.modalContent}>
        <View style={rewardStyles.header}>
          <Award size={40} color="#FFD700" />
          <Text style={rewardStyles.title}>Achievement Unlocked!</Text>
        </View>
        
        <Text style={rewardStyles.achievementName}>{achievement.title}</Text>
        <Text style={rewardStyles.description}>{achievement.description}</Text>
        
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={rewardStyles.button}
        >
          <Pressable onPress={onClose}>
            <Text style={rewardStyles.buttonText}>Awesome!</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
};

const rewardStyles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4facfe',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#3D56F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bestStreakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  bestStreakLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bestStreakCount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  streakInsightContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInsight: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todayMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  chartToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chartToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  chartContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '80%',
    height: '85%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#3D56F0',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
    marginLeft: 8,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginBottom: 16,
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodOption: {
    alignItems: 'center',
    width: '18%',
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  moodDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  moodDetailButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  quoteCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  quoteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quote: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 24,
  },
  tipCard: {
    backgroundColor: '#EBF5FF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3D56F0',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  journalPromptCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  journalPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalPromptTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  journalPromptText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  journalPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  journalPromptButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  achievementItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementComplete: {
    backgroundColor: '#10B981',
  },
  achievementIncomplete: {
    backgroundColor: '#F3F4F6',
  },
  achievementProgress: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  emptyAchievements: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionIcon: {
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodSelector: {
    marginBottom: 24,
  },
  moodSelectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moodSelectorIcon: {
    marginRight: 12,
  },
  moodSelectorLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  saveMoodButton: {
    backgroundColor: '#3D56F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveMoodButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  saveMoodButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Celebration overlay
  congratsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  congratsContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 340,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  congratsTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  congratsButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  congratsButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  activeUrgesContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  urgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  urgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgeTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgeTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  urgeIntensity: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  urgeIntensityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  urgeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginBottom: 16,
  },
  urgeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  urgeButtonResist: {
    backgroundColor: '#10B981',
  },
  urgeButtonIndulge: {
    backgroundColor: '#F87171',
  },
  urgeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  completedUrgesContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  completedUrgeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resistedUrge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  indulgedUrge: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#F87171',
  },
  urgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgeStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginLeft: 4,
  },
}); 