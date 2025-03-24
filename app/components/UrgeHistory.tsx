import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Calendar, BarChart3, ArrowUp, ArrowDown, Filter, Clock, MapPin, CornerDownRight, Check, X, Info } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Urge } from '../../lib/supabase';

type FilterType = 'all' | 'overcome' | 'relapsed';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

interface UrgeHistoryProps {
  urges: Urge[];
  loading: boolean;
  onSelectUrge?: (urge: Urge) => void;
}

export default function UrgeHistory({ urges, loading, onSelectUrge }: UrgeHistoryProps) {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filteredUrges, setFilteredUrges] = useState<Urge[]>([]);
  
  // Process and filter urges
  useEffect(() => {
    if (!urges) return;
    
    let filtered = [...urges];
    
    // Apply filters
    if (filterType === 'overcome') {
      filtered = filtered.filter(urge => urge.overcome);
    } else if (filterType === 'relapsed') {
      filtered = filtered.filter(urge => !urge.overcome);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      switch (sortOption) {
        case 'newest':
          return dateB.getTime() - dateA.getTime();
        case 'oldest':
          return dateA.getTime() - dateB.getTime();
        case 'highest':
          return b.intensity - a.intensity;
        case 'lowest':
          return a.intensity - b.intensity;
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });
    
    setFilteredUrges(filtered);
  }, [urges, filterType, sortOption]);
  
  // Calculate statistics
  const totalUrges = urges?.length || 0;
  const urgesOvercome = urges?.filter(u => u.overcome).length || 0;
  const successRate = totalUrges > 0 ? Math.round((urgesOvercome / totalUrges) * 100) : 0;
  
  // Calculate average intensity
  const avgIntensity = totalUrges > 0 
    ? (urges?.reduce((sum, urge) => sum + urge.intensity, 0) || 0) / totalUrges 
    : 0;
  
  // Get most common trigger
  const triggerCounts: Record<string, number> = {};
  urges?.forEach(urge => {
    if (urge.trigger) {
      triggerCounts[urge.trigger] = (triggerCounts[urge.trigger] || 0) + 1;
    }
  });
  
  let mostCommonTrigger = 'Not enough data';
  let highestCount = 0;
  
  Object.entries(triggerCounts).forEach(([trigger, count]) => {
    if (count > highestCount) {
      mostCommonTrigger = trigger;
      highestCount = count;
    }
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get color based on intensity
  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return '#10B981'; // Low - green
    if (intensity <= 7) return '#F59E0B'; // Medium - amber
    return '#EF4444'; // High - red
  };
  
  const renderUrgeItem = ({ item }: { item: Urge }) => (
    <Pressable 
      style={styles.urgeCard}
      onPress={() => onSelectUrge && onSelectUrge(item)}
    >
      <View style={styles.urgeHeader}>
        <View style={styles.urgeDate}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.urgeDateText}>{formatDate(item.created_at)}</Text>
        </View>
        
        <View style={[
          styles.urgeOutcomeBadge, 
          item.overcome ? styles.urgeOutcomeSuccess : styles.urgeOutcomeFailure
        ]}>
          {item.overcome ? (
            <Check size={12} color="#FFFFFF" />
          ) : (
            <X size={12} color="#FFFFFF" />
          )}
          <Text style={styles.urgeOutcomeText}>
            {item.overcome ? 'Overcome' : 'Relapsed'}
          </Text>
        </View>
      </View>
      
      <View style={styles.urgeContent}>
        <View style={styles.urgeIntensity}>
          <Text style={styles.urgeIntensityLabel}>Intensity</Text>
          <View style={styles.urgeIntensityValue}>
            <View style={[
              styles.urgeIntensityDot, 
              { backgroundColor: getIntensityColor(item.intensity) }
            ]} />
            <Text style={styles.urgeIntensityNumber}>{item.intensity}/10</Text>
          </View>
        </View>
        
        {item.trigger && (
          <View style={styles.urgeDetail}>
            <CornerDownRight size={14} color="#6B7280" style={styles.urgeDetailIcon} />
            <Text style={styles.urgeDetailText}>{item.trigger}</Text>
          </View>
        )}
        
        {item.location && (
          <View style={styles.urgeDetail}>
            <MapPin size={14} color="#6B7280" style={styles.urgeDetailIcon} />
            <Text style={styles.urgeDetailText}>{item.location}</Text>
          </View>
        )}
      </View>
      
      {item.notes && (
        <Text style={styles.urgeNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </Pressable>
  );
  
  const renderFilterButton = (type: FilterType, label: string) => (
    <Pressable
      style={[styles.filterButton, filterType === type && styles.filterButtonActive]}
      onPress={() => setFilterType(type)}
    >
      <Text 
        style={[
          styles.filterButtonText, 
          filterType === type && styles.filterButtonTextActive
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
  
  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D56F0" />
        <Text style={styles.loadingText}>Loading urge history...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {totalUrges > 0 ? (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalUrges}</Text>
              <Text style={styles.statLabel}>Total Urges</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgIntensity.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Intensity</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Info size={16} color="#3D56F0" />
            <Text style={styles.insightText}>
              Most common trigger: <Text style={styles.insightHighlight}>{mostCommonTrigger}</Text>
            </Text>
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              {renderFilterButton('all', 'All')}
              {renderFilterButton('overcome', 'Overcome')}
              {renderFilterButton('relapsed', 'Relapsed')}
            </View>
            
            <Pressable 
              style={styles.sortButton}
              onPress={() => {
                const options: SortOption[] = ['newest', 'oldest', 'highest', 'lowest'];
                const currentIndex = options.indexOf(sortOption);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortOption(options[nextIndex]);
              }}
            >
              {sortOption === 'newest' || sortOption === 'oldest' ? (
                <Calendar size={16} color="#6B7280" />
              ) : (
                <BarChart3 size={16} color="#6B7280" />
              )}
              
              <Text style={styles.sortButtonText}>
                {sortOption === 'newest' && 'Newest'}
                {sortOption === 'oldest' && 'Oldest'}
                {sortOption === 'highest' && 'Highest'}
                {sortOption === 'lowest' && 'Lowest'}
              </Text>
              
              {(sortOption === 'newest' || sortOption === 'highest') ? (
                <ArrowDown size={14} color="#6B7280" />
              ) : (
                <ArrowUp size={14} color="#6B7280" />
              )}
            </Pressable>
          </View>
          
          {filteredUrges.length > 0 ? (
            <FlatList
              data={filteredUrges}
              renderItem={renderUrgeItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.urgesList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Filter size={40} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No urges found</Text>
              <Text style={styles.emptyText}>Try changing your filters</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <BarChart3 size={60} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No urge data yet</Text>
          <Text style={styles.emptyText}>
            Start tracking your urges to see detailed analytics
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginLeft: 10,
  },
  insightHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterGroup: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#3D56F0',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginHorizontal: 6,
  },
  urgesList: {
    paddingBottom: 20,
  },
  urgeCard: {
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
  urgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgeDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgeDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  urgeOutcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  urgeOutcomeSuccess: {
    backgroundColor: '#10B981',
  },
  urgeOutcomeFailure: {
    backgroundColor: '#EF4444',
  },
  urgeOutcomeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  urgeContent: {
    marginBottom: 12,
  },
  urgeIntensity: {
    marginBottom: 10,
  },
  urgeIntensityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  urgeIntensityValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgeIntensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  urgeIntensityNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  urgeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  urgeDetailIcon: {
    marginRight: 8,
  },
  urgeDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  urgeNotes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
}); 