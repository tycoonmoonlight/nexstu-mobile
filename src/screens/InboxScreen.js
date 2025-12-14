import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, Modal, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

export default function InboxScreen({ user }) {
  const { theme } = useContext(ThemeContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // Track errors
  
  // Group Creation
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    setErrorMsg(null);
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/chat/list.php?t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setChats(data.data);
      } else {
        setErrorMsg(data.message || "Failed to load chats");
      }
    } catch (e) { 
        console.log("Fetch Error:", e);
        setErrorMsg("Network Error: Could not connect to server on Web."); 
    } finally { setLoading(false); }
  };

  const handleCreateGroup = async () => {
    if(!newGroupName.trim()) {
        Alert.alert("Error", "Please enter a group name");
        return;
    }
    setCreating(true);
    try {
        const response = await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/groups/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
            body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            setModalVisible(false);
            setNewGroupName(''); 
            setNewGroupDesc('');
            Alert.alert("Success", "Community Created!");
            fetchChats(); 
        } else {
            Alert.alert("Error", data.message || "Failed to create group");
        }
    } catch(e) {
        Alert.alert("Network Error", "Check your connection");
    } finally {
        setCreating(false);
    }
  };

  const openChat = (item) => {
    navigation.navigate('Chat', { 
        receiverId: item.user_id, 
        receiverName: item.display_name, 
        receiverAvatar: item.avatar_url,
        isGroup: item.type === 'group'
    });
  };

  // --- RENDERERS ---

  const renderOnlineUser = ({ item }) => (
    <TouchableOpacity style={styles.onlineUserContainer} onPress={() => openChat(item)}>
        <View>
            <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }} style={styles.onlineAvatar} />
            {item.type !== 'group' && <View style={styles.activeDot} />}
        </View>
        <Text style={[styles.onlineName, { color: theme.textSec }]} numberOfLines={1}>
            {item.display_name ? item.display_name.split(' ')[0] : 'User'}
        </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => openChat(item)}>
        <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.text }]}>{item.display_name}</Text>
            <Text style={[styles.msg, { color: theme.textSec }]} numberOfLines={1}>{item.message}</Text>
        </View>
        {item.type === 'group' && <Ionicons name="people" size={14} color={theme.textSec} style={{marginRight:5}} />}
        <View style={[styles.dot, { backgroundColor: parseInt(item.unread_count) > 0 ? '#FACC15' : 'transparent' }]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000000' ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>MESSAGES</Text>
        </View>
        
        <View style={{flexDirection:'row', gap:15}}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="people-circle-outline" size={28} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="create-outline" size={24} color={theme.textSec} />
            </TouchableOpacity>
        </View>
      </View>

      {/* ONLINE RAIL */}
      <View style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <FlatList 
            data={chats.slice(0, 10)} 
            horizontal 
            showsHorizontalScrollIndicator={false}
            renderItem={renderOnlineUser}
            keyExtractor={(item, index) => 'online_' + index.toString()}
            contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      {/* CHAT LIST AREA */}
      <View style={{ flex: 1 }}>
        {loading ? (
            <ActivityIndicator color={theme.accent} style={{marginTop: 50}} />
        ) : errorMsg ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 10 }}>{errorMsg}</Text>
                <TouchableOpacity onPress={fetchChats} style={{ padding: 10, backgroundColor: theme.card, borderRadius: 5 }}>
                    <Text style={{ color: theme.text }}>Retry</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <FlatList 
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item, index) => 'chat_' + index.toString()}
                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
                ListEmptyComponent={<Text style={{color:theme.textSec, textAlign:'center', marginTop:50}}>No conversations found.</Text>}
            />
        )}
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>New Community</Text>
                <TextInput placeholder="Group Name" placeholderTextColor="#666" style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]} value={newGroupName} onChangeText={setNewGroupName} />
                <TextInput placeholder="Description" placeholderTextColor="#666" style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]} value={newGroupDesc} onChangeText={setNewGroupDesc} />
                <TouchableOpacity onPress={handleCreateGroup} disabled={creating} style={[styles.createBtn, { backgroundColor: theme.accent }]}>
                    {creating ? <ActivityIndicator color="#000" /> : <Text style={{fontWeight:'bold', color:'#000'}}>Create</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}>
                    <Text style={{color: theme.textSec}}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  // WEB FIX: Ensure height is 100% so it doesn't collapse
  container: { flex: 1, paddingTop: 40, height: '100%' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, marginBottom: 0 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  onlineUserContainer: { alignItems: 'center', marginRight: 15, width: 60 },
  onlineAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#333' },
  activeDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#000' },
  onlineName: { fontSize: 10, marginTop: 4, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#333' },
  name: { fontWeight: 'bold', fontSize: 16 },
  msg: { marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  createBtn: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }
});
