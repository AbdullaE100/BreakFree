import { Tabs } from 'expo-router';
import { Home, User, BookOpen, Shield, Activity, BarChart2 } from 'lucide-react-native';
import { Dimensions, Platform } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3D56F0',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 5,
          paddingHorizontal: Platform.OS === 'ios' ? 10 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter-Medium',
          marginBottom: Platform.OS === 'ios' ? 8 : 0,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 5 : 0,
        },
        headerShown: false,
        tabBarItemStyle: {
          paddingHorizontal: Platform.OS === 'ios' ? 8 : 0,
        },
      }}
    >
      {/* Visible tabs */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="urge-tracker"
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tabs.Screen
        name="checkin"
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tabs.Screen
        name="progress"
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tabs.Screen
        name="community"
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tabs.Screen
        name="milestones"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}