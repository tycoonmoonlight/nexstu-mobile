import React, { useState, useMemo } from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Import Screens
import FeedScreen from '../screens/FeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import SearchScreen from '../screens/SearchScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ReelsScreen from '../screens/ReelsScreen';
import CommentsScreen from '../screens/CommentsScreen';
import SinglePostScreen from '../screens/SinglePostScreen';
import StoryViewerScreen from '../screens/StoryViewerScreen';
import InboxScreen from '../screens/InboxScreen';
import UserListScreen from '../screens/UserListScreen';
import SavedScreen from '../screens/SavedScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GroupsScreen from '../screens/GroupsScreen';
import MarketScreen from '../screens/MarketScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DarkColors = { bg: '#000000', card: '#121212', text: '#ffffff', textSec: '#a1a1aa', border: '#27272a', accent: '#FACC15', icon: '#fff' };
const LightColors = { bg: '#ffffff', card: '#f4f4f5', text: '#000000', textSec: '#52525b', border: '#e4e4e7', accent: '#ca8a04', icon: '#000' };

function HomeTabs({ user, logout }) {
  const { theme } = React.useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          width: '100%',
          height: Platform.OS === 'ios' ? 85 : 60,
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 25,
          alignItems: 'center',
          paddingBottom: Platform.OS === 'ios' ? 20 : 0
        },
        tabBarItemStyle: { height: 60, justifyContent: 'center', alignItems: 'center', flex: 0 },
        tabBarIcon: ({ focused, size }) => {
          let iconName;
          if (route.name === 'Feed') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Post') iconName = 'add';
          else if (route.name === 'Reels') iconName = focused ? 'videocam' : 'videocam-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          if (route.name === 'Post') {
            return (
              <View style={{ width: 45, height: 45, borderRadius: 22.5, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                <Ionicons name="add" size={30} color="#000" />
              </View>
            );
          }
          return <Ionicons name={iconName} size={26} color={focused ? theme.accent : '#71717a'} />;
        },
      })}
    >
      <Tab.Screen name="Feed">{(props) => <FeedScreen {...props} user={user} />}</Tab.Screen>
      <Tab.Screen name="Search">{(props) => <SearchScreen {...props} user={user} />}</Tab.Screen>
      <Tab.Screen name="Post">{(props) => <CreatePostScreen {...props} user={user} onPostSuccess={() => props.navigation.navigate('Feed')} onCancel={() => props.navigation.navigate('Feed')} />}</Tab.Screen>
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="Profile">{(props) => <ProfileScreen {...props} user={user} onLogout={logout} />}</Tab.Screen>
      <Tab.Screen name="Activity" options={{ tabBarButton: () => null }}>{(props) => <ActivityScreen {...props} user={user} />}</Tab.Screen>
      <Tab.Screen name="Groups" options={{ tabBarButton: () => null }}>{(props) => <GroupsScreen {...props} user={user} />}</Tab.Screen>
      <Tab.Screen name="Market" options={{ tabBarButton: () => null }}>{(props) => <MarketScreen {...props} user={user} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user, setUser, logout }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? DarkColors : LightColors;
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const themeContextValue = useMemo(() => ({ isDarkMode, toggleTheme, theme }), [isDarkMode, theme]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
          {!user ? (
            // FIX: We changed 'onLogin' to 'setUser' to match the Login Screen!
            <Stack.Screen name="Login">{(props) => <LoginScreen {...props} setUser={setUser} />}</Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main">{(props) => <HomeTabs {...props} user={user} logout={logout} />}</Stack.Screen>
              <Stack.Screen name="Chat">{(props) => <ChatScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="Inbox">{(props) => <InboxScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Comments">{(props) => <CommentsScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="SinglePost">{(props) => <SinglePostScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="Saved">{(props) => <SavedScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="UserList">{(props) => <UserListScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="Settings">{(props) => <SettingsScreen {...props} user={user} logout={logout} />}</Stack.Screen>
              <Stack.Screen name="Groups">{(props) => <GroupsScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="Market">{(props) => <MarketScreen {...props} user={user} />}</Stack.Screen>
              <Stack.Screen name="StoryViewer" component={StoryViewerScreen} options={{ presentation: 'transparentModal', headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
