import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Award, Star, Trophy, Zap, Target, Medal, Shield, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UrgeAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  progress: number;
  total: number;
  unlocked: boolean;
  date?: string;
}

interface UrgeAchievementsProps {
  achievements: UrgeAchievement[];
  totalUrgesOvercome: number;
  currentStreak: number;
  longestStreak: number;
}

export default function UrgeAchievements({ 
  achievements, 
  totalUrgesOvercome,
  currentStreak,
  longestStreak 
}: UrgeAchievementsProps) {
  
  // Sample achievements (in a real app, these would come from the backend)
  const allAchievements: UrgeAchievement[] = [
    {
      id: 'first_overcome',
      title: 'First Victory',
      description: 'Successfully overcome your first urge',
      icon: Star,
      progress: totalUrgesOvercome > 0 ? 1 : 0,
      total: 1,
      unlocked: totalUrgesOvercome > 0,
      date: totalUrgesOvercome > 0 ? '2023-12-01' : undefined,
    },
    {
      id: 'five_overcome',
      title: 'Rising Star',
      description: 'Successfully overcome 5 urges',
      icon: Zap,
      progress: Math.min(totalUrgesOvercome, 5),
      total: 5,
      unlocked: totalUrgesOvercome >= 5,
      date: totalUrgesOvercome >= 5 ? '2023-12-05' : undefined,
    },
    {
      id: 'twenty_overcome',
      title: 'Urge Master',
      description: 'Successfully overcome 20 urges',
      icon: Shield,
      progress: Math.min(totalUrgesOvercome, 20),
      total: 20,
      unlocked: totalUrgesOvercome >= 20,
      date: totalUrgesOvercome >= 20 ? '2023-12-15' : undefined,
    },
    {
      id: 'fifty_overcome',
      title: 'Willpower Champion',
      description: 'Successfully overcome 50 urges',
      icon: Trophy,
      progress: Math.min(totalUrgesOvercome, 50),
      total: 50,
      unlocked: totalUrgesOvercome >= 50,
    },
    {
      id: 'three_day_streak',
      title: 'Three Day Streak',
      description: 'Maintain a clean streak for 3 days',
      icon: Target,
      progress: Math.min(currentStreak, 3),
      total: 3,
      unlocked: currentStreak >= 3 || longestStreak >= 3,
      date: (currentStreak >= 3 || longestStreak >= 3) ? '2023-12-03' : undefined,
    },
    {
      id: 'seven_day_streak',
      title: 'One Week Warrior',
      description: 'Maintain a clean streak for 7 days',
      icon: Medal,
      progress: Math.min(currentStreak, 7),
      total: 7,
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      date: (currentStreak >= 7 || longestStreak >= 7) ? '2023-12-07' : undefined,
    },
    {
      id: 'thirty_day_streak',
      title: 'Monthly Champion',
      description: 'Maintain a clean streak for 30 days',
      icon: Crown,
      progress: Math.min(currentStreak, 30),
      total: 30,
      unlocked: currentStreak >= 30 || longestStreak >= 30,
    },
  ];
  
  // Sort achievements: unlocked first, then by progress percentage
  const sortedAchievements = [...allAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    
    const aProgress = a.progress / a.total;
    const bProgress = b.progress / b.total;
    
    return bProgress - aProgress;
  });
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Urge Achievements</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalUrgesOvercome}</Text>
          <Text style={styles.statLabel}>Urges Overcome</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.achievementsContainer}>
        {sortedAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.total) * 100;
          
          return (
            <View 
              key={achievement.id} 
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementCardUnlocked
              ]}
            >
              <View style={styles.achievementIconContainer}>
                <LinearGradient
                  colors={
                    achievement.unlocked
                      ? ['#3D56F0', '#5B73FF']
                      : ['#D1D5DB', '#9CA3AF']
                  }
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              
              <View style={styles.achievementContent}>
                <View style={styles.achievementHeader}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  
                  {achievement.unlocked && achievement.date && (
                    <Text style={styles.achievementDate}>
                      {formatDate(achievement.date)}
                    </Text>
                  )}
                </View>
                
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${progressPercentage}%` },
                        achievement.unlocked && styles.progressFillComplete
                      ]} 
                    />
                  </View>
                  
                  <Text style={styles.progressText}>
                    {achievement.progress} / {achievement.total}
                  </Text>
                </View>
              </View>
            </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  achievementsContainer: {
    paddingBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    opacity: 0.7,
  },
  achievementCardUnlocked: {
    opacity: 1,
  },
  achievementIconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9CA3AF',
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: '#3D56F0',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    width: 45,
    textAlign: 'right',
  },
}); 