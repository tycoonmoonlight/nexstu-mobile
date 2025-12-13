import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen({ route, navigation }) {
  const { userId, userName, userAvatar, preloadedStories } = route.params;
  const [stories, setStories] = useState(preloadedStories || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!preloadedStories);

  useEffect(() => {
    if (!preloadedStories) {
      fetchUserStories();
    }
  }, []);

  const fetchUserStories = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/stories/get_by_user.php?user_id=${userId}&t=${Date.now()}`);
      const data = await response.json();
      if (data.status === 'success') {
        setStories(data.data);
      } else {
        navigation.goBack(); // Close if no stories
      }
    } catch (e) { navigation.goBack(); } finally { setLoading(false); }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack(); // Close at end
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#fff" /></View>;
  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Main Image */}
      <Image source={{ uri: currentStory.url }} style={styles.image} resizeMode="contain" />

      {/* Touch Areas for Navigation */}
      <View style={styles.touchOverlay}>
        <TouchableOpacity style={styles.touchLeft} onPress={handlePrev} />
        <TouchableOpacity style={styles.touchRight} onPress={handleNext} />
      </View>

      {/* Header Info */}
      <SafeAreaView style={styles.header}>
        <View style={styles.barContainer}>
            {stories.map((_, index) => (
                <View key={index} style={[styles.bar, index <= currentIndex ? styles.barActive : styles.barInactive]} />
            ))}
        </View>
        
        <View style={styles.userInfo}>
            <Image source={{ uri: userAvatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />
            <Text style={styles.userName}>{userName}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginLeft: 'auto'}}>
                <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* CAPTION OVERLAY */}
      {currentStory.caption ? (
        <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentStory.caption}</Text>
        </View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  image: { width: width, height: height * 0.85 },
  
  touchOverlay: { position: 'absolute', width: width, height: height, flexDirection: 'row' },
  touchLeft: { flex: 1 },
  touchRight: { flex: 1 },

  header: { position: 'absolute', top: 40, left: 0, width: width, paddingHorizontal: 10 },
  barContainer: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  barActive: { backgroundColor: '#fff' },
  barInactive: { backgroundColor: 'rgba(255,255,255,0.3)' },

  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10, backgroundColor: '#333' },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  captionContainer: { 
    position: 'absolute', 
    bottom: 50, 
    left: 0, 
    width: width, 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  captionText: { 
    color: '#fff', 
    fontSize: 18, 
    textAlign: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 10, 
    borderRadius: 10 
  }
});
