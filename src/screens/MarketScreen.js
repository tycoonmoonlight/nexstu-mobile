import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, TextInput, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function MarketScreen({ navigation, user }) {
  const { theme } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/market/list.php?t=${Date.now()}`);
      const data = await response.json();
      if (data.status === 'success') setItems(data.data);
    } catch (e) {} finally { setLoading(false); }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSell = async () => {
    if (!title || !price || !image) return Alert.alert("Error", "Fill all fields");
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('token', user.token);
    formData.append('image', { uri: image.uri, name: 'prod.jpg', type: 'image/jpeg' });

    try {
        await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/market/add.php', {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + user.token },
            body: formData
        });
        setModalVisible(false);
        fetchItems();
    } catch(e) { Alert.alert("Error", "Network failed"); } 
    finally { setUploading(false); }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Chat', { receiverId: item.seller_id, receiverName: item.full_name })}>
        <Image source={{ uri: item.image_url }} style={styles.img} />
        <View style={styles.info}>
            <Text style={[styles.price, { color: theme.text }]}>₦{item.price}</Text>
            <Text style={[styles.name, { color: theme.textSec }]}>{item.title}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>MARKET</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}><Ionicons name="add-circle" size={28} color={theme.accent} /></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator color={theme.accent} /> : <FlatList data={items} renderItem={renderItem} keyExtractor={item => item.id.toString()} numColumns={2} />}
      
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBg}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <TouchableOpacity onPress={pickImage} style={styles.imgPick}>{image ? <Image source={{ uri: image.uri }} style={styles.prev} /> : <Ionicons name="camera" size={40} color="#666" />}</TouchableOpacity>
                <TextInput placeholder="Title" placeholderTextColor="#666" style={[styles.input, {color:theme.text, backgroundColor:theme.bg}]} value={title} onChangeText={setTitle} />
                <TextInput placeholder="Price" placeholderTextColor="#666" style={[styles.input, {color:theme.text, backgroundColor:theme.bg}]} value={price} onChangeText={setPrice} />
                <TouchableOpacity onPress={handleSell} style={[styles.btn, { backgroundColor: theme.accent }]}>{uploading ? <ActivityIndicator /> : <Text style={{fontWeight:'bold'}}>Sell</Text>}</TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop:15}}><Text style={{color:'#666'}}>Cancel</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '900' },
  card: { flex: 1, margin: 5, borderRadius: 10, overflow: 'hidden' },
  img: { width: '100%', height: 150 },
  info: { padding: 10 },
  price: { fontWeight: 'bold' },
  modalBg: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { padding: 20, borderRadius: 15, alignItems: 'center' },
  imgPick: { width: 100, height: 100, backgroundColor: '#222', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  prev: { width: '100%', height: '100%', borderRadius: 10 },
  input: { width: '100%', padding: 12, borderRadius: 8, marginBottom: 10 },
  btn: { width: '100%', padding: 15, borderRadius: 8, alignItems: 'center' }
});
