import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function GroupsScreen({ navigation, user }) {
  const { theme } = useContext(ThemeContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/groups/list.php?t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') setGroups(data.data);
    } catch (e) {} finally { setLoading(false); }
  };

  const handleCreate = async () => {
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
            fetchGroups(); // Refresh list
            Alert.alert("Success", "Community Created!");
        } else {
            Alert.alert("Error", data.message || "Failed to create group");
        }
    } catch(e) {
        Alert.alert("Network Error", "Could not connect to server");
    } finally {
        setCreating(false);
    }
  };

  const handleJoin = async (groupId) => {
    // Optimistic UI update could go here, but let's stick to reliable fetch for now
    try {
        await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/groups/join.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
            body: JSON.stringify({ group_id: groupId })
        });
        fetchGroups();
    } catch(e) {}
  };

  const openGroupChat = (group) => {
    if(group.is_member == 1) {
        navigation.navigate('Chat', { 
            isGroup: true, 
            receiverId: group.id, 
            receiverName: group.name, 
            receiverAvatar: group.icon_url 
        });
    } else {
        Alert.alert("Join First", "You must join this community to chat.");
    }
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={() => openGroupChat(item)}>
        <Image source={{ uri: item.icon_url }} style={styles.icon} />
        <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={{ color: theme.textSec, fontSize: 12 }}>{item.member_count} members</Text>
        </View>
        <TouchableOpacity 
            style={[styles.btn, { backgroundColor: item.is_member == 1 ? theme.card : theme.accent, borderColor: theme.accent, borderWidth: 1 }]}
            onPress={() => handleJoin(item.id)}
        >
            <Text style={{ color: item.is_member == 1 ? theme.accent : '#000', fontWeight: 'bold', fontSize: 12 }}>
                {item.is_member == 1 ? 'Joined' : 'Join'}
            </Text>
        </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000000' ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>COMMUNITIES</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={30} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={theme.accent} style={{marginTop: 50}} /> : (
        <FlatList 
            data={groups}
            renderItem={renderGroup}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ padding: 15 }}
            ListEmptyComponent={<Text style={{color:theme.textSec, textAlign:'center', marginTop:50}}>No communities yet. Start one!</Text>}
        />
      )}

      {/* CREATE GROUP MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Create Community</Text>
                
                <Text style={{color: theme.textSec, alignSelf: 'flex-start', marginBottom: 5, fontSize: 12}}>Name</Text>
                <TextInput 
                    placeholder="e.g. Computer Science 400L" 
                    placeholderTextColor="#666" 
                    style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]} 
                    value={newGroupName} 
                    onChangeText={setNewGroupName} 
                />
                
                <Text style={{color: theme.textSec, alignSelf: 'flex-start', marginBottom: 5, fontSize: 12}}>Description</Text>
                <TextInput 
                    placeholder="What is this group about?" 
                    placeholderTextColor="#666" 
                    style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]} 
                    value={newGroupDesc} 
                    onChangeText={setNewGroupDesc} 
                />
                
                <TouchableOpacity onPress={handleCreate} disabled={creating} style={[styles.createBtn, { backgroundColor: theme.accent }]}>
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
  container: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10 },
  icon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
  name: { fontWeight: 'bold', fontSize: 16 },
  btn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  createBtn: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }
});
