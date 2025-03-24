import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Brain, Shield, Zap, RefreshCw, Clock, ArrowRight, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  icon: React.ComponentType<any>;
  intensity: 'low' | 'medium' | 'high' | 'all';
}

interface UrgeCopingStrategiesProps {
  currentIntensity?: 'low' | 'medium' | 'high';
  onSelect?: (strategy: CopingStrategy) => void;
}

export default function UrgeCopingStrategies({ 
  currentIntensity, 
  onSelect 
}: UrgeCopingStrategiesProps) {
  const [selectedIntensity, setSelectedIntensity] = useState<'low' | 'medium' | 'high' | 'all'>(
    currentIntensity || 'all'
  );
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  
  // Define coping strategies
  const strategies: CopingStrategy[] = [
    {
      id: 'deep_breathing',
      title: 'Deep Breathing',
      description: 'Slow down your breathing to activate your body\'s relaxation response',
      icon: RefreshCw,
      intensity: 'all',
      steps: [
        'Find a comfortable position sitting or lying down',
        'Place one hand on your belly and one on your chest',
        'Breathe in slowly through your nose for 4 counts',
        'Hold for 1-2 counts',
        'Exhale slowly through your mouth for 6 counts',
        'Repeat 10 times, focusing on the sensation of breath'
      ]
    },
    {
      id: 'urge_surfing',
      title: 'Urge Surfing',
      description: 'Instead of fighting the urge, observe it like a wave that will eventually pass',
      icon: Zap,
      intensity: 'high',
      steps: [
        'Notice the urge without judging it',
        'Observe where you feel it in your body',
        'Acknowledge that urges are temporary sensations',
        'Visualize the urge as a wave that rises, peaks, and falls',
        'Stay with the feeling without acting on it',
        'Note when the intensity begins to subside'
      ]
    },
    {
      id: 'play_forward',
      title: 'Play the Tape Forward',
      description: 'Visualize the full consequences of giving in to the urge',
      icon: ArrowRight,
      intensity: 'medium',
      steps: [
        'Acknowledge the temporary relief giving in might provide',
        'Then visualize how you\'ll feel 1 hour later',
        'Visualize how you\'ll feel when you wake up tomorrow',
        'Consider the impact on your relationships and goals',
        'Imagine your future self thanking you for resisting',
        'Focus on the pride and strength you\'ll feel when you overcome'
      ]
    },
    {
      id: 'delay_tactic',
      title: 'Delay Tactic',
      description: 'Postpone the decision to act on the urge for a specified time period',
      icon: Clock,
      intensity: 'high',
      steps: [
        'Tell yourself "I\'ll wait just 10 minutes before deciding"',
        'Set a timer if it helps',
        'During this time, engage in another activity',
        'When the time is up, set another delay if needed',
        'Acknowledge that each delay is a victory',
        'Remember: urges typically last 20-30 minutes if not acted upon'
      ]
    },
    {
      id: 'distraction',
      title: 'Healthy Distraction',
      description: 'Redirect your attention to an engaging alternative activity',
      icon: RefreshCw,
      intensity: 'medium',
      steps: [
        'Choose an activity that requires focus and attention',
        'Physical activities like walking or exercise work best',
        'Call a supportive friend or family member',
        'Work on a hobby or project that you enjoy',
        'Use your senses: listen to music, take a shower, or eat a healthy snack',
        'Change your environment if possible'
      ]
    },
    {
      id: 'mindfulness',
      title: '5 Senses Mindfulness',
      description: 'Ground yourself in the present moment using your senses',
      icon: Brain,
      intensity: 'low',
      steps: [
        'Name 5 things you can see around you',
        'Name 4 things you can physically feel',
        'Name 3 things you can hear',
        'Name 2 things you can smell (or like the smell of)',
        'Name 1 thing you can taste (or like the taste of)',
        'Focus on these sensations to anchor yourself in the present'
      ]
    },
    {
      id: 'motivation_reminder',
      title: 'Motivation Reminder',
      description: 'Reconnect with your reasons for making a change',
      icon: Shield,
      intensity: 'low',
      steps: [
        'Read your personal motivation statement',
        'Look at photos of people you\'re doing this for',
        'Visualize achieving your goal',
        'Read supportive messages from loved ones',
        'Remember your progress so far',
        'Connect with your future self who has overcome this challenge'
      ]
    },
  ];
  
  // Filter strategies based on selected intensity
  const filteredStrategies = strategies.filter(
    strategy => selectedIntensity === 'all' || strategy.intensity === 'all' || strategy.intensity === selectedIntensity
  );
  
  // Handle selecting a strategy
  const handleSelectStrategy = (strategy: CopingStrategy) => {
    if (onSelect) {
      onSelect(strategy);
    }
    setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id);
  };
  
  // Get intensity color
  const getIntensityColor = (intensity: 'low' | 'medium' | 'high' | 'all') => {
    switch (intensity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'all': return '#3D56F0';
      default: return '#3D56F0';
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coping Strategies</Text>
      
      <View style={styles.intensityFilter}>
        <Pressable
          style={[
            styles.intensityButton,
            selectedIntensity === 'all' && styles.intensityButtonActive,
            selectedIntensity === 'all' && { backgroundColor: '#EBF5FF' }
          ]}
          onPress={() => setSelectedIntensity('all')}
        >
          <Text 
            style={[
              styles.intensityButtonText,
              selectedIntensity === 'all' && { color: '#3D56F0' }
            ]}
          >
            All
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.intensityButton,
            selectedIntensity === 'low' && styles.intensityButtonActive,
            selectedIntensity === 'low' && { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
          ]}
          onPress={() => setSelectedIntensity('low')}
        >
          <Text 
            style={[
              styles.intensityButtonText,
              selectedIntensity === 'low' && { color: '#10B981' }
            ]}
          >
            Low
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.intensityButton,
            selectedIntensity === 'medium' && styles.intensityButtonActive,
            selectedIntensity === 'medium' && { backgroundColor: 'rgba(245, 158, 11, 0.1)' }
          ]}
          onPress={() => setSelectedIntensity('medium')}
        >
          <Text 
            style={[
              styles.intensityButtonText,
              selectedIntensity === 'medium' && { color: '#F59E0B' }
            ]}
          >
            Medium
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.intensityButton,
            selectedIntensity === 'high' && styles.intensityButtonActive,
            selectedIntensity === 'high' && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
          ]}
          onPress={() => setSelectedIntensity('high')}
        >
          <Text 
            style={[
              styles.intensityButtonText,
              selectedIntensity === 'high' && { color: '#EF4444' }
            ]}
          >
            High
          </Text>
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={styles.strategiesContainer}>
        {filteredStrategies.map(strategy => {
          const Icon = strategy.icon;
          const isExpanded = expandedStrategy === strategy.id;
          const intensityColor = getIntensityColor(strategy.intensity);
          
          return (
            <Pressable
              key={strategy.id}
              style={[
                styles.strategyCard,
                isExpanded && styles.strategyCardExpanded
              ]}
              onPress={() => handleSelectStrategy(strategy)}
            >
              <View style={styles.strategyHeader}>
                <View style={styles.strategyTitleContainer}>
                  <View 
                    style={[
                      styles.strategyIcon, 
                      { backgroundColor: `${intensityColor}20` }
                    ]}
                  >
                    <Icon size={18} color={intensityColor} />
                  </View>
                  
                  <View style={styles.strategyTitleContent}>
                    <Text style={styles.strategyTitle}>{strategy.title}</Text>
                    
                    <View style={styles.intensityBadge}>
                      <View 
                        style={[
                          styles.intensityDot, 
                          { backgroundColor: intensityColor }
                        ]} 
                      />
                      <Text style={styles.intensityText}>
                        {strategy.intensity === 'all' ? 'All levels' : `${strategy.intensity.charAt(0).toUpperCase() + strategy.intensity.slice(1)} intensity`}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {onSelect && (
                  <Pressable 
                    style={styles.selectButton}
                    onPress={() => onSelect(strategy)}
                  >
                    <Check size={16} color="#3D56F0" />
                    <Text style={styles.selectButtonText}>Use</Text>
                  </Pressable>
                )}
              </View>
              
              <Text style={styles.strategyDescription}>{strategy.description}</Text>
              
              {isExpanded && strategy.steps && (
                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsTitle}>How to do it:</Text>
                  
                  {strategy.steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <Text style={styles.stepNumber}>{index + 1}.</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {!isExpanded && (
                <Text style={styles.expandPrompt}>
                  Tap to see step-by-step instructions
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  intensityFilter: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  intensityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  intensityButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  intensityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  strategiesContainer: {
    paddingBottom: 20,
  },
  strategyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  strategyCardExpanded: {
    borderWidth: 1,
    borderColor: '#3D56F020',
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  strategyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  strategyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  strategyTitleContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  intensityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginLeft: 4,
  },
  strategyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  expandPrompt: {
    fontSize: 12,
    fontFamily: 'Inter-Italic',
    color: '#6B7280',
    textAlign: 'center',
  },
  stepsContainer: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    width: 20,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
}); 