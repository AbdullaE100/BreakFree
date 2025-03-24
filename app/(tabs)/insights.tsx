import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { BarChart2, TrendingUp, Clock, Calendar, Zap, Brain, ArrowRight, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function InsightsScreen() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  
  // Mock data
  const urgeData: ChartData[] = [
    { label: 'Mon', value: 2, color: '#EF4444' },
    { label: 'Tue', value: 1, color: '#EF4444' },
    { label: 'Wed', value: 0, color: '#EF4444' },
    { label: 'Thu', value: 3, color: '#EF4444' },
    { label: 'Fri', value: 0, color: '#EF4444' },
    { label: 'Sat', value: 0, color: '#EF4444' },
    { label: 'Sun', value: 1, color: '#EF4444' },
  ];
  
  const moodData: ChartData[] = [
    { label: 'Mon', value: 2, color: '#F59E0B' },
    { label: 'Tue', value: 3, color: '#F59E0B' },
    { label: 'Wed', value: 4, color: '#3B82F6' },
    { label: 'Thu', value: 2, color: '#F59E0B' },
    { label: 'Fri', value: 3, color: '#F59E0B' },
    { label: 'Sat', value: 4, color: '#3B82F6' },
    { label: 'Sun', value: 5, color: '#10B981' },
  ];
  
  const triggers = [
    { name: 'Boredom', count: 8, percentage: 32 },
    { name: 'Stress', count: 6, percentage: 24 },
    { name: 'Fatigue', count: 5, percentage: 20 },
    { name: 'Social Media', count: 4, percentage: 16 },
    { name: 'Loneliness', count: 2, percentage: 8 },
  ];
  
  const weeklyProgress = {
    urgesTotal: 7,
    urgesOvercomePercentage: 85,
    averageMood: 3.4,
    journalEntries: 5,
    toolsUsed: 12,
  };
  
  const patterns = [
    {
      title: 'Morning Vulnerability',
      description: 'Urges are 75% more likely to occur between 6-9am',
      icon: Clock,
      actionable: 'Create a solid morning routine',
    },
    {
      title: 'Weekend Success',
      description: 'Your mood consistently improves on weekends',
      icon: Calendar,
      actionable: 'Identify what weekend activities help you',
    },
    {
      title: 'Exercise Correlation',
      description: 'Days with exercise show 62% fewer urges',
      icon: Zap,
      actionable: 'Try to maintain consistent exercise',
    },
  ];
  
  const maxUrgeValue = Math.max(...urgeData.map(item => item.value));
  const maxMoodValue = 5; // Set to 5 as it's our max rating
  
  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('week')}
      >
        <Text 
          style={[styles.timeRangeText, timeRange === 'week' && styles.timeRangeTextActive]}
        >
          Week
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('month')}
      >
        <Text 
          style={[styles.timeRangeText, timeRange === 'month' && styles.timeRangeTextActive]}
        >
          Month
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'quarter' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('quarter')}
      >
        <Text 
          style={[styles.timeRangeText, timeRange === 'quarter' && styles.timeRangeTextActive]}
        >
          3 Months
        </Text>
      </Pressable>
    </View>
  );
  
  const renderUrgeChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <TrendingUp size={20} color="#3D56F0" />
          <Text style={styles.chartTitle}>Urge Frequency</Text>
        </View>
        
        <Pressable style={styles.filterButton}>
          <Filter size={16} color="#6B7280" />
        </Pressable>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          {[...Array(maxUrgeValue + 1)].map((_, i) => (
            <Text key={i} style={styles.yAxisLabel}>
              {maxUrgeValue - i}
            </Text>
          ))}
        </View>
        
        <View style={styles.chartContent}>
          <View style={styles.gridLines}>
            {[...Array(maxUrgeValue + 1)].map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          
          <View style={styles.barContainer}>
            {urgeData.map((item, index) => (
              <View key={index} style={styles.barGroup}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${(item.value / maxUrgeValue) * 100}%`,
                      backgroundColor: item.value > 0 ? item.color : 'transparent' 
                    }
                  ]}
                />
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderMoodChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <Brain size={20} color="#3D56F0" />
          <Text style={styles.chartTitle}>Mood Tracking</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          {[...Array(maxMoodValue + 1)].map((_, i) => (
            <Text key={i} style={styles.yAxisLabel}>
              {maxMoodValue - i}
            </Text>
          ))}
        </View>
        
        <View style={styles.chartContent}>
          <View style={styles.gridLines}>
            {[...Array(maxMoodValue + 1)].map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          
          <View style={styles.barContainer}>
            {moodData.map((item, index) => (
              <View key={index} style={styles.barGroup}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${(item.value / maxMoodValue) * 100}%`,
                      backgroundColor: item.color 
                    }
                  ]}
                />
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.moodLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Excellent</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Good</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Neutral</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F87171' }]} />
          <Text style={styles.legendText}>Difficult</Text>
        </View>
      </View>
    </View>
  );
  
  const renderTriggers = () => (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>Common Triggers</Text>
      
      {triggers.map((trigger, index) => (
        <View key={index} style={styles.triggerItem}>
          <View style={styles.triggerInfo}>
            <Text style={styles.triggerName}>{trigger.name}</Text>
            <Text style={styles.triggerCount}>{trigger.count} times</Text>
          </View>
          
          <View style={styles.triggerBarContainer}>
            <View 
              style={[
                styles.triggerBar, 
                { width: `${trigger.percentage}%` }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );
  
  const renderWeeklyProgress = () => (
    <View style={styles.progressCard}>
      <Text style={styles.sectionTitle}>This Week's Progress</Text>
      
      <View style={styles.progressGrid}>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{weeklyProgress.urgesTotal}</Text>
          <Text style={styles.progressLabel}>Total Urges</Text>
        </View>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{weeklyProgress.urgesOvercomePercentage}%</Text>
          <Text style={styles.progressLabel}>Urges Overcome</Text>
        </View>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{weeklyProgress.averageMood}</Text>
          <Text style={styles.progressLabel}>Avg. Mood</Text>
        </View>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{weeklyProgress.journalEntries}</Text>
          <Text style={styles.progressLabel}>Journal Entries</Text>
        </View>
      </View>
    </View>
  );
  
  const renderPatterns = () => (
    <View style={styles.patternsContainer}>
      <Text style={styles.sectionTitle}>Patterns We've Noticed</Text>
      
      {patterns.map((pattern, index) => {
        const Icon = pattern.icon;
        
        return (
          <View key={index} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <View style={styles.patternIconContainer}>
                <Icon size={20} color="#3D56F0" />
              </View>
              
              <Text style={styles.patternTitle}>{pattern.title}</Text>
            </View>
            
            <Text style={styles.patternDescription}>{pattern.description}</Text>
            
            <View style={styles.patternActionable}>
              <Text style={styles.patternActionableLabel}>Try This:</Text>
              <Text style={styles.patternActionableText}>{pattern.actionable}</Text>
            </View>
            
            <Pressable style={styles.patternDetailsButton}>
              <Text style={styles.patternDetailsText}>View Details</Text>
              <ArrowRight size={16} color="#3D56F0" />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Understand your patterns and progress</Text>
      </View>
      
      {renderTimeRangeSelector()}
      {renderUrgeChart()}
      {renderMoodChart()}
      {renderWeeklyProgress()}
      {renderTriggers()}
      {renderPatterns()}
      
      <View style={styles.explainerCard}>
        <Text style={styles.explainerTitle}>How We Generate Insights</Text>
        <Text style={styles.explainerText}>
          We analyze your journal entries, mood patterns, and urge tracking data to identify meaningful patterns and correlations. The more data you provide, the more accurate and helpful these insights become.
        </Text>
      </View>
      
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#3D56F0',
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
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
  progressCard: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    marginBottom: 8,
  },
  yAxisLabels: {
    width: 20,
    height: '100%',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  chartContent: {
    flex: 1,
    marginLeft: 8,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barGroup: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  moodLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  triggerItem: {
    marginBottom: 12,
  },
  triggerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  triggerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  triggerCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  triggerBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  triggerBar: {
    height: '100%',
    backgroundColor: '#3D56F0',
    borderRadius: 4,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  progressItem: {
    width: '50%',
    padding: 8,
  },
  progressValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3D56F0',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  patternsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  patternCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patternTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  patternDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  patternActionable: {
    backgroundColor: '#F3F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  patternActionableLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginBottom: 4,
  },
  patternActionableText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  patternDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  patternDetailsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  explainerCard: {
    backgroundColor: '#F3F8FF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3D56F0',
  },
  explainerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
    marginBottom: 8,
  },
  explainerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
}); 