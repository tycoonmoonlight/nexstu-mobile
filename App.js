import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { getUser, saveUser, removeUser } from './src/utils/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Web compatibility fix
    if (Platform.OS === 'web') {
      const meta = document.createElement('meta');
      meta.name = 'mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }
    checkLogin();
  }, []);

  // 1. Check if user is already logged in on this phone
  const checkLogin = async () => {
    try {
      const savedUser = await getUser();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (e) {
      console.log("Login check failed", e);
    }
    setLoading(false);
  };

  // 2. Handle new login (Save user to phone storage)
  const handleLogin = async (userData) => {
    await saveUser(userData);
    setUser(userData);
  };

  // 3. Handle Logout (Delete user from phone storage)
  const handleLogout = async () => {
    await removeUser();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'}}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator 
        user={user} 
        setUser={handleLogin} 
        logout={handleLogout} 
      />
    </>
  );
}
