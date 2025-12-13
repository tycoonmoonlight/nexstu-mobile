import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen({ user, onPostSuccess, onCancel }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handlePost = async () => {
    if (!caption && !image) return;
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('caption', caption);
      if (image) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('media', { uri: image, name: filename, type });
      }
      const response = await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/posts/create.php', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + user.token },
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') onPostSuccess();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Post</Text>
      <TextInput
        style={styles.input}
        placeholder="What's happening?"
        placeholderTextColor="#666"
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      {image && <Image source={{ uri: image }} style={styles.preview} />}
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
           <Text style={{color: '#007AFF', fontSize: 16}}>📷 Add Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Post</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#000' }, // BLACK BG
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#fff' }, // WHITE TEXT
  input: { 
    height: 100, textAlignVertical: 'top', fontSize: 18, 
    marginBottom: 20, color: '#fff' // WHITE TEXT INPUT
  },
  preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
  actions: { marginBottom: 30, flexDirection: 'row' },
  iconBtn: { padding: 10, borderWidth: 1, borderColor: '#333', borderRadius: 20, marginRight: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, padding: 15, marginRight: 10, alignItems: 'center' },
  postBtn: { flex: 2, backgroundColor: '#fff', padding: 15, borderRadius: 30, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
