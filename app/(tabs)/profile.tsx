import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <LinearGradient
          colors={['#3D56F0', '#5C73F2']}
          style={styles.headerContainer}
        >
          <View style={styles.headerTop}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.profileImage} 
              />
              <TouchableOpacity style={styles.profileImageEdit}>
                <Text>📷</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
              {/* Settings icon removed as requested */}
            </View>
          </View>
          
          <View style={styles.profileNameRow}>
            <Text style={styles.userName}>Alex Johnson</Text>
            <TouchableOpacity style={styles.editNameButton}>
              <Text>✏️</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>32</Text>
              <Text style={styles.statLabel}>Clean Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleContainer}>
              <Text>🎯</Text>
              <Text style={styles.goalTitle}>Your Goal</Text>
            </View>
            <Text style={styles.goalDayCount}>90 Days</Text>
          </View>
          
          <View style={styles.goalVisual}>
            <View style={styles.progressCircleContainer}>
              <Text style={styles.progressCirclePercent}>36%</Text>
              <Text style={styles.progressCircleLabel}>Complete</Text>
            </View>
            
            <View style={styles.goalInfoContainer}>
              <View style={styles.goalInfoItem}>
                <Text style={styles.goalInfoLabel}>CLEAN DAYS</Text>
                <Text style={styles.goalInfoValue}>32 days</Text>
              </View>
              
              <View style={styles.goalInfoItem}>
                <Text style={styles.goalInfoLabel}>REMAINING</Text>
                <Text style={styles.goalInfoValue}>58 days</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '36%' }]} />
          </View>
          
          <View style={styles.progressLabelsContainer}>
            <Text style={styles.progressPercent}>36% Complete</Text>
            <Text style={styles.goalDaysRemaining}>58 days remaining</Text>
          </View>
          
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationLabel}>MOTIVATION</Text>
            <View style={styles.motivationRow}>
              <Text style={styles.motivationStatement}>
                Taking control of my life, one day at a time.
              </Text>
              <TouchableOpacity style={styles.editMotivationButton}>
                <Text>✏️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileImageEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 4,
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
  profileNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  editNameButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  goalVisual: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressCircleContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#3D56F0',
  },
  progressCirclePercent: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3D56F0',
  },
  progressCircleLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  goalInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  goalInfoItem: {
    marginBottom: 12,
  },
  goalInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  goalInfoValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
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
  motivationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motivationStatement: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    fontStyle: 'italic',
  },
  editMotivationButton: {
    padding: 8,
  },
}); 