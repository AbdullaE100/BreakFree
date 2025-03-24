import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { MessageCircle, Users, Heart, Share2 } from 'lucide-react-native';

const posts = [
  {
    id: '1',
    author: 'Sarah M.',
    days: 120,
    content: "Just hit 4 months sober! The support from this community has been incredible. Remember, we're all in this together. 💪",
    likes: 24,
    comments: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: '2',
    author: 'Michael R.',
    days: 30,
    content: 'One month milestone reached! The cravings are still there but getting easier to manage. Your stories keep me going.',
    likes: 16,
    comments: 5,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop',
  },
];

export default function CommunityScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect with others on the same journey</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={24} color="#4F46E5" />
          <Text style={styles.statValue}>2,481</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        
        <View style={styles.statCard}>
          <MessageCircle size={24} color="#4F46E5" />
          <Text style={styles.statValue}>142</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>
      </View>

      <View style={styles.createPost}>
        <Pressable style={styles.createPostButton}>
          <Text style={styles.createPostText}>Share Your Journey</Text>
        </Pressable>
      </View>

      {posts.map(post => (
        <View key={post.id} style={styles.post}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: post.avatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.daysCount}>{post.days} days sober</Text>
            </View>
          </View>
          
          <Text style={styles.postContent}>{post.content}</Text>
          
          <View style={styles.postActions}>
            <Pressable style={styles.actionButton}>
              <Heart size={20} color="#6B7280" />
              <Text style={styles.actionText}>{post.likes}</Text>
            </Pressable>
            
            <Pressable style={styles.actionButton}>
              <MessageCircle size={20} color="#6B7280" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </Pressable>
            
            <Pressable style={styles.actionButton}>
              <Share2 size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  createPost: {
    padding: 20,
  },
  createPostButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createPostText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  post: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    marginTop: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  daysCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  postContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
}); 