import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions, StatusBar, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, user, onLogout }) {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [stats, setStats] = useState({});
  const [myPosts, setMyPosts] = useState([]);
  const [hasStory, setHasStory] = useState(false);
  const [activeTab, setActiveTab] = useState('POSTS'); // POSTS | REELS | SAVED

  useFocusEffect(
    useCallback(() => { fetchProfileData(); }, [])
  );

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/profile/get_details.php?t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProfileData(data.data.user || {});
        setStats(data.data.stats || {});
        setMyPosts(data.data.posts || []);
        setHasStory(data.data.has_story);
      }
    } catch (error) { } finally { setLoading(false); }
  };

  const displayName = profileData?.full_name || `Student`;
  const displayBio = profileData?.bio || 'No bio yet.';
  const avatarUrl = profileData?.avatar_url ? `${profileData.avatar_url}?r=${Math.random()}` : null;

  const handleAvatarClick = () => {
    if (hasStory) navigation.navigate('StoryViewer', { userId: user.user.id, userName: displayName, userAvatar: avatarUrl });
  };

  const openList = (type, title) => {
    navigation.navigate('UserList', { endpoint: `users/get_connections.php?user_id=${user.user.id}&type=${type}`, title });
  };

  const renderMyPost = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('SinglePost', { postId: item.id })}>
      {item.media_url ? ( 
        <Image source={{ uri: item.media_url }} style={styles.gridImage} /> 
      ) : ( 
        <View style={[styles.gridImage, { backgroundColor: theme.card, justifyContent: 'center', padding: 5 }]}>
            <Text style={{ color: theme.textSec, fontSize: 10, textAlign: 'center' }}>{item.caption}</Text>
        </View> 
      )}
    </TouchableOpacity>
  );

  const StatBox = ({ label, count, onPress }) => (
    <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={onPress} disabled={!onPress}>
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900' }}>{count || 0}</Text>
        <Text style={{ color: theme.textSec, fontSize: 10, fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000000' ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>@{displayName.replace(/\s+/g, '_').toLowerCase()}</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Saved')}>
                <Ionicons name="menu-outline" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* PROFILE INFO CENTERED */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity onPress={handleAvatarClick} style={{ marginBottom: 15 }}>
                <View style={[styles.avatarContainer, hasStory && { borderColor: theme.accent, borderWidth: 3, padding: 3 }]}>
                    <Image source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                    {/* Active Status Dot */}
                    <View style={[styles.activeDot, { backgroundColor: theme.accent, borderColor: theme.bg }]} />
                </View>
            </TouchableOpacity>
        </View>

        {/* STATS BOX */}
        <View style={[styles.statsBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <StatBox label="Posts" count={stats.posts} />
            <View style={{ width: 1, height: 20, backgroundColor: theme.border }} />
            <StatBox label="Followers" count={stats.followers} onPress={() => openList('followers', 'Followers')} />
            <View style={{ width: 1, height: 20, backgroundColor: theme.border }} />
            <StatBox label="Following" count={stats.following} onPress={() => openList('following', 'Following')} />
            <View style={{ width: 1, height: 20, backgroundColor: theme.border }} />
            <StatBox label="Likes" count={stats.likes} />
        </View>

        {/* BIO SECTION */}
        <View style={{ alignItems: 'center', marginBottom: 20, paddingHorizontal: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{displayName}</Text>
                <Ionicons name="checkmark-circle" size={16} color={theme.accent} style={{ marginLeft: 5 }} />
            </View>
            <Text style={{ color: theme.textSec, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                {displayBio}
            </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 25 }}>
            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                onPress={() => navigation.navigate('EditProfile', { currentName: profileData?.full_name, currentBio: profileData?.bio, currentAvatar: profileData?.avatar_url, token: user.token })}
            >
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>Share Profile</Text>
            </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={[styles.tabsRow, { borderBottomColor: theme.border }]}>
            {['POSTS', 'REELS', 'SAVED'].map(tab => (
                <TouchableOpacity 
                    key={tab} 
                    style={[styles.tabItem, activeTab === tab && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
                    onPress={() => tab === 'SAVED' ? navigation.navigate('Saved') : setActiveTab(tab)}
                >
                    <Text style={{ 
                        color: activeTab === tab ? theme.accent : theme.textSec, 
                        fontWeight: 'bold', fontSize: 12, marginBottom: 10 
                    }}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* POST GRID */}
        {loading ? <ActivityIndicator color={theme.text} style={{ marginTop: 20 }} /> : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1, paddingHorizontal: 1 }}>
                {myPosts.map((item) => (
                    <View key={item.id} style={{ width: (width / 3) - 1, height: (width / 3) - 1, marginBottom: 1 }}>
                        {renderMyPost({ item })}
                    </View>
                ))}
            </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, marginTop: 30 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  
  avatarContainer: { borderRadius: 100 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  activeDot: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, borderWidth: 3 },

  statsBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, marginHorizontal: 15, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  
  tabsRow: { flexDirection: 'row', marginBottom: 2 },
  tabItem: { flex: 1, alignItems: 'center' },
  
  gridItem: { width: '100%', height: '100%' },
  gridImage: { width: '100%', height: '100%' }
});
