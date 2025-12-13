import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SavedScreen({ navigation, user }) {
  const { theme } = useContext(ThemeContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.token) fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/profile/get_saved.php?t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') setPosts(data.data);
    } catch (e) {} finally { setLoading(false); }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.gridItem, { borderColor: theme.bg }]} onPress={() => navigation.navigate('SinglePost', { postId: item.id })}>
      {item.media_url ? <Image source={{ uri: item.media_url }} style={styles.img} /> : <View style={[styles.placeholder, { backgroundColor: theme.card }]}><Text style={{color: theme.textSec, fontSize: 10}}>{item.caption}</Text></View>}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Saved</Text>
        <View style={{width: 24}} />
      </View>
      {loading ? <ActivityIndicator color={theme.accent} style={{marginTop: 20}} /> : <FlatList data={posts} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} numColumns={3} />}
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, paddingTop: 40 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 }, title: { fontSize: 18, fontWeight: 'bold' }, gridItem: { width: width/3, height: width/3, borderWidth: 1 }, img: { width: '100%', height: '100%' }, placeholder: { flex: 1, justifyContent: 'center', padding: 5, alignItems: 'center' } });
