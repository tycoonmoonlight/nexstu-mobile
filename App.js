import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { getUser, saveUser, removeUser } from './src/utils/auth';

export default function App() {
  // TRICK: We start with a Fake User so the app thinks we are logged in!
  const [user, setUser] = useState({ 
    name: "NexStu Developer", 
    email: "dev@nexstu.com",
    token: "simulation-token"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const meta = document.createElement('meta');
      meta.name = 'mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }
    // We skipped checkLogin() to force entry
  }, []);

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
