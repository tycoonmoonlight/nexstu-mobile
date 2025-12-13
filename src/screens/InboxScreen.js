import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

export default function InboxScreen({ user }) {
  const { theme } = useContext(ThemeContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const navigation = useNavigation();

  // Force fetch every time screen opens
  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/chat/list.php?t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setChats(data.data);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const handleCreateGroup = async () => {
    if(!newGroupName.trim()) { Alert.alert("Error", "Name required"); return; }
    setCreating(true);
    try {
        const response = await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/groups/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
            body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
        });
        const data = await response.json();
        if (data.status === 'success') {
            setModalVisible(false); setNewGroupName(''); setNewGroupDesc('');
            Alert.alert("Success", "Group Created");
            fetchChats();
        } else {
            Alert.alert("Error", data.message);
        }
    } catch(e) { Alert.alert("Error", "Network Failed"); } 
    finally { setCreating(false); }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Chat', { 
        receiverId: item.user_id, 
        receiverName: item.display_name, 
        receiverAvatar: item.avatar_url,
        isGroup: item.type === 'group'
    })}>
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.text }]}>{item.display_name}</Text>
            <Text style={[styles.msg, { color: theme.textSec }]} numberOfLines={1}>{item.message}</Text>
        </View>
        <View style={[styles.dot, { backgroundColor: parseInt(item.unread_count)>0 ? '#FACC15' : 'transparent' }]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>MESSAGES</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}><Ionicons name="people-circle-outline" size={28} color={theme.accent} /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={theme.accent} style={{marginTop: 50}} /> : 
        <FlatList data={chats} renderItem={renderItem} keyExtractor={item => item.user_id.toString()} contentContainerStyle={{ paddingHorizontal: 15 }} ListEmptyComponent={<Text style={{color:theme.textSec, textAlign:'center', marginTop:50}}>No chats yet.</Text>} />
      }

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBg}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.title, { color: theme.text, marginBottom: 20 }]}>New Group</Text>
                <TextInput placeholder="Group Name" placeholderTextColor="#666" style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]} value={newGroupName} onChangeText={setNewGroupName} />
                <TextInput placeholder="Description" placeholderTextColor="#666" style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]} value={newGroupDesc} onChangeText={setNewGroupDesc} />
                <TouchableOpacity onPress={handleCreateGroup} style={[styles.btn, { backgroundColor: theme.accent }]}>{creating ? <ActivityIndicator color="#000"/> : <Text style={{fontWeight:'bold'}}>Create</Text>}</TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}><Text style={{color: theme.textSec}}>Cancel</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  item: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#333' },
  name: { fontWeight: 'bold', fontSize: 16 },
  msg: { marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 20, alignItems: 'center' },
  input: { width: '100%', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  btn: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' }
});
