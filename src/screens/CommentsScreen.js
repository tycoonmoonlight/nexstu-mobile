import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CommentsScreen({ route, navigation, user }) {
  const { postId } = route.params; 
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/get_comments.php?post_id=${postId}&t=${Date.now()}`);
      const data = await response.json();
      if (data.status === 'success') {
        setComments(data.data);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const handlePostComment = async () => {
    if (!text.trim()) return;

    const commentToSend = text;
    setText(''); // Clear input immediately

    // Optimistic Update
    const newComment = {
      id: Date.now(),
      display_name: 'Me',
      comment: commentToSend,
      avatar_url: null 
    };
    setComments([...comments, newComment]);

    try {
      await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/interaction/comment.php', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + user.token 
        },
        body: JSON.stringify({ post_id: postId, comment: commentToSend })
      });
      // Silent refresh to sync IDs
      fetchComments();
    } catch (error) {
      console.log("Failed to post");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentRow}>
      <View style={styles.avatar}>
        {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatarImg} />
        ) : (
            <Text style={styles.avatarText}>{item.display_name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.bubble}>
        <Text style={styles.name}>{item.display_name}</Text>
        <Text style={styles.text}>{item.comment}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* List */}
      {loading ? <ActivityIndicator color="#fff" style={{marginTop: 20}} /> : (
        <FlatList 
            data={comments}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 15 }}
            ListEmptyComponent={<Text style={styles.empty}>No comments yet.</Text>}
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput 
            style={styles.input} 
            value={text} 
            onChangeText={setText} 
            placeholder="" 
            placeholderTextColor="#666"
            multiline
        />
        <TouchableOpacity onPress={handlePostComment} style={styles.sendIcon}>
            <Ionicons name="arrow-up-circle" size={34} color={text.trim() ? "#007AFF" : "#444"} />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#222', marginTop: 30 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  commentRow: { flexDirection: 'row', marginBottom: 20 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  bubble: { flex: 1, backgroundColor: '#121212', padding: 10, borderRadius: 15, borderTopLeftRadius: 2 },
  name: { color: '#888', fontSize: 11, marginBottom: 2, fontWeight: 'bold' },
  text: { color: '#fff', fontSize: 14 },
  
  empty: { color: '#666', textAlign: 'center', marginTop: 50 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#222', backgroundColor: '#000' },
  input: { flex: 1, color: '#fff', backgroundColor: '#222', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, maxHeight: 100, fontSize: 16 },
  sendIcon: { padding: 2 }
});
