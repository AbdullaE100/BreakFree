import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, TouchableOpacity } from 'react-native';
import { Activity, MapPin, CornerDownRight, Shield, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function UrgeTrackerScreen() {
  // State management
  const [urgeIntensity, setUrgeIntensity] = useState<number>(5);
  const [location, setLocation] = useState<string>('');
  const [trigger, setTrigger] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [overcameUrge, setOvercameUrge] = useState<boolean | null>(null);
  
  // Common locations and triggers
  const commonLocations: LocationOption[] = [
    { id: 'home', label: 'Home' },
    { id: 'work', label: 'Work' },
    { id: 'bed', label: 'Bed' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'phone', label: 'On Phone' },
  ];
  
  const commonTriggers: TriggerOption[] = [
    { id: 'boredom', label: 'Boredom' },
    { id: 'stress', label: 'Stress' },
    { id: 'loneliness', label: 'Loneliness' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'social_media', label: 'Social Media' },
  ];
  
  // Handle saving the urge data
  const handleSave = () => {
    const urgeData = {
      intensity: urgeIntensity,
      location,
      trigger,
      notes,
      timestamp: new Date(),
      overcame: overcameUrge,
    };
    
    console.log('Saving urge data:', urgeData);
    // Here you would normally save to state management or API
    
    // Reset the form
    setUrgeIntensity(5);
    setLocation('');
    setTrigger('');
    setNotes('');
    setOvercameUrge(null);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Activity size={24} color="#3D56F0" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Track an Urge</Text>
      </View>
      
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
      
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <LinearGradient
          colors={['#3D56F0', '#5B73FF']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
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
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    paddingVertical: 16,
  },
}); 