import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { BookOpen, Filter, ChevronRight, Calendar, Heart, Brain, CheckCircle, AlertTriangle, Award, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { JournalEntry, getAllJournalEntries } from '../../lib/supabase';

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

type SortOption = 'date_desc' | 'date_asc' | 'mood_high' | 'mood_low';
type FilterType = 'all' | 'daily' | 'cbt' | 'gratitude' | 'milestone' | 'relapse_prevention';

export default function JournalEntryList() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [entries, setEntries] = useState<JournalEntryWithParsedContent[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntryWithParsedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Load journal entries
  useEffect(() => {
    if (user) {
      loadJournalEntries();
    }
  }, [user]);
  
  // Apply filters whenever entries, filter or sort changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [entries, selectedFilter, sortOption, selectedDate]);
  
  const loadJournalEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const journalEntries = await getAllJournalEntries(user.id);
      
      // Parse the content field which contains JSON
      const entriesWithParsedContent = journalEntries.map(entry => {
        try {
          let parsedContent;
          try {
            parsedContent = JSON.parse(entry.content);
          } catch (e) {
            // Handle old format where content is just text
            parsedContent = { text: entry.content };
          }
          
          return {
            ...entry,
            parsedContent
          };
        } catch (e) {
          console.error('Error parsing entry content:', e);
          return {
            ...entry,
            parsedContent: { text: entry.content || '' }
          };
        }
      });
      
      setEntries(entriesWithParsedContent);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFiltersAndSort = () => {
    let filtered = [...entries];
    
    // Apply date filter if selected
    if (selectedDate) {
      filtered = filtered.filter(entry => entry.date === selectedDate);
    }
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(entry => {
        const entryType = entry.entry_type || entry.parsedContent?.additional?.entry_type;
        return entryType === selectedFilter;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'mood_high':
          return b.mood - a.mood;
        case 'mood_low':
          return a.mood - b.mood;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    
    setFilteredEntries(filtered);
  };
  
  const getEntryTypeIcon = (type: string | undefined) => {
    switch(type) {
      case 'cbt': return <Brain size={18} color="#9333EA" />;
      case 'gratitude': return <Heart size={18} color="#F59E0B" />;
      case 'milestone': return <Award size={18} color="#10B981" />;
      case 'relapse_prevention': return <AlertTriangle size={18} color="#EF4444" />;
      default: return <CheckCircle size={18} color="#3B82F6" />;
    }
  };
  
  const getMoodColor = (mood: number) => {
    const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'];
    return colors[Math.min(Math.max(0, mood - 1), 4)];
  };
  
  const getEntryTypeLabel = (type: string | undefined) => {
    switch(type) {
      case 'cbt': return 'CBT Journal';
      case 'gratitude': return 'Gratitude';
      case 'milestone': return 'Milestone';
      case 'relapse_prevention': return 'Prevention Plan';
      default: return 'Daily Check-in';
    }
  };
  
  const getSortOptionLabel = (option: SortOption) => {
    switch(option) {
      case 'date_desc': return 'Newest First';
      case 'date_asc': return 'Oldest First';
      case 'mood_high': return 'Highest Mood';
      case 'mood_low': return 'Lowest Mood';
      default: return 'Sort by';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  const truncateContent = (content: string, maxLength = 100) => {
    if (!content) return '';
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };
  
  const viewEntry = (entry: JournalEntryWithParsedContent) => {
    router.push({
      pathname: '/(tabs)/journal',
      params: { date: entry.date }
    });
  };
  
  // Filter component
  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <Pressable
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <BookOpen size={16} color={selectedFilter === 'all' ? '#3D56F0' : '#6B7280'} />
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, selectedFilter === 'daily' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('daily')}
        >
          <CheckCircle size={16} color={selectedFilter === 'daily' ? '#3D56F0' : '#6B7280'} />
          <Text style={[styles.filterText, selectedFilter === 'daily' && styles.filterTextActive]}>Daily</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, selectedFilter === 'cbt' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('cbt')}
        >
          <Brain size={16} color={selectedFilter === 'cbt' ? '#3D56F0' : '#6B7280'} />
          <Text style={[styles.filterText, selectedFilter === 'cbt' && styles.filterTextActive]}>CBT</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, selectedFilter === 'gratitude' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('gratitude')}
        >
          <Heart size={16} color={selectedFilter === 'gratitude' ? '#3D56F0' : '#6B7280'} />
          <Text style={[styles.filterText, selectedFilter === 'gratitude' && styles.filterTextActive]}>Gratitude</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, selectedFilter === 'milestone' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('milestone')}
        >
          <Award size={16} color={selectedFilter === 'milestone' ? '#3D56F0' : '#6B7280'} />
          <Text style={[styles.filterText, selectedFilter === 'milestone' && styles.filterTextActive]}>Milestone</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, selectedFilter === 'relapse_prevention' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('relapse_prevention')}
        >
          <AlertTriangle size={16} color={selectedFilter === 'relapse_prevention' ? '#3D56F0' : '#6B7280'} />
          <Text style={[styles.filterText, selectedFilter === 'relapse_prevention' && styles.filterTextActive]}>Prevention</Text>
        </Pressable>
      </ScrollView>
      
      <View style={styles.sortSection}>
        <Pressable 
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Filter size={16} color="#6B7280" />
          <Text style={styles.sortText}>{getSortOptionLabel(sortOption)}</Text>
          {showSortOptions ? 
            <ArrowUp size={14} color="#6B7280" /> : 
            <ArrowDown size={14} color="#6B7280" />
          }
        </Pressable>
        
        {showSortOptions && (
          <View style={styles.sortDropdown}>
            <Pressable 
              style={styles.sortOption} 
              onPress={() => {
                setSortOption('date_desc');
                setShowSortOptions(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'date_desc' && styles.sortOptionActive]}>
                Newest First
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.sortOption} 
              onPress={() => {
                setSortOption('date_asc');
                setShowSortOptions(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'date_asc' && styles.sortOptionActive]}>
                Oldest First
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.sortOption} 
              onPress={() => {
                setSortOption('mood_high');
                setShowSortOptions(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'mood_high' && styles.sortOptionActive]}>
                Highest Mood
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.sortOption} 
              onPress={() => {
                setSortOption('mood_low');
                setShowSortOptions(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'mood_low' && styles.sortOptionActive]}>
                Lowest Mood
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
  
  // Entry card component
  const renderEntryCard = ({ item }: { item: JournalEntryWithParsedContent }) => {
    const entryType = item.entry_type || item.parsedContent?.additional?.entry_type || 'daily';
    const entryContent = item.parsedContent?.text || '';
    const emotions = item.parsedContent?.additional?.emotions || [];
    
    return (
      <Pressable 
        style={styles.entryCard}
        onPress={() => viewEntry(item)}
        android_ripple={{ color: '#F3F4F6' }}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryMeta}>
            {getEntryTypeIcon(entryType)}
            <Text style={styles.entryTypeText}>{getEntryTypeLabel(entryType)}</Text>
          </View>
          
          <View style={styles.entryDate}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.entryDateText}>{formatDate(item.date)}</Text>
          </View>
        </View>
        
        <View style={styles.entryContent}>
          <View style={styles.moodContainer}>
            <View 
              style={[
                styles.moodIndicator, 
                { backgroundColor: getMoodColor(item.mood) }
              ]} 
            />
            <Text style={styles.moodText}>
              Mood: {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][item.mood - 1]}
            </Text>
          </View>
          
          <Text style={styles.entryText}>{truncateContent(entryContent)}</Text>
          
          {emotions.length > 0 && (
            <View style={styles.emotionsContainer}>
              {emotions.slice(0, 3).map((emotion, index) => (
                <View key={index} style={styles.emotionTag}>
                  <Text style={styles.emotionText}>{emotion}</Text>
                </View>
              ))}
              {emotions.length > 3 && (
                <View style={styles.emotionTag}>
                  <Text style={styles.emotionText}>+{emotions.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.entryFooter}>
          <Text style={styles.viewDetailsText}>View details</Text>
          <ChevronRight size={16} color="#6B7280" />
        </View>
      </Pressable>
    );
  };
  
  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <BookOpen size={60} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No journal entries found</Text>
      <Text style={styles.emptyText}>
        {selectedFilter !== 'all'
          ? `You haven't created any ${getEntryTypeLabel(selectedFilter).toLowerCase()} entries yet.`
          : 'Start journaling to track your recovery journey'}
      </Text>
      <Pressable 
        style={styles.createButton}
        onPress={() => router.push('/(tabs)/journal')}
      >
        <LinearGradient
          colors={['#3D56F0', '#5E72EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.createButtonText}>Create Journal Entry</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
  
  // Insights section - summary of journal data
  const renderInsights = () => {
    if (entries.length === 0) return null;
    
    const totalEntries = entries.length;
    const averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries;
    const entryTypes = entries.reduce((acc, entry) => {
      const type = entry.entry_type || entry.parsedContent?.additional?.entry_type || 'daily';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get most frequently recorded emotions
    const allEmotions = entries.flatMap(entry => entry.parsedContent?.additional?.emotions || []);
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);
    
    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Insights</Text>
        
        <View style={styles.insightsGrid}>
          <View style={styles.insightCard}>
            <Text style={styles.insightValue}>{totalEntries}</Text>
            <Text style={styles.insightLabel}>Total Entries</Text>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightValue}>{averageMood.toFixed(1)}</Text>
            <Text style={styles.insightLabel}>Avg Mood</Text>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightValue}>
              {Object.keys(entryTypes).length}
            </Text>
            <Text style={styles.insightLabel}>Types Used</Text>
          </View>
        </View>
        
        {topEmotions.length > 0 && (
          <View style={styles.topEmotionsContainer}>
            <Text style={styles.topEmotionsTitle}>Top Recorded Emotions</Text>
            <View style={styles.topEmotionsGrid}>
              {topEmotions.map((emotion, index) => (
                <View key={index} style={styles.topEmotionTag}>
                  <Text style={styles.topEmotionText}>{emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderFilterBar()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D56F0" />
          <Text style={styles.loadingText}>Loading journal entries...</Text>
        </View>
      ) : (
        <>
          {renderInsights()}
          
          {filteredEntries.length > 0 ? (
            <FlatList
              data={filteredEntries}
              renderItem={renderEntryCard}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </View>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterScroll: {
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#3D56F0',
  },
  sortSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginHorizontal: 6,
  },
  sortDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    width: 160,
  },
  sortOption: {
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  sortOptionActive: {
    color: '#3D56F0',
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
    color: '#1F2937',
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  entryContent: {
    padding: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  moodText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  entryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 20,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  emotionTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  emotionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailsText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  insightsContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3D56F0',
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  topEmotionsContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6',
  },
  topEmotionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  topEmotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topEmotionTag: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  topEmotionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
}); 