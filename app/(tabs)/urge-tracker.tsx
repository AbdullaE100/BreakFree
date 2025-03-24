import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Activity, MapPin, CornerDownRight, Shield, Check, X, Clock, BookOpen, BarChart3, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Urge, createUrge, getTodaysUrges } from '../../lib/supabase';
import UrgeHistory from '../components/UrgeHistory';

// Define types for our CustomSlider
interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

// CustomSlider component with proper typing
const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  label,
  minLabel,
  maxLabel
}) => {
  const steps = [];
  const totalSteps = (maximumValue - minimumValue) / step + 1;
  
  for (let i = 0; i < totalSteps; i++) {
    const stepValue = minimumValue + (i * step);
    steps.push(stepValue);
  }
  
  return (
    <View style={styles.sliderContainer}>
      {label && <Text style={styles.sliderLabel}>{label}</Text>}
      
      <View style={styles.sliderTrack}>
        {minLabel && <Text style={styles.sliderMinMaxLabel}>{minLabel}</Text>}
        
        <View style={styles.sliderStepsContainer}>
          {steps.map((stepValue) => (
            <TouchableOpacity
              key={stepValue}
              style={[
                styles.sliderStep,
                value >= stepValue && styles.sliderStepActive,
                value === stepValue && styles.sliderStepCurrent
              ]}
              onPress={() => onValueChange(stepValue)}
            />
          ))}
        </View>
        
        {maxLabel && <Text style={styles.sliderMinMaxLabel}>{maxLabel}</Text>}
      </View>
    </View>
  );
};

// Common data types
interface LocationOption {
  id: string;
  label: string;
}

interface TriggerOption {
  id: string;
  label: string;
}

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  forIntensity: 'low' | 'medium' | 'high' | 'all';
}

// Tabs for the urge tracker
type TabType = 'track' | 'history';

