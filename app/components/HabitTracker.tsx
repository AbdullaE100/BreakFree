import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Habit = {
  id: string;
  name: string;
  days: boolean[];
};

type HabitTrackerProps = {
  habits: Habit[];
  onToggleDay: (habitId: string, dayIndex: number) => void;
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HabitTracker = ({ habits, onToggleDay }: HabitTrackerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerEmpty} />
        {DAYS_OF_WEEK.map((day, index) => (
          <Text key={index} style={styles.headerDay}>
            {day}
          </Text>
        ))}
      </View>
      
      {habits.map((habit) => (
        <View key={habit.id} style={styles.habitRow}>
          <Text style={styles.habitName} numberOfLines={1}>
            {habit.name}
          </Text>
          
          {habit.days.map((isChecked, dayIndex) => (
            <TouchableOpacity
              key={dayIndex}
              style={[styles.habitCell, isChecked && styles.habitCellChecked]}
              onPress={() => onToggleDay(habit.id, dayIndex)}
            >
              {isChecked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  headerEmpty: {
    width: 100,
  },
  headerDay: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitName: {
    width: 100,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  habitCell: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  habitCellChecked: {
    backgroundColor: '#3D56F0',
    borderColor: '#3D56F0',
  },
});

export default HabitTracker; 