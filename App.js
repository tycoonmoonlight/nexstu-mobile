import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { getUser, saveUser, removeUser } from './src/utils/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Force Web to act like an App
    if (Platform.OS === 'web') {
      const meta = document.createElement('meta');
      meta.name = 'mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }
    
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const savedUser = await getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  };

  const handleLogin = async (userData) => {
    await saveUser(userData);
    setUser(userData);
  };

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
