import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ThemeContext } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function ReelsScreen() {
  const [reels, setReels] = useState([]);
  const tabBarHeight = useBottomTabBarHeight(); // To calculate exact height
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/feed/get_reels.php?t=${Date.now()}`);
      const data = await response.json();
      if (data.status === 'success') setReels(data.data);
    } catch (e) {}
  };

  const renderItem = ({ item }) => (
    <View style={[styles.container, { height: height - tabBarHeight }]}>
      {/* 1. Main Content (Image/Video) */}
      <Image source={{ uri: item.media_url }} style={styles.fullscreenImg} resizeMode="cover" />
      
      {/* 2. Gradient Overlay (Simulated with opacity) */}
      <View style={styles.gradientOverlay} />

      {/* 3. Right Side Actions */}
      <View style={styles.sideBar}>
        <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="heart" size={30} color="#fff" />
            <Text style={styles.iconText}>{item.likes || '875'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
            <Text style={styles.iconText}>{item.comments || '54'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social" size={30} color="#fff" />
            <Text style={styles.iconText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 4. Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.userInfoRow}>
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            <Text style={styles.username}>{item.display_name}</Text>
            {/* Badge */}
            <Ionicons name="checkmark-circle" size={14} color="#FACC15" style={{ marginLeft: 4 }} />
            
            {/* Follow Button */}
            <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        
        <View style={styles.musicRow}>
            <Ionicons name="musical-notes" size={14} color="#ccc" />
            <Text style={styles.musicText}>Original Audio • {item.display_name}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Overlay */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REELS</Text>
        <View style={{flexDirection:'row', gap:20}}>
            <Ionicons name="camera-outline" size={26} color="#fff" />
        </View>
      </View>

      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height - tabBarHeight}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: width, backgroundColor: '#000', justifyContent: 'center' },
  fullscreenImg: { width: '100%', height: '100%' },
  
  gradientOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)' // Simple darken effect
  },

  header: {
    position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center'
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  sideBar: { 
    position: 'absolute', right: 10, bottom: 80, alignItems: 'center', zIndex: 10 
  },
  iconBtn: { marginBottom: 25, alignItems: 'center' },
  iconText: { color: '#fff', marginTop: 5, fontSize: 12, fontWeight: '600' },

  bottomInfo: { 
    position: 'absolute', bottom: 20, left: 15, width: '75%', zIndex: 10 
  },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#fff' },
  username: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  followBtn: { marginLeft: 10, borderWidth: 1, borderColor: '#fff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  followText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  caption: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  musicRow: { flexDirection: 'row', alignItems: 'center' },
  musicText: { color: '#fff', fontSize: 12, marginLeft: 5 }
});
