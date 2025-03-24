import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Settings, Award, Calendar, Target, TrendingUp, Shield, Clock, Trophy, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { signOut, profile, streak } = useAuth();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // AuthContext will handle navigation
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mock user data
  const userData = {
    name: profile?.name || 'User',
    streak: {
      current: streak?.current_streak || 0,
      best: streak?.best_streak || 0
    },
    goalDays: profile?.goal_days || 90,
    motivationStatement: profile?.motivation_statement || 'Becoming a more authentic version of myself',
    progress: {
      daysClean: streak?.total_clean_days || 0,
      urgesOvercome: 78,
      lessonsCompleted: 8,
    },
    badges: [
      {
        id: 'first-week',
        title: 'First Week',
        description: 'Completed 7 days free',
        icon: Calendar,
        earned: true,
        date: '2023-11-10',
      },
      {
        id: 'journal-master',
        title: 'Journal Master',
        description: 'Completed 10 journal entries',
        icon: Award,
        earned: true,
        date: '2023-11-18',
      },
      {
        id: 'urge-surfer',
        title: 'Urge Surfer',
        description: 'Used urge surfing technique 5 times',
        icon: TrendingUp,
        earned: true,
        date: '2023-12-01',
      },
      {
        id: 'month-milestone',
        title: 'One Month Milestone',
        description: 'Completed 30 days free',
        icon: Trophy,
        earned: false
      },
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Morning routine for 5 days',
        icon: Clock,
        earned: false
      },
    ],
    insights: [
      'Morning seems to be when urges are strongest',
      'Exercise reduces urge intensity by 60%',
      'Journaling has improved your awareness'
    ]
  };

  // Calculate goal progress percent
  const progressPercent = Math.round((userData.progress.daysClean / userData.goalDays) * 100);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#3D56F0', '#5B73FF']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.headerTop}>
          <View style={styles.profileImageContainer}>
            <Shield size={36} color="#FFFFFF" />
          </View>
          
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Settings size={20} color="#FFFFFF" />
            </Pressable>
            
            <Pressable 
              style={styles.iconButton}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
        
        <Text style={styles.userName}>{userData.name}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.streak.current}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.progress.urgesOvercome}</Text>
            <Text style={styles.statLabel}>Urges Overcome</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.progress.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>
      </View>
      
      {/* Goal Card */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleContainer}>
            <Target size={20} color="#3D56F0" />
            <Text style={styles.goalTitle}>Your 90-Day Goal</Text>
          </View>
          
          <Text style={styles.goalDayCount}>Day {userData.progress.daysClean}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        
        <View style={styles.progressLabelsContainer}>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
          <Text style={styles.goalDaysRemaining}>
            {userData.goalDays - userData.progress.daysClean} days remaining
          </Text>
        </View>
        
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationLabel}>My Motivation:</Text>
          <Text style={styles.motivationStatement}>
            "{userData.motivationStatement}"
          </Text>
        </View>
      </View>
      
      {/* Achievements */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Pressable>
          <Text style={styles.sectionViewAll}>View all</Text>
        </Pressable>
      </View>
      
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        style={styles.badgesScrollView}
        contentContainerStyle={styles.badgesContainer}
      >
        {userData.badges.map((badge, index) => {
          const Icon = badge.icon;
          
          return (
            <View 
              key={index} 
              style={[
                styles.badgeCard, 
                !badge.earned && styles.badgeCardLocked
              ]}
            >
              <View 
                style={[
                  styles.badgeIconContainer, 
                  !badge.earned && styles.badgeIconContainerLocked
                ]}
              >
                <Icon 
                  size={24} 
                  color={badge.earned ? '#3D56F0' : '#9CA3AF'} 
                />
              </View>
              
              <Text 
                style={[
                  styles.badgeTitle, 
                  !badge.earned && styles.badgeTitleLocked
                ]}
              >
                {badge.title}
              </Text>
              
              <Text 
                style={[
                  styles.badgeDescription, 
                  !badge.earned && styles.badgeDescriptionLocked
                ]}
              >
                {badge.description}
              </Text>
              
              {badge.earned && (
                <Text style={styles.badgeDate}>
                  Earned: {badge.date}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
      
      {/* Personalized Insights */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Insights</Text>
      </View>
      
      <View style={styles.insightsCard}>
        <View style={styles.insightsList}>
          {userData.insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
        
        <Pressable style={styles.viewAllInsightsButton}>
          <Text style={styles.viewAllInsightsText}>See detailed analysis</Text>
        </Pressable>
      </View>
      
      {/* Goal Calendar */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recovery Calendar</Text>
      </View>
      
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>December 2023</Text>
        </View>
        
        <View style={styles.calendarGrid}>
          {/* Just a mock representation of a calendar */}
          {Array(30).fill(0).map((_, index) => {
            const day = index + 1;
            const isClean = day < 18; // Mock data - assume all days before 18th were clean
            const isToday = day === 17;
            
            return (
              <View 
                key={index} 
                style={[
                  styles.calendarDay,
                  isClean && styles.calendarDayClean,
                  isToday && styles.calendarDayToday
                ]}
              >
                <Text 
                  style={[
                    styles.calendarDayText,
                    isClean && styles.calendarDayTextClean,
                    isToday && styles.calendarDayTextToday
                  ]}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Emergency Contact */}
      <View style={styles.emergencyContactCard}>
        <Text style={styles.emergencyContactTitle}>Need Immediate Help?</Text>
        <Text style={styles.emergencyContactDescription}>
          Talk to a counselor or supportive friend if you're struggling.
        </Text>
        
        <Pressable style={styles.emergencyContactButton}>
          <Text style={styles.emergencyContactButtonText}>
            View Emergency Contacts
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 24,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  goalDayCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3D56F0',
    borderRadius: 4,
  },
  progressLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressPercent: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
  },
  goalDaysRemaining: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  motivationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  motivationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 4,
  },
  motivationStatement: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  sectionViewAll: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  badgesScrollView: {
    marginBottom: 24,
  },
  badgesContainer: {
    paddingHorizontal: 12,
  },
  badgeCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeCardLocked: {
    backgroundColor: '#F9FAFB',
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconContainerLocked: {
    backgroundColor: '#F3F4F6',
  },
  badgeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  badgeTitleLocked: {
    color: '#9CA3AF',
  },
  badgeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  badgeDescriptionLocked: {
    color: '#D1D5DB',
  },
  badgeDate: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#3D56F0',
  },
  insightsCard: {
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
  insightsList: {
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3D56F0',
    marginTop: 6,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  viewAllInsightsButton: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewAllInsightsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarHeader: {
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -2,
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  calendarDayInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayClean: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  calendarDayToday: {
    backgroundColor: '#3D56F0',
  },
  calendarDayText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  calendarDayTextClean: {
    color: '#10B981',
  },
  calendarDayTextToday: {
    color: '#FFFFFF',
  },
  emergencyContactCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyContactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#B91C1C',
    marginBottom: 8,
  },
  emergencyContactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#991B1B',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyContactButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emergencyContactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#B91C1C',
  },
}); 