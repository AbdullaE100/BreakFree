import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Zap, 
  Brain, 
  ArrowRight, 
  Filter, 
  Award, 
  AlertTriangle, 
  ChevronRight, 
  PieChart, 
  BookOpen, 
  Heart,
  ThumbsUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getAllUrges, 
  getUrgeStats, 
  getAllJournalEntries, 
  JournalEntry, 
  Urge 
} from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

// Chart data interface
interface ChartData {
  label: string;
  value: number;
  color: string;
}

// Time periods for analysis
type TimeRange = 'week' | 'month' | 'quarter' | 'year';

// Chart view types
type ChartViewType = 'urges' | 'mood' | 'triggers' | 'patterns';

// Correlation types
interface Correlation {
  title: string;
  description: string;
  confidence: number; // 0-100
  icon: React.ComponentType<any>;
  actionable: string;
}

export default function InsightsScreen() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [chartView, setChartView] = useState<ChartViewType>('urges');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Data states
  const [urges, setUrges] = useState<Urge[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [urgeStats, setUrgeStats] = useState<any>(null);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  
  // Fetch data on component mount and when time range changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, timeRange]);
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Define date range based on selected time range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Format dates for API calls
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      // Fetch all required data
      const [urgesData, journalData, statsData] = await Promise.all([
        getAllUrges(user.id),
        getAllJournalEntries(user.id),
        getUrgeStats(user.id)
      ]);
      
      // Filter by date range
      const filteredUrges = urgesData.filter(urge => {
        const urgeDate = new Date(urge.created_at);
        return urgeDate >= startDate && urgeDate <= endDate;
      });
      
      const filteredJournals = journalData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      setUrges(filteredUrges);
      setJournalEntries(filteredJournals);
      setUrgeStats(statsData);
      
      // Generate correlations and insights
      setCorrelations(generateCorrelations(filteredUrges, filteredJournals));
    } catch (error) {
      console.error('Error loading insights data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate useful correlations between data points
  const generateCorrelations = (urges: Urge[], journals: JournalEntry[]): Correlation[] => {
    const correlations: Correlation[] = [];
    
    // Nothing to analyze yet
    if (urges.length === 0 && journals.length === 0) {
      return [];
    }
    
    // Time-of-day pattern for urges
    if (urges.length >= 3) {
      const hourCounts: Record<number, number> = {};
      urges.forEach(urge => {
        const date = new Date(urge.created_at);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const maxHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      const hourNum = parseInt(maxHour[0]);
      let timeFrame: string;
      
      if (hourNum >= 5 && hourNum < 12) {
        timeFrame = 'morning (5am-12pm)';
      } else if (hourNum >= 12 && hourNum < 17) {
        timeFrame = 'afternoon (12pm-5pm)';
      } else if (hourNum >= 17 && hourNum < 21) {
        timeFrame = 'evening (5pm-9pm)';
      } else {
        timeFrame = 'night (9pm-5am)';
      }
      
      correlations.push({
        title: `${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Vulnerability`,
        description: `${Math.round((maxHour[1] / urges.length) * 100)}% of your urges occur during the ${timeFrame}`,
        confidence: Math.min(urges.length * 5, 90),
        icon: Clock,
        actionable: `Create a prevention plan specifically for the ${timeFrame}`,
      });
    }
    
    // More correlations will be added here...
    
    return correlations;
  };
  
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
  
  // Prepare chart data for urges over time
  const getUrgeChartData = useMemo(() => {
    if (urges.length === 0) return [];
    
    // Determine time interval based on selected range
    let format: 'day' | 'week' | 'month' = 'day';
    if (timeRange === 'quarter' || timeRange === 'year') {
      format = 'week';
    }
    
    // Create a map of dates to urge counts
    const dateMap: Record<string, { count: number, overcome: number, intensity: number }> = {};
    
    urges.forEach(urge => {
      const date = new Date(urge.created_at);
      let key = '';
      
      if (format === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (format === 'week') {
        // Get the week number
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      
      if (!dateMap[key]) {
        dateMap[key] = { count: 0, overcome: 0, intensity: 0 };
      }
      
      dateMap[key].count += 1;
      if (urge.overcome) dateMap[key].overcome += 1;
      dateMap[key].intensity += urge.intensity;
    });
    
    // Convert to chart data
    const chartData: ChartData[] = [];
    
    Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0])).forEach(([date, data]) => {
      const avgIntensity = data.intensity / data.count;
      let label = date;
      
      if (format === 'day') {
        const d = new Date(date);
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (format === 'week') {
        const d = new Date(date);
        label = `W${Math.ceil((d.getDate() + d.getDay()) / 7)}`;
      } else {
        const [year, month] = date.split('-');
        label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
      }
      
      chartData.push({
        label,
        value: data.count,
        color: avgIntensity > 7 ? '#EF4444' : (avgIntensity > 5 ? '#F59E0B' : '#3B82F6')
      });
    });
    
    return chartData;
  }, [urges, timeRange]);
  
  // Prepare mood chart data
  const getMoodChartData = useMemo(() => {
    if (journalEntries.length === 0) return [];
    
    // Determine time interval based on selected range
    let format: 'day' | 'week' | 'month' = 'day';
    if (timeRange === 'quarter' || timeRange === 'year') {
      format = 'week';
    }
    
    // Create a map of dates to average mood
    const dateMap: Record<string, { total: number, count: number }> = {};
    
    journalEntries.forEach(entry => {
      const date = new Date(entry.date);
      let key = '';
      
      if (format === 'day') {
        key = entry.date;
      } else if (format === 'week') {
        // Get the week number
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      
      if (!dateMap[key]) {
        dateMap[key] = { total: 0, count: 0 };
      }
      
      dateMap[key].total += entry.mood;
      dateMap[key].count += 1;
    });
    
    // Convert to chart data
    const chartData: ChartData[] = [];
    
    Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0])).forEach(([date, data]) => {
      const avgMood = data.total / data.count;
      let label = date;
      
      if (format === 'day') {
        const d = new Date(date);
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (format === 'week') {
        const d = new Date(date);
        label = `W${Math.ceil((d.getDate() + d.getDay()) / 7)}`;
      } else {
        const [year, month] = date.split('-');
        label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
      }
      
      let color = '#F87171'; // Difficult/Bad
      if (avgMood >= 4) {
        color = '#10B981'; // Excellent
      } else if (avgMood >= 3) {
        color = '#3B82F6'; // Good
      } else if (avgMood >= 2) {
        color = '#F59E0B'; // Neutral
      }
      
      chartData.push({
        label,
        value: avgMood,
        color
      });
    });
    
    return chartData;
  }, [journalEntries, timeRange]);
  
  // Get trigger analysis data
  const getTriggerData = useMemo(() => {
    if (urges.length === 0) return [];
    
    const triggerCounts: Record<string, number> = {};
    urges.forEach(urge => {
      if (urge.trigger) {
        triggerCounts[urge.trigger] = (triggerCounts[urge.trigger] || 0) + 1;
      }
    });
    
    return Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger, count]) => ({
        name: trigger,
        count,
        percentage: Math.round((count / urges.length) * 100)
      }));
  }, [urges]);
  
  // Get progress metrics for the selected time period
  const getProgressMetrics = useMemo(() => {
    // Default values
    const metrics = {
      urgesTotal: 0,
      overcomePct: 0,
      avgMood: 0,
      journalCount: journalEntries.length,
      streakProgress: 0,
      strongestTrigger: '',
      mostFrequentTime: '',
      highestRiskDay: ''
    };
    
    if (urges.length > 0) {
      metrics.urgesTotal = urges.length;
      const overcomeCount = urges.filter(u => u.overcome).length;
      metrics.overcomePct = Math.round((overcomeCount / urges.length) * 100);
      
      // Most common trigger
      const triggerCounts: Record<string, number> = {};
      urges.forEach(urge => {
        if (urge.trigger) {
          triggerCounts[urge.trigger] = (triggerCounts[urge.trigger] || 0) + 1;
        }
      });
      
      const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
      if (sortedTriggers.length > 0) {
        metrics.strongestTrigger = sortedTriggers[0][0];
      }
      
      // Most common time of day for urges
      const hourCounts: Record<number, number> = {};
      urges.forEach(urge => {
        const date = new Date(urge.created_at);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const maxHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
      if (maxHour) {
        const hour = parseInt(maxHour[0]);
        metrics.mostFrequentTime = new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      }
      
      // Highest risk day
      const dayCounts: Record<number, number> = {};
      urges.forEach(urge => {
        const date = new Date(urge.created_at);
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      
      const maxDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
      if (maxDay) {
        const day = parseInt(maxDay[0]);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        metrics.highestRiskDay = days[day];
      }
    }
    
    if (journalEntries.length > 0) {
      const totalMood = journalEntries.reduce((sum, entry) => sum + entry.mood, 0);
      metrics.avgMood = Math.round((totalMood / journalEntries.length) * 10) / 10;
    }
    
    return metrics;
  }, [urges, journalEntries]);
  
  // UI rendering functions
  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('week')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'week' && styles.timeRangeTextActive]}>
          Week
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('month')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'month' && styles.timeRangeTextActive]}>
          Month
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'quarter' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('quarter')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'quarter' && styles.timeRangeTextActive]}>
          3 Months
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.timeRangeButton, timeRange === 'year' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('year')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'year' && styles.timeRangeTextActive]}>
          Year
        </Text>
      </Pressable>
    </View>
  );
  
  const renderChartViewSelector = () => (
    <View style={styles.chartViewContainer}>
      <Pressable 
        style={[styles.chartViewTab, chartView === 'urges' && styles.chartViewTabActive]}
        onPress={() => setChartView('urges')}
      >
        <TrendingUp size={16} color={chartView === 'urges' ? '#3D56F0' : '#6B7280'} />
        <Text style={[styles.chartViewText, chartView === 'urges' && styles.chartViewTextActive]}>
          Urges
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.chartViewTab, chartView === 'mood' && styles.chartViewTabActive]}
        onPress={() => setChartView('mood')}
      >
        <Brain size={16} color={chartView === 'mood' ? '#3D56F0' : '#6B7280'} />
        <Text style={[styles.chartViewText, chartView === 'mood' && styles.chartViewTextActive]}>
          Mood
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.chartViewTab, chartView === 'triggers' && styles.chartViewTabActive]}
        onPress={() => setChartView('triggers')}
      >
        <AlertTriangle size={16} color={chartView === 'triggers' ? '#3D56F0' : '#6B7280'} />
        <Text style={[styles.chartViewText, chartView === 'triggers' && styles.chartViewTextActive]}>
          Triggers
        </Text>
      </Pressable>
      
      <Pressable 
        style={[styles.chartViewTab, chartView === 'patterns' && styles.chartViewTabActive]}
        onPress={() => setChartView('patterns')}
      >
        <PieChart size={16} color={chartView === 'patterns' ? '#3D56F0' : '#6B7280'} />
        <Text style={[styles.chartViewText, chartView === 'patterns' && styles.chartViewTextActive]}>
          Patterns
        </Text>
      </Pressable>
    </View>
  );
  
  const renderUrgeChart = () => {
    const data = getUrgeChartData;
    const maxValue = Math.max(...data.map(item => item.value), 1);
    
    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <TrendingUp size={20} color="#3D56F0" />
            <Text style={styles.chartTitle}>Urge Frequency</Text>
          </View>
          
          {urges.length > 0 && (
            <View style={styles.chartMetric}>
              <Text style={styles.chartMetricValue}>
                {getProgressMetrics.overcomePct}%
              </Text>
              <Text style={styles.chartMetricLabel}>
                Overcome
              </Text>
            </View>
          )}
        </View>
        
        {urges.length === 0 ? (
          <View style={styles.emptyChartContainer}>
            <Text style={styles.emptyChartText}>
              No urge data available for this time period
            </Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.yAxisLabel}>
                  {Math.round(maxValue - (i * (maxValue / 4)))}
                </Text>
              ))}
            </View>
            
            <View style={styles.chartContent}>
              <View style={styles.gridLines}>
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={styles.gridLine} />
                ))}
              </View>
              
              <View style={styles.barContainer}>
                {data.map((item, index) => (
                  <View key={index} style={styles.barGroup}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${(item.value / maxValue) * 100}%`,
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
        )}
        
        <View style={styles.chartFooter}>
          <Text style={styles.chartFooterText}>
            {urges.length > 0 
              ? `${urges.length} urge${urges.length !== 1 ? 's' : ''} recorded` 
              : 'Track urges to see insights'}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderMoodChart = () => {
    const data = getMoodChartData;
    const maxValue = 5; // Max mood rating
    
    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Brain size={20} color="#3D56F0" />
            <Text style={styles.chartTitle}>Mood Tracking</Text>
          </View>
          
          {journalEntries.length > 0 && (
            <View style={styles.chartMetric}>
              <Text style={styles.chartMetricValue}>
                {getProgressMetrics.avgMood}
              </Text>
              <Text style={styles.chartMetricLabel}>
                Avg. Mood
              </Text>
            </View>
          )}
        </View>
        
        {journalEntries.length === 0 ? (
          <View style={styles.emptyChartContainer}>
            <Text style={styles.emptyChartText}>
              No mood data available for this time period
            </Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              {[...Array(maxValue + 1)].map((_, i) => (
                <Text key={i} style={styles.yAxisLabel}>
                  {maxValue - i}
                </Text>
              ))}
            </View>
            
            <View style={styles.chartContent}>
              <View style={styles.gridLines}>
                {[...Array(maxValue + 1)].map((_, i) => (
                  <View key={i} style={styles.gridLine} />
                ))}
              </View>
              
              <View style={styles.barContainer}>
                {data.map((item, index) => (
                  <View key={index} style={styles.barGroup}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${(item.value / maxValue) * 100}%`,
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
        )}
        
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
  };
  
  const renderTriggers = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <AlertTriangle size={20} color="#3D56F0" />
          <Text style={styles.chartTitle}>Common Triggers</Text>
        </View>
      </View>
      
      {getTriggerData.length === 0 ? (
        <View style={styles.emptyChartContainer}>
          <Text style={styles.emptyChartText}>
            No trigger data available for this time period
          </Text>
        </View>
      ) : (
        <>
          {getTriggerData.map((trigger, index) => (
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
          
          <View style={styles.triggerAdvice}>
            <Text style={styles.triggerAdviceText}>
              Your top trigger is <Text style={styles.triggerAdviceHighlight}>{getTriggerData[0]?.name}</Text>. 
              Consider creating a specific prevention plan for this trigger.
            </Text>
          </View>
        </>
      )}
    </View>
  );
  
  const renderProgressMetrics = () => {
    const metrics = getProgressMetrics;
    
    return (
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>
          {timeRange === 'week' ? 'This Week' : (timeRange === 'month' ? 'This Month' : 'This Period')}
        </Text>
        
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{metrics.urgesTotal}</Text>
            <Text style={styles.progressLabel}>Total Urges</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{metrics.overcomePct}%</Text>
            <Text style={styles.progressLabel}>Urges Overcome</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{metrics.avgMood || '-'}</Text>
            <Text style={styles.progressLabel}>Avg. Mood</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{metrics.journalCount}</Text>
            <Text style={styles.progressLabel}>Journal Entries</Text>
          </View>
        </View>
        
        {(metrics.urgesTotal > 0 || metrics.journalCount > 0) && (
          <View style={styles.keyInsightsContainer}>
            <Text style={styles.keyInsightsTitle}>Key Insights</Text>
            
            {metrics.strongestTrigger && (
              <View style={styles.keyInsightItem}>
                <AlertTriangle size={16} color="#F59E0B" style={styles.keyInsightIcon} />
                <Text style={styles.keyInsightText}>
                  <Text style={styles.keyInsightHighlight}>{metrics.strongestTrigger}</Text> is your most common trigger
                </Text>
              </View>
            )}
            
            {metrics.mostFrequentTime && (
              <View style={styles.keyInsightItem}>
                <Clock size={16} color="#3B82F6" style={styles.keyInsightIcon} />
                <Text style={styles.keyInsightText}>
                  Most urges occur around <Text style={styles.keyInsightHighlight}>{metrics.mostFrequentTime}</Text>
                </Text>
              </View>
            )}
            
            {metrics.highestRiskDay && (
              <View style={styles.keyInsightItem}>
                <Calendar size={16} color="#EF4444" style={styles.keyInsightIcon} />
                <Text style={styles.keyInsightText}>
                  <Text style={styles.keyInsightHighlight}>{metrics.highestRiskDay}</Text> is your highest risk day
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };
  
  const renderCorrelations = () => (
    <View style={styles.patternsContainer}>
      <Text style={styles.sectionTitle}>Patterns We've Noticed</Text>
      
      {correlations.length === 0 ? (
        <View style={styles.emptyPatternsContainer}>
          <Text style={styles.emptyPatternsText}>
            Not enough data to identify patterns yet. Continue tracking to unlock insights.
          </Text>
        </View>
      ) : (
        correlations.map((pattern, index) => {
          const Icon = pattern.icon;
          
          return (
            <View key={index} style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <View style={styles.patternIconContainer}>
                  <Icon size={20} color="#3D56F0" />
                </View>
                
                <View style={styles.patternTitleContainer}>
                  <Text style={styles.patternTitle}>{pattern.title}</Text>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence:</Text>
                    <View style={styles.confidenceMeter}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${pattern.confidence}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </View>
              
              <Text style={styles.patternDescription}>{pattern.description}</Text>
              
              <View style={styles.patternActionable}>
                <Text style={styles.patternActionableLabel}>Try This:</Text>
                <Text style={styles.patternActionableText}>{pattern.actionable}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
  
  const renderMainContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D56F0" />
          <Text style={styles.loadingText}>Analyzing your data...</Text>
        </View>
      );
    }
    
    return (
      <>
        {renderChartViewSelector()}
        
        {chartView === 'urges' && renderUrgeChart()}
        {chartView === 'mood' && renderMoodChart()}
        {chartView === 'triggers' && renderTriggers()}
        {(chartView === 'patterns' && correlations.length > 0) && renderCorrelations()}
        
        {renderProgressMetrics()}
        
        {(chartView !== 'patterns' || correlations.length === 0) && renderCorrelations()}
        
        <View style={styles.explainerCard}>
          <Text style={styles.explainerTitle}>How We Generate Insights</Text>
          <Text style={styles.explainerText}>
            We analyze your journal entries, mood patterns, and urge tracking data to identify meaningful correlations. 
            The more consistently you track, the more powerful and personalized these insights become.
          </Text>
        </View>
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Understand your patterns and progress</Text>
        </View>
        
        {renderTimeRangeSelector()}
        
        {renderMainContent()}
        
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    fontWeight: '500',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  chartViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartViewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  chartViewTabActive: {
    borderBottomColor: '#3D56F0',
  },
  chartViewText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  chartViewTextActive: {
    color: '#3D56F0',
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  chartMetric: {
    alignItems: 'flex-end',
  },
  chartMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D56F0',
  },
  chartMetricLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    marginBottom: 8,
  },
  emptyChartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  emptyChartText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  yAxisLabels: {
    width: 24,
    height: '100%',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 10,
    fontWeight: '400',
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
    paddingHorizontal: 2,
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  chartFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  chartFooterText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
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
    fontWeight: '400',
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '500',
    color: '#4B5563',
  },
  triggerCount: {
    fontSize: 12,
    fontWeight: '400',
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
  triggerAdvice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F8FF',
    borderRadius: 8,
  },
  triggerAdviceText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
  },
  triggerAdviceHighlight: {
    fontWeight: '600',
    color: '#3D56F0',
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
    fontWeight: '700',
    color: '#3D56F0',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  keyInsightsContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  keyInsightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  keyInsightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyInsightIcon: {
    marginRight: 8,
  },
  keyInsightText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    flex: 1,
  },
  keyInsightHighlight: {
    fontWeight: '600',
    color: '#1F2937',
  },
  patternsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  emptyPatternsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  emptyPatternsText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
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
  patternTitleContainer: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    marginRight: 8,
  },
  confidenceMeter: {
    flex: 1,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#3D56F0',
    borderRadius: 2,
  },
  patternDescription: {
    fontSize: 14,
    fontWeight: '400',
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
    fontWeight: '500',
    color: '#3D56F0',
    marginBottom: 4,
  },
  patternActionableText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
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
    fontWeight: '600',
    color: '#3D56F0',
    marginBottom: 8,
  },
  explainerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
  },
  loadingContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
  },
  spacer: {
    height: 40,
  },
}); 