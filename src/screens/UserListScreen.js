import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserListScreen({ route, navigation }) {
  // Now accepts an 'endpoint' prop for flexibility
  const { title, endpoint } = route.params; 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Use the custom endpoint passed from the previous screen
      const url = `http://127.0.0.1:8080/nexstu/backend/api/v1/${endpoint}&t=${Date.now()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.userItem}
        onPress={() => navigation.push('PublicProfile', { userId: item.id })}
    >
      <View style={styles.avatar}>
        {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatarImg} />
        ) : (
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <Text style={styles.userName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? <ActivityIndicator color="#fff" style={{marginTop: 20}} /> : (
        <FlatList 
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.empty}>List is empty.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#1a1a1a' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 }
});
