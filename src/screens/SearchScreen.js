import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions, ScrollView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DISCOVERY_IMAGES = [
  { id: 1, uri: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80', height: 250 },
  { id: 2, uri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80', height: 180 },
  { id: 3, uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80', height: 220 },
  { id: 4, uri: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&q=80', height: 200 },
  { id: 5, uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80', height: 240 },
  { id: 6, uri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80', height: 190 },
];

export default function SearchScreen({ user }) {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('For You');

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => { try { const stored = await AsyncStorage.getItem('search_history'); if (stored) setHistory(JSON.parse(stored)); } catch (e) {} };

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const url = `http://127.0.0.1:8080/nexstu/backend/api/v1/users/search.php?q=${text}&t=${Date.now()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') setResults(data.data);
    } catch (error) {} finally { setLoading(false); }
  };

  const saveToHistory = async (text) => { if (!text) return; let newHistory = [text, ...history.filter(h => h !== text)].slice(0, 10); setHistory(newHistory); await AsyncStorage.setItem('search_history', JSON.stringify(newHistory)); };
  const removeFromHistory = async (text) => { const newHistory = history.filter(item => item !== text); setHistory(newHistory); await AsyncStorage.setItem('search_history', JSON.stringify(newHistory)); };
  const handleUserClick = (item) => { saveToHistory(item.name || query); navigation.navigate('PublicProfile', { userId: item.id }); };

  const renderFilterChip = (label) => { 
    const isActive = activeTab === label; 
    return ( 
      <TouchableOpacity 
        style={[styles.chip, { backgroundColor: isActive ? theme.accent : theme.card, borderColor: theme.border }]} 
        onPress={() => setActiveTab(label)}
      > 
        <Text style={[styles.chipText, { color: isActive ? '#000' : theme.textSec, fontWeight: isActive ? 'bold' : '500' }]}>
          {label}
        </Text> 
      </TouchableOpacity> 
    ); 
  };

  const renderDiscoveryGrid = () => (
    <View style={styles.gridContainer}>
      <View style={styles.column}>{DISCOVERY_IMAGES.filter((_, i) => i % 2 === 0).map(img => ( <Image key={img.id} source={{ uri: img.uri }} style={[styles.gridImage, { height: img.height }]} /> ))}</View>
      <View style={styles.column}>{DISCOVERY_IMAGES.filter((_, i) => i % 2 !== 0).map(img => ( <Image key={img.id} source={{ uri: img.uri }} style={[styles.gridImage, { height: img.height }]} /> ))}</View>
    </View>
  );

  const renderResult = ({ item }) => ( 
    <TouchableOpacity style={[styles.userCard, { backgroundColor: theme.card }]} onPress={() => handleUserClick(item)}> 
      <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }} style={styles.avatar} /> 
      <View style={{flex: 1}}> 
        <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text> 
        <Text style={{ color: theme.textSec, fontSize: 12 }}>{item.email}</Text> 
      </View> 
      <Ionicons name="chevron-forward" size={20} color={theme.textSec} /> 
    </TouchableOpacity> 
  );

  const renderHistoryItem = ({ item }) => ( 
    <View style={[styles.historyRow, { borderBottomColor: theme.border }]}> 
      <TouchableOpacity style={{flexDirection:'row', alignItems:'center', flex:1}} onPress={() => { setQuery(item); handleSearch(item); }}> 
        <Ionicons name="time-outline" size={20} color={theme.textSec} style={{marginRight: 15}} /> 
        <Text style={{ color: theme.text, fontSize: 16 }}>{item}</Text> 
      </TouchableOpacity> 
      <TouchableOpacity onPress={() => removeFromHistory(item)}> 
        <Ionicons name="close" size={20} color={theme.textSec} /> 
      </TouchableOpacity> 
    </View> 
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000000' ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { borderBottomColor: theme.border }]}> 
        <Text style={[styles.title, { color: theme.text }]}>SEARCH</Text> 
        <View style={{flexDirection:'row', gap:15}}> 
          <Ionicons name="qr-code-outline" size={22} color={theme.textSec} /> 
          <Ionicons name="options-outline" size={22} color={theme.textSec} /> 
        </View> 
      </View>

      <View style={styles.searchContainer}> 
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Ionicons name="search" size={18} color={theme.textSec} style={{ marginRight: 10 }} /> 
          <TextInput style={{ flex: 1, color: theme.text }} placeholder="Search..." placeholderTextColor={theme.textSec} value={query} onChangeText={handleSearch} /> 
          {query.length > 0 && ( 
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}> 
              <Ionicons name="close-circle" size={18} color={theme.textSec} /> 
            </TouchableOpacity> 
          )} 
        </View> 
      </View>

      {query.length > 0 ? ( 
        <FlatList 
          data={results} 
          renderItem={renderResult} 
          keyExtractor={item => item.id.toString()} 
          contentContainerStyle={{ padding: 15 }} 
        /> 
      ) : ( 
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, paddingLeft: 15 }}> 
            {renderFilterChip('For You')} 
            {renderFilterChip('People')} 
            {renderFilterChip('Trending')} 
            {renderFilterChip('Lecturers')} 
            <View style={{width: 30}} /> 
          </ScrollView> 
          
          {history.length > 0 && activeTab === 'For You' ? ( 
            <View style={{ paddingHorizontal: 15, marginBottom: 20 }}> 
              <Text style={{ color: theme.textSec, fontWeight: 'bold', marginBottom: 10, fontSize: 12 }}>RECENT</Text> 
              {history.map((item, index) => <View key={index}>{renderHistoryItem({ item })}</View>)} 
            </View> 
          ) : null} 
          
          {renderDiscoveryGrid()} 
        </ScrollView> 
      )}
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: Platform.OS === 'android' ? 40 : 10, borderBottomWidth: 1 }, 
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 }, 
  searchContainer: { padding: 15, paddingBottom: 10 }, 
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1 }, 
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 }, 
  chipText: { fontSize: 12 }, 
  gridContainer: { flexDirection: 'row', paddingHorizontal: 10, gap: 10 }, 
  column: { flex: 1, gap: 10 }, 
  gridImage: { width: '100%', borderRadius: 12, backgroundColor: '#333' }, 
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 }, 
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#333' }, 
  userName: { fontWeight: 'bold', fontSize: 14 }, 
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' } 
});
