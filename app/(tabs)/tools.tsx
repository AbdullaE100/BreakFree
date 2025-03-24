import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { BookOpen, Play, FileText, Headphones, Tv, Heart, ExternalLink, Shield, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ToolsScreen() {
  // Mock data for resources
  const emergencyTools = [
    {
      id: 'urge-surfing',
      title: 'Urge Surfing',
      description: 'A guided meditation technique to ride out urges',
      icon: Headphones,
      color: '#3B82F6',
      duration: '5 min'
    },
    {
      id: 'cold-shower',
      title: 'Cold Shower Technique',
      description: 'Physical reset using cold exposure',
      icon: Play,
      color: '#10B981',
      duration: '3 min'
    },
    {
      id: 'distraction',
      title: 'Distraction Activities',
      description: 'Quick activities to redirect your attention',
      icon: FileText,
      color: '#F59E0B',
      duration: '1 min'
    },
  ];
  
  const educationalResources = [
    {
      id: 'dopamine',
      title: 'The Dopamine Connection',
      type: 'Article',
      icon: BookOpen,
      minutesToRead: 8,
    },
    {
      id: 'brain-changes',
      title: 'How Your Brain Changes',
      type: 'Video',
      icon: Tv,
      minutesToRead: 12,
    },
    {
      id: 'rewiring',
      title: 'Rewiring Neural Pathways',
      type: 'Article',
      icon: BookOpen,
      minutesToRead: 10,
    },
  ];
  
  const cbtTechniques = [
    {
      id: 'cognitive-distortions',
      title: 'Identifying Cognitive Distortions',
      completed: true,
    },
    {
      id: 'thought-records',
      title: 'Creating Thought Records',
      completed: false,
    },
    {
      id: 'beliefs',
      title: 'Challenging Core Beliefs',
      completed: false,
    },
  ];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tools</Text>
      </View>
      
      {/* Emergency Help Card */}
      <Pressable style={styles.emergencyCard}>
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.emergencyContent}>
          <View style={styles.emergencyIconContainer}>
            <AlertTriangle size={24} color="#FFFFFF" />
          </View>
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Struggling Right Now?</Text>
            <Text style={styles.emergencyDescription}>
              Get immediate support with our emergency toolkit
            </Text>
          </View>
        </View>
      </Pressable>
      
      {/* Emergency Tools */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency Tools</Text>
        <Text style={styles.sectionSubtitle}>For moments of intense urges</Text>
      </View>
      
      <View style={styles.emergencyToolsContainer}>
        {emergencyTools.map((tool, index) => {
          const Icon = tool.icon;
          
          return (
            <Pressable key={index} style={styles.emergencyToolCard}>
              <View 
                style={[
                  styles.toolIconContainer, 
                  { backgroundColor: `${tool.color}15` }
                ]}
              >
                <Icon size={24} color={tool.color} />
              </View>
              
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
              
              <View style={styles.toolFooter}>
                <Text style={styles.toolDuration}>{tool.duration}</Text>
                <Play size={16} color="#3D56F0" />
              </View>
            </Pressable>
          );
        })}
      </View>
      
      {/* Educational Resources */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Educational Resources</Text>
        <Pressable>
          <Text style={styles.sectionLink}>View all</Text>
        </Pressable>
      </View>
      
      {educationalResources.map((resource, index) => {
        const Icon = resource.icon;
        
        return (
          <Pressable key={index} style={styles.resourceCard}>
            <View 
              style={[
                styles.resourceIconContainer, 
                { backgroundColor: resource.type === 'Article' ? '#EBF5FF' : '#F0FDF4' }
              ]}
            >
              <Icon 
                size={20} 
                color={resource.type === 'Article' ? '#3B82F6' : '#10B981'} 
              />
            </View>
            
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <View style={styles.resourceMeta}>
                <Text style={styles.resourceType}>{resource.type}</Text>
                <View style={styles.resourceDot} />
                <Text style={styles.resourceReadTime}>{resource.minutesToRead} min</Text>
              </View>
            </View>
            
            <ExternalLink size={20} color="#6B7280" />
          </Pressable>
        );
      })}
      
      {/* CBT Techniques */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CBT Techniques</Text>
        <Text style={styles.sectionSubtitle}>Cognitive Behavioral Therapy</Text>
      </View>
      
      <View style={styles.cbtCard}>
        <View style={styles.cbtHeader}>
          <View style={styles.cbtHeaderLeft}>
            <Heart size={20} color="#3D56F0" />
            <Text style={styles.cbtTitle}>Thought Exercises</Text>
          </View>
          <Text style={styles.cbtProgress}>1/3 completed</Text>
        </View>
        
        {cbtTechniques.map((technique, index) => (
          <Pressable key={index} style={styles.cbtTechniqueItem}>
            <View 
              style={[
                styles.cbtCheckbox, 
                technique.completed ? styles.cbtCheckboxCompleted : {}
              ]}
            >
              {technique.completed && (
                <Shield size={14} color="#FFFFFF" />
              )}
            </View>
            <Text 
              style={[
                styles.cbtTechniqueText,
                technique.completed ? styles.cbtTechniqueCompleted : {}
              ]}
            >
              {technique.title}
            </Text>
          </Pressable>
        ))}
      </View>
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
  emergencyCard: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  sectionLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  emergencyToolsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 24,
  },
  emergencyToolCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
    minHeight: 48,
  },
  toolFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  resourceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  resourceReadTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  cbtCard: {
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
  cbtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cbtHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cbtTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  cbtProgress: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  cbtTechniqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cbtTechniqueItem_last: {
    borderBottomWidth: 0,
  },
  cbtCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cbtCheckboxCompleted: {
    backgroundColor: '#3D56F0',
    borderColor: '#3D56F0',
  },
  cbtTechniqueText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  cbtTechniqueCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
}); 