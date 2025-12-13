import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, StatusBar, Modal, Dimensions, Platform, SafeAreaView, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/ThemeContext';

const windowDimensions = Dimensions.get('window');
const height = windowDimensions.height;
const width = windowDimensions.width;

export default function FeedScreen({ user }) {
  const { theme } = useContext(ThemeContext);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();

  useFocusEffect(React.useCallback(() => { fetchUnreadCount(); }, []));

  useEffect(() => { loadInitialData(); }, []);

  const fetchUnreadCount = async () => {
    if(!user) return;
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/chat/count_unread.php?t=${Date.now()}`, { headers: { 'Authorization': 'Bearer ' + user.token } });
      const data = await response.json();
      if (data.status === 'success') setUnreadCount(data.count);
    } catch(e) {}
  };

  const loadInitialData = async () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    await fetchStories();
    await fetchPosts(1, true);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchStories();
    await fetchPosts(1, true);
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || loading) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchPosts(nextPage, false);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const fetchPosts = async (pageNum, shouldReset) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/feed/campus.php?page=${pageNum}&t=${Date.now()}`, { 
        headers: { 'Authorization': 'Bearer ' + user.token } 
      });
      const data = await response.json();
      if (data.status === 'success') {
        const newPosts = data.data.map(p => ({ 
            ...p, 
            isLiked: p.is_liked == 1, 
            isSaved: p.is_saved == 1,
            likes_count: parseInt(p.likes_count || 0),
            comments_count: parseInt(p.comments_count || 0)
        }));
        if (newPosts.length < 10) setHasMore(false);
        if (shouldReset) setPosts(newPosts);
        else setPosts(prev => [...prev, ...newPosts]);
      } else { setHasMore(false); }
    } catch (error) {}
  };

  const fetchStories = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/stories/get.php?t=${Date.now()}`);
      const data = await response.json();
      if (data.status === 'success') setStories(data.data);
    } catch(e) {}
  };

  const handleAddStory = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.canceled) { setSelectedImage(result.assets[0]); setStoryCaption(''); setUploadVisible(true); }
  };

  const confirmUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('token', user.token);
      formData.append('caption', storyCaption);
      if (Platform.OS === 'web') {
          const res = await fetch(selectedImage.uri);
          const blob = await res.blob();
          const file = new File([blob], "story.jpg", { type: "image/jpeg" });
          formData.append('story', file);
      } else {
          formData.append('story', { uri: selectedImage.uri, name: selectedImage.uri.split('/').pop(), type: 'image/jpeg' });
      }
      await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/stories/add.php', { method: 'POST', headers: { 'Authorization': 'Bearer ' + user.token }, body: formData });
      setUploadVisible(false);
      fetchStories();
    } catch(e) {} finally { setUploading(false); }
  };

  const openStory = (story) => { setActiveStory(story); setViewerVisible(true); };

  const handleLike = async (postId, index) => {
    const newPosts = [...posts]; 
    const isLiked = !newPosts[index].isLiked;
    newPosts[index].isLiked = isLiked;
    newPosts[index].likes_count = isLiked ? newPosts[index].likes_count + 1 : newPosts[index].likes_count - 1;
    setPosts(newPosts);
    try { await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/like.php', { method: 'POST', headers: { 'Authorization': 'Bearer ' + user.token }, body: JSON.stringify({ post_id: postId }) }); } catch (error) { }
  };

  const handleSave = async (postId, index) => {
    const newPosts = [...posts]; newPosts[index].isSaved = !newPosts[index].isSaved; setPosts(newPosts);
    try { await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/save.php', { method: 'POST', headers: { 'Authorization': 'Bearer ' + user.token }, body: JSON.stringify({ post_id: postId }) }); } catch (error) { }
  };

  const openLikesList = (postId) => {
    navigation.navigate('UserList', { title: 'Likes', endpoint: `interaction/get_likes.php?post_id=${postId}` });
  };

  const renderHeader = () => (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.storiesContainer}>
        <TouchableOpacity style={{marginRight:10, alignItems:'center', width:70}} onPress={handleAddStory}>
            <View style={[styles.storyRect, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Ionicons name="add" size={24} color={theme.text} />
            </View>
            <Text style={[styles.storyName, { color: theme.text }]}>Add Story</Text>
        </TouchableOpacity>
        <FlatList 
            data={stories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.storyCard} onPress={() => openStory(item)}>
                    <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} style={styles.storyRectImg} />
                    <View style={{...StyleSheet.absoluteFillObject, borderWidth: 2, borderColor: '#FACC15', borderRadius: 12}} />
                    <Text style={styles.storyNameOverlay} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            )}
            keyExtractor={(item) => item.user_id.toString()}
        />
      </View>
    </View>
  );

  const renderPost = ({ item, index }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/40' }} style={styles.userAvatar} />
            <View style={{ marginLeft: 10 }}>
                <Text style={[styles.userName, { color: theme.text }]}>{item.display_name}</Text>
                <Text style={[styles.userMeta, { color: theme.textSec }]}>UNN • {item.created_at}</Text>
            </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', { receiverId: item.user_id, receiverName: item.display_name, receiverAvatar: item.avatar_url })}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.textSec} />
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 10 }}>
        <Text style={[styles.postText, { color: theme.text }]}>{item.caption}</Text>
        {item.media_url ? (
            <TouchableOpacity onPress={() => navigation.navigate('SinglePost', { postId: item.id })}>
                <Image source={{ uri: item.media_url }} style={styles.postImg} resizeMode="cover" />
            </TouchableOpacity>
        ) : null}
      </View>
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => handleLike(item.id, index)} style={styles.actionRow}>
                <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={22} color={item.isLiked ? "#EF4444" : theme.textSec} />
                <Text style={{color: theme.textSec, marginLeft: 5, fontSize: 12, fontWeight: 'bold'}}>{item.likes_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: item.id })} style={styles.actionRow}>
                <Ionicons name="chatbubble-outline" size={22} color={theme.textSec} />
                <Text style={{color: theme.textSec, marginLeft: 5, fontSize: 12, fontWeight: 'bold'}}>{item.comments_count}</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
            <TouchableOpacity onPress={() => openLikesList(item.id)}>
                <Text style={{color: theme.textSec, fontSize: 12, fontWeight: 'bold'}}>View Likes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSave(item.id, index)}>
                <Ionicons name={item.isSaved ? "bookmark" : "bookmark-outline"} size={22} color={item.isSaved ? theme.accent : theme.textSec} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000000' ? "light-content" : "dark-content"} backgroundColor={theme.bg} />
      <View style={[styles.topBar, { borderBottomColor: theme.border, backgroundColor: theme.bg }]}>
        <Text style={[styles.logoText, { color: theme.text }]}>NEXSTU<Text style={{ color: theme.accent }}>.</Text></Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Market')}>
                <Ionicons name="basket-outline" size={26} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                <Ionicons name="notifications-outline" size={26} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Inbox')}>
                <View>
                    <Ionicons name="paper-plane-outline" size={26} color={theme.text} />
                    {parseInt(unreadCount) > 0 ? (
                        <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
                    ) : null}
                </View>
            </TouchableOpacity>
        </View>
      </View>

      <FlatList 
        data={posts} 
        renderItem={renderPost} 
        keyExtractor={(item) => item.id.toString()} 
        ListHeaderComponent={renderHeader}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 20 }} /> : <View style={{height: 100}} />} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <Modal visible={uploadVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>New Story</Text>
                {selectedImage && <Image source={{ uri: selectedImage.uri }} style={styles.preview} />}
                <TextInput style={[styles.input, { backgroundColor: theme.bg === '#000000' ? '#27272a' : '#f4f4f5', color: theme.text }]} placeholder="Caption..." placeholderTextColor="#888" value={storyCaption} onChangeText={setStoryCaption} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <TouchableOpacity onPress={() => setUploadVisible(false)}><Text style={{ color: theme.textSec, padding: 10 }}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={confirmUpload}><Text style={{ color: theme.accent, fontWeight: 'bold', padding: 10 }}>Share</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <Modal visible={viewerVisible} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={() => setViewerVisible(false)}>
                <Ionicons name="close" size={40} color="#fff" />
            </TouchableOpacity>
            {activeStory && activeStory.items.length > 0 && (
                <Image source={{ uri: activeStory.items[0].url }} style={styles.fullStoryImg} resizeMode="contain" />
            )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 60, borderBottomWidth: 1, marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  logoText: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  storiesContainer: { flexDirection: 'row', marginBottom: 20, marginTop: 15 },
  storyRect: { width: 70, height: 100, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
  storyName: { fontSize: 10, marginTop: 5, fontWeight: '600' },
  storyCard: { width: 70, height: 100, borderRadius: 12, marginRight: 10, overflow: 'hidden' },
  storyRectImg: { width: '100%', height: '100%' },
  storyNameOverlay: { position: 'absolute', bottom: 5, left: 5, color: '#fff', fontSize: 9, fontWeight: 'bold' },
  card: { borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  userAvatar: { width: 40, height: 40, borderRadius: 10 },
  userName: { fontWeight: 'bold', fontSize: 14 },
  userMeta: { fontSize: 11, marginTop: 2 },
  postText: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  postImg: { width: '100%', height: 300, borderRadius: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  fullStoryImg: { width: width, height: height * 0.85 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  preview: { width: 200, height: 250, borderRadius: 10, marginBottom: 15 },
  input: { width: '100%', padding: 12, borderRadius: 10, marginBottom: 20 },
});