export default function UrgeTrackerScreen() {
  const { user } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('track');
  
  // Urge form state
  const [urgeIntensity, setUrgeIntensity] = useState<number>(5);
  const [location, setLocation] = useState<string>('');
  const [trigger, setTrigger] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [overcameUrge, setOvercameUrge] = useState<boolean | null>(null);
  const [showCopingStrategies, setShowCopingStrategies] = useState<boolean>(false);
  const [selectedCopingStrategy, setSelectedCopingStrategy] = useState<string | null>(null);
  
  // Loading states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [urges, setUrges] = useState<Urge[]>([]);
  
  // Common locations and triggers
  const commonLocations: LocationOption[] = [
    { id: 'home', label: 'Home' },
    { id: 'work', label: 'Work' },
    { id: 'bed', label: 'Bed' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'phone', label: 'On Phone' },
    { id: 'social', label: 'Social Event' },
    { id: 'commuting', label: 'Commuting' },
  ];
  
  const commonTriggers: TriggerOption[] = [
    { id: 'boredom', label: 'Boredom' },
    { id: 'stress', label: 'Stress' },
    { id: 'loneliness', label: 'Loneliness' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'social_media', label: 'Social Media' },
    { id: 'argument', label: 'Argument' },
    { id: 'celebration', label: 'Celebration' },
    { id: 'exposure', label: 'Saw a trigger' },
    { id: 'emotion', label: 'Strong Emotion' },
  ];
  
  // Coping strategies based on intensity levels
  const copingStrategies: CopingStrategy[] = [
    {
      id: 'deep_breathing',
      title: 'Deep Breathing',
      description: 'Take 10 deep breaths, inhaling for 4 counts and exhaling for 6. Focus on the sensation of your breath.',
      forIntensity: 'all'
    },
    {
      id: 'urge_surfing',
      title: 'Urge Surfing',
      description: 'Observe the urge like a wave - it will rise, peak, and eventually fade. Don\'t fight it, just watch it pass.',
      forIntensity: 'high'
    },
    {
      id: 'distraction',
      title: 'Active Distraction',
      description: 'Engage in a different activity that requires focus - a walk, puzzle, or call a friend.',
      forIntensity: 'medium'
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Exercise',
      description: 'Focus on your 5 senses - name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
      forIntensity: 'medium'
    },
    {
      id: 'cold_water',
      title: 'Cold Water Technique',
      description: 'Splash cold water on your face or hold an ice cube. This activates your body\'s calming response.',
      forIntensity: 'high'
    },
    {
      id: 'visualization',
      title: 'Visualization',
      description: 'Imagine yourself resisting the urge and feeling proud afterward. Visualize the benefits of staying on track.',
      forIntensity: 'low'
    },
    {
      id: 'delay',
      title: 'Delay Tactic',
      description: 'Tell yourself "I\'ll wait just 10 minutes before deciding." Then extend it another 10 minutes.',
      forIntensity: 'high'
    },
    {
      id: 'play_forward',
      title: 'Play the Tape Forward',
      description: 'Imagine the entire scenario if you give in - not just the immediate relief, but the aftermath of guilt and disappointment.',
      forIntensity: 'medium'
    },
  ];
  
  // Load urges data
  useEffect(() => {
    if (user) {
      loadUrges();
    }
  }, [user]);
  
  const loadUrges = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userUrges = await getTodaysUrges(user.id);
      setUrges(userUrges);
    } catch (error) {
      console.error('Error loading urges:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get relevant coping strategies based on intensity
  const getRelevantCopingStrategies = () => {
    let intensityLevel: 'low' | 'medium' | 'high';
    
    if (urgeIntensity <= 3) intensityLevel = 'low';
    else if (urgeIntensity <= 7) intensityLevel = 'medium';
    else intensityLevel = 'high';
    
    return copingStrategies.filter(strategy => 
      strategy.forIntensity === intensityLevel || strategy.forIntensity === 'all'
    );
  };
  
  // Handle saving the urge data
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      const urgeData = {
        intensity: urgeIntensity,
        location,
        trigger,
        notes: notes + (selectedCopingStrategy ? `\nCoping strategy used: ${selectedCopingStrategy}` : ''),
        overcome: overcameUrge === true,
      };
      
      await createUrge(user.id, urgeData);
      await loadUrges();
      
      // Reset the form
      setUrgeIntensity(5);
      setLocation('');
      setTrigger('');
      setNotes('');
      setOvercameUrge(null);
      setSelectedCopingStrategy(null);
      setShowCopingStrategies(false);
      
      // Switch to history tab to see the new entry
      setActiveTab('history');
    } catch (error) {
      console.error('Error saving urge:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render the urge tracker form
  const renderTrackForm = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>How intense is the urge?</Text>
        
        <CustomSlider
          value={urgeIntensity}
          onValueChange={setUrgeIntensity}
          minimumValue={1}
          maximumValue={10}
          minLabel="Mild"
          maxLabel="Severe"
        />
        
        <View style={styles.intensityIndicator}>
          <View style={[
            styles.intensityBar,
            { width: `${10 * urgeIntensity}%` },
            urgeIntensity <= 3 && styles.intensityLow,
            urgeIntensity > 3 && urgeIntensity <= 7 && styles.intensityMedium,
            urgeIntensity > 7 && styles.intensityHigh
          ]} />
        </View>
        
        <View style={styles.intensityLabelContainer}>
          <Text style={styles.intensityLabel}>
            {urgeIntensity <= 3 ? 'Low' : urgeIntensity <= 7 ? 'Moderate' : 'High'} intensity
          </Text>
          
          <Pressable 
            style={styles.copingButton}
            onPress={() => setShowCopingStrategies(!showCopingStrategies)}
          >
            <Shield size={16} color="#3D56F0" />
            <Text style={styles.copingButtonText}>
              {showCopingStrategies ? 'Hide strategies' : 'View coping strategies'}
            </Text>
          </Pressable>
        </View>
        
        {showCopingStrategies && (
          <View style={styles.copingStrategiesContainer}>
            {getRelevantCopingStrategies().map(strategy => (
              <Pressable
                key={strategy.id}
                style={[
                  styles.copingStrategyCard,
                  selectedCopingStrategy === strategy.title && styles.copingStrategyCardSelected
                ]}
                onPress={() => setSelectedCopingStrategy(
                  selectedCopingStrategy === strategy.title ? null : strategy.title
                )}
              >
                <View style={styles.copingStrategyHeader}>
                  <Text style={styles.copingStrategyTitle}>{strategy.title}</Text>
                  {selectedCopingStrategy === strategy.title && (
                    <Check size={16} color="#10B981" />
                  )}
                </View>
                <Text style={styles.copingStrategyDescription}>{strategy.description}</Text>
              </Pressable>
            ))}
            
            <View style={styles.copingStrategyTip}>
              <AlertCircle size={14} color="#3D56F0" />
              <Text style={styles.copingStrategyTipText}>
                Select a strategy you'd like to try and include it in your record
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Where are you?</Text>
        
        <View style={styles.inputContainer}>
          <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your location"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {commonLocations.map((loc) => (
            <Pressable
              key={loc.id}
              style={[styles.optionButton, location === loc.label && styles.optionButtonActive]}
              onPress={() => setLocation(loc.label)}
            >
              <Text style={[styles.optionButtonText, location === loc.label && styles.optionButtonTextActive]}>
                {loc.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What triggered this urge?</Text>
        
        <View style={styles.inputContainer}>
          <CornerDownRight size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="What caused this urge?"
            value={trigger}
            onChangeText={setTrigger}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {commonTriggers.map((trig) => (
            <Pressable
              key={trig.id}
              style={[styles.optionButton, trigger === trig.label && styles.optionButtonActive]}
              onPress={() => setTrigger(trig.label)}
            >
              <Text style={[styles.optionButtonText, trigger === trig.label && styles.optionButtonTextActive]}>
                {trig.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notes</Text>
        
        <TextInput
          style={styles.textArea}
          placeholder="Any additional details you want to track..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Did you overcome this urge?</Text>
        
        <View style={styles.buttonGroup}>
          <Pressable 
            style={[
              styles.outcomeButton, 
              overcameUrge === true && styles.outcomeButtonSuccess
            ]}
            onPress={() => setOvercameUrge(true)}
          >
            <Check 
              size={20} 
              color={overcameUrge === true ? "#FFFFFF" : "#10B981"} 
              style={styles.outcomeButtonIcon} 
            />
            <Text 
              style={[
                styles.outcomeButtonText, 
                overcameUrge === true && styles.outcomeButtonTextActive
              ]}
            >
              Yes, I did!
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.outcomeButton, 
              overcameUrge === false && styles.outcomeButtonDanger
            ]}
            onPress={() => setOvercameUrge(false)}
          >
            <X 
              size={20} 
              color={overcameUrge === false ? "#FFFFFF" : "#EF4444"} 
              style={styles.outcomeButtonIcon} 
            />
            <Text 
              style={[
                styles.outcomeButtonText, 
                styles.outcomeButtonTextDanger,
                overcameUrge === false && styles.outcomeButtonTextActive
              ]}
            >
              No, not this time
            </Text>
          </Pressable>
        </View>
      </View>
      
      <Pressable 
        style={styles.saveButton} 
        onPress={handleSave}
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
    </ScrollView>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Activity size={24} color="#3D56F0" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Urge Tracker</Text>
        
        {activeTab === 'history' && (
          <Pressable 
            style={styles.refreshButton}
            onPress={loadUrges}
          >
            <RefreshCw size={18} color="#6B7280" />
          </Pressable>
        )}
      </View>
      
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === 'track' && styles.activeTabButton]}
          onPress={() => setActiveTab('track')}
        >
          <BookOpen size={18} color={activeTab === 'track' ? "#3D56F0" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === 'track' && styles.activeTabText]}>
            Track
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
          onPress={() => setActiveTab('history')}
        >
          <BarChart3 size={18} color={activeTab === 'history' ? "#3D56F0" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History & Insights
          </Text>
        </Pressable>
      </View>
      
      {activeTab === 'track' ? (
        renderTrackForm()
      ) : (
        <View style={styles.historyContainer}>
          <UrgeHistory urges={urges} loading={isLoading} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  activeTabButton: {
    backgroundColor: '#EBF5FF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#3D56F0',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  // Slider styles
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  sliderTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderStepsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  sliderStepActive: {
    backgroundColor: '#3D56F0',
    borderColor: '#3D56F0',
  },
  sliderStepCurrent: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    shadowColor: '#3D56F0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderMinMaxLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginHorizontal: 8,
  },
  intensityIndicator: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  intensityBar: {
    height: '100%',
    borderRadius: 3,
  },
  intensityLow: {
    backgroundColor: '#10B981',
  },
  intensityMedium: {
    backgroundColor: '#F59E0B',
  },
  intensityHigh: {
    backgroundColor: '#EF4444',
  },
  intensityLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  intensityLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  copingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copingButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginLeft: 6,
  },
  copingStrategiesContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  copingStrategyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  copingStrategyCardSelected: {
    borderColor: '#3D56F0',
    backgroundColor: '#EBF5FF',
  },
  copingStrategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  copingStrategyTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  copingStrategyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  copingStrategyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
  },
  copingStrategyTipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    paddingVertical: 12,
  },
  optionsScroll: {
    marginHorizontal: -4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  optionButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  optionButtonTextActive: {
    color: '#3D56F0',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outcomeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  outcomeButtonSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  outcomeButtonDanger: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  outcomeButtonIcon: {
    marginRight: 8,
  },
  outcomeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  outcomeButtonTextDanger: {
    color: '#EF4444',
  },
  outcomeButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 40,
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    paddingVertical: 16,
  },
}); 