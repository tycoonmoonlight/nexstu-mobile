import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/ThemeContext';

export default function ChatScreen({ user, route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const { receiverId, receiverName, receiverAvatar, initialMessage } = route.params || {};
  const displayName = receiverName || `Student`;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(initialMessage || '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const url = `http://127.0.0.1:8080/nexstu/backend/api/v1/chat/get.php?u1=${user.user.id}&u2=${receiverId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(data.data);
      }
    } catch (error) {}
  };

  const sendMessage = async (imageUrl = null) => {
    if (!text.trim() && !imageUrl) return;
    
    // Optimistic Update
    const newMsg = { id: Date.now(), sender_id: user.user.id, message: text, media_url: imageUrl ? imageUrl.uri : null, is_read: 0 };
    setMessages(prev => [...prev, newMsg]);
    
    const msgToSend = text;
    setText(''); 

    try {
        const formData = new FormData();
        formData.append('sender_id', user.user.id);
        formData.append('receiver_id', receiverId);
        formData.append('message', msgToSend);
        
        if (imageUrl) {
            setUploading(true);
            if (Platform.OS === 'web') {
                const res = await fetch(imageUrl.uri);
                const blob = await res.blob();
                formData.append('image', new File([blob], "chat.jpg", { type: "image/jpeg" }));
            } else {
                formData.append('image', { uri: imageUrl.uri, name: 'chat.jpg', type: 'image/jpeg' });
            }
        }

        await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/chat/send.php', {
            method: 'POST',
            body: imageUrl ? formData : JSON.stringify({ sender_id: user.user.id, receiver_id: receiverId, message: msgToSend }),
            headers: imageUrl ? {} : { 'Content-Type': 'application/json' }
        });
        setUploading(false);
        fetchMessages();
    } catch(e) { console.log(e); }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.canceled) sendMessage(result.assets[0]);
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender_id == user.user.id;
    return (
      <View style={[styles.bubbleWrapper, isMe ? {alignItems:'flex-end'} : {alignItems:'flex-start'}]}>
        <View style={[styles.bubble, isMe ? styles.me : styles.them, { backgroundColor: isMe ? theme.accent : theme.card }]}>
            {item.media_url ? <Image source={{ uri: item.media_url }} style={styles.msgImage} resizeMode="cover" /> : null}
            {item.message ? <Text style={[styles.msgText, { color: isMe ? '#000' : theme.text }]}>{item.message}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Image source={{ uri: receiverAvatar || 'https://via.placeholder.com/40' }} style={styles.headerAvatar} />
            <View>
                <Text style={[styles.title, { color: theme.text }]}>{displayName}</Text>
                <Text style={{ color: theme.textSec, fontSize: 10 }}>Active now</Text>
            </View>
        </View>
      </View>

      <FlatList data={messages} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: 15 }} />

      <View style={[styles.inputContainer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        <TouchableOpacity onPress={pickImage} style={[styles.iconBtn, { backgroundColor: theme.card }]}>
            <Ionicons name="add" size={24} color={theme.textSec} />
        </TouchableOpacity>
        <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
            <TextInput style={[styles.input, { color: theme.text }]} value={text} onChangeText={setText} placeholder="Message..." placeholderTextColor={theme.textSec} />
        </View>
        <TouchableOpacity onPress={() => sendMessage(null)}>
            {uploading ? <ActivityIndicator color={theme.accent} /> : <Ionicons name="send" size={24} color={theme.accent} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 30, borderBottomWidth: 1 },
  headerAvatar: { width: 35, height: 35, borderRadius: 17.5, marginRight: 10 },
  title: { fontSize: 16, fontWeight: 'bold' },
  bubbleWrapper: { marginBottom: 10, width: '100%' },
  bubble: { padding: 12, borderRadius: 18, maxWidth: '75%' },
  me: { borderTopRightRadius: 2 },
  them: { borderTopLeftRadius: 2 },
  msgText: { fontSize: 14 },
  msgImage: { width: 200, height: 150, borderRadius: 10, marginBottom: 5 },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1 },
  iconBtn: { padding: 8, borderRadius: 20, marginRight: 10 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  input: { flex: 1, marginRight: 10 },
});
