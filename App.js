import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // FORCE LOGIN: We provide a fake user immediately
  const [user, setUser] = useState({ 
    name: "NexStu Dev", 
    email: "dev@nexstu.com" 
  });
  
  const [loading, setLoading] = useState(false);

  // When you click Logout, we just set the fake user again
  // preventing you from ever seeing the broken login screen
  const handleLogout = async () => {
    alert("Logout is disabled during testing.");
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
        setUser={setUser} 
        logout={handleLogout} 
      />
    </>
  );
}
