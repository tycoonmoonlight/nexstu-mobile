import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUser } from '../utils/auth';

const { width } = Dimensions.get('window');

export default function PublicProfileScreen({ route, navigation }) {
  if (!route.params || !route.params.userId) { navigation.goBack(); return null; }

  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasStory, setHasStory] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUser();
    setCurrentUser(user);
    fetchProfile(user ? user.token : '');
  };

  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/profile/get_public_profile.php?user_id=${userId}&t=${Date.now()}`, {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProfile(data.data);
        setIsFollowing(data.data.is_following);
        checkStory();
      } else {
        Alert.alert("Error", "User not found");
        navigation.goBack();
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const checkStory = async () => {
      try {
          const res = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/stories/get_by_user.php?user_id=${userId}`);
          const d = await res.json();
          if (d.status === 'success') setHasStory(true);
      } catch(e) {}
  };

  const handleAvatarClick = () => {
    if (hasStory) {
        navigation.navigate('StoryViewer', { userId, userName: profile.user.full_name, userAvatar: profile.user.avatar_url });
    }
  };

  const openList = (type, title) => {
    navigation.push('UserList', { userId, type, title });
  };

  const handleFollow = async () => {
    if (!currentUser) return Alert.alert("Login Required", "Please log in to follow.");
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    
    setProfile(prev => ({
        ...prev,
        stats: {
            ...prev.stats,
            followers: !isFollowing ? (prev.stats.followers + 1) : (prev.stats.followers - 1)
        }
    }));

    try {
      await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/follow.php', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + currentUser.token },
        body: JSON.stringify({ user_id: userId })
      });
    } catch (error) { setIsFollowing(previousState); }
  };

  if (loading) return <ActivityIndicator style={{marginTop:50}} color="#fff" />;

  const safeUser = profile?.user || {};
  const initial = (safeUser.email || 'U').charAt(0).toUpperCase();
  const displayName = safeUser.full_name || `Student ${safeUser.id || '?'}`;
  const displayBio = safeUser.bio || 'University of Nigeria, Nsukka';
  const avatarUrl = safeUser.avatar_url ? `${safeUser.avatar_url}?r=${Math.random()}` : null;
  const stats = profile?.stats || { posts:0, followers:0, following:0, likes:0 };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarClick} disabled={!hasStory} style={[styles.avatarWrapper, hasStory && styles.activeStoryRing]}>
            <View style={styles.avatarInner}>
               {avatarUrl ? ( <Image source={{ uri: avatarUrl }} style={styles.avatarImg} /> ) : ( <Text style={styles.avatarText}>{initial}</Text> )}
            </View>
        </TouchableOpacity>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.bio}>{displayBio}</Text>
        
        <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btn, isFollowing ? styles.followingBtn : styles.followBtn]} onPress={handleFollow}>
              <Text style={styles.btnText}>{isFollowing ? "Following" : "Follow"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.msgBtn]} onPress={() => navigation.navigate('Chat', { receiverId: userId, receiverName: displayName, receiverAvatar: avatarUrl })}>
              <Text style={styles.btnText}>Message</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}><Text style={styles.statNum}>{stats.posts}</Text><Text style={styles.statLabel}>Post</Text></View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.statItem} onPress={() => openList('followers', 'Followers')}>
            <Text style={styles.statNum}>{stats.followers}</Text><Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.statItem} onPress={() => openList('following', 'Following')}>
            <Text style={styles.statNum}>{stats.following}</Text><Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <View style={styles.statItem}><Text style={styles.statNum}>{stats.likes}</Text><Text style={styles.statLabel}>Likes</Text></View>
      </View>

      <FlatList 
        data={profile?.posts || []}
        numColumns={3}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
             {item.media_url ? <Image source={{ uri: item.media_url }} style={styles.img} /> : <View style={styles.placeholder}><Text style={styles.caption}>{item.caption}</Text></View>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 40 },
  backBtn: { padding: 15, position: 'absolute', top: 30, left: 10, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 20 },
  avatarWrapper: { width: 86, height: 86, borderRadius: 43, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  activeStoryRing: { borderWidth: 3, borderColor: '#007AFF' },
  avatarInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent:'center', alignItems:'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  bio: { fontSize: 14, color: '#aaa', marginTop: 5, marginBottom: 15 },
  actionRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  btn: { paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, minWidth: 100, alignItems: 'center' },
  followBtn: { backgroundColor: '#007AFF' },
  followingBtn: { backgroundColor: '#333', borderWidth: 1, borderColor: '#555' },
  msgBtn: { backgroundColor: '#222', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222', paddingVertical: 15 },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 20, backgroundColor: '#333' },
  gridItem: { width: width/3 - 2, height: width/3 - 2, margin: 1, backgroundColor: '#111' },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', padding: 5 },
  caption: { color: '#ccc', fontSize: 10 }
});
