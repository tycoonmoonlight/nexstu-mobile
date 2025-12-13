import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SinglePostScreen({ route, navigation, user }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchPost(); }, []);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/feed/get_post.php?id=${postId}&t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') {
        // --- FIX: Map is_saved ---
        data.data.isLiked = data.data.is_liked == 1;
        data.data.isSaved = data.data.is_saved == 1;
        setPost(data.data);
      } else {
        setErrorMsg(data.message || "Post not found");
      }
    } catch (e) { setErrorMsg("Network Error"); } finally { setLoading(false); }
  };

  const handleLike = async () => {
    setPost(prev => ({ ...prev, isLiked: !prev.isLiked }));
    try {
        await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/like.php', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + user.token },
            body: JSON.stringify({ post_id: postId })
        });
    } catch(e) {}
  };

  const handleSave = async () => {
    setPost(prev => ({ ...prev, isSaved: !prev.isSaved }));
    try {
        await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/save.php', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + user.token },
            body: JSON.stringify({ post_id: postId })
        });
    } catch(e) {}
  };

  const handleDelete = () => {
    Alert.alert("Delete", "Are you sure?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: confirmDelete }]);
  };

  const confirmDelete = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/feed/delete_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
            body: JSON.stringify({ post_id: postId })
        });
        const data = await response.json();
        if(data.status === 'success') navigation.goBack();
    } catch(e) {}
  };

  const openLikesList = () => {
    navigation.navigate('UserList', {
        title: 'Likes',
        endpoint: `interaction/get_likes.php?post_id=${postId}`
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#fff" size="large" /></View>;
  if (!post) return <View style={styles.center}><Text style={{color:'#fff'}}>{errorMsg}</Text></View>;

  const isOwner = post.user_id == user.user.id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {isOwner ? (
            <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>
        ) : ( <View style={{width: 24}} /> )}
      </View>

      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
            {post.avatar_url ? ( <Image source={{ uri: post.avatar_url }} style={{width: 40, height: 40, borderRadius: 20}} /> ) : ( <Text style={{color: '#fff', fontWeight:'bold'}}>{post.display_name.charAt(0)}</Text> )}
        </View>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.username}>{post.display_name}</Text>
          <Text style={styles.school}>UNN • {post.created_at}</Text>
        </View>
      </View>
      
      <Text style={styles.caption}>{post.caption}</Text>
      {post.media_url ? <Image source={{ uri: post.media_url }} style={styles.postImage} resizeMode="cover" /> : null}

      <View style={styles.footer}>
        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={26} color={post.isLiked ? "#E0245E" : "#fff"} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Comments', { postId: post.id })}>
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.likesBtn} onPress={openLikesList}>
                <Text style={styles.likesText}>View Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name={post.isSaved ? "bookmark" : "bookmark-outline"} size={24} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, marginTop: 30, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  username: { fontWeight: 'bold', color: '#fff' },
  school: { color: '#888', fontSize: 12 },
  caption: { fontSize: 16, marginBottom: 10, color: '#ddd', paddingHorizontal: 15 },
  postImage: { width: '100%', height: 350, backgroundColor: '#222' },
  footer: { marginTop: 15, paddingBottom: 50 },
  actionRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#222', paddingTop: 15, gap: 20, paddingHorizontal: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  likesBtn: { marginLeft: 'auto' },
  likesText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  saveBtn: { marginLeft: 20 }
});
