import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ route, navigation }) {
  const { currentName, currentBio, currentAvatar, token } = route.params || {};
  const [name, setName] = useState(currentName || '');
  const [bio, setBio] = useState(currentBio || '');
  const [image, setImage] = useState(null); 
  const [displayImage, setDisplayImage] = useState(currentAvatar || null); 
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, 
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset); 
      setDisplayImage(asset.uri); 
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', name);
      formData.append('bio', bio);
      formData.append('token', token); 

      if (image) {
        if (Platform.OS === 'web') {
          const res = await fetch(image.uri);
          const blob = await res.blob();
          const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
          formData.append('avatar', file);
        } else {
          formData.append('avatar', {
            uri: image.uri,
            name: image.uri.split('/').pop(),
            type: 'image/jpeg',
          });
        }
      }

      const response = await fetch('http://127.0.0.1:8080/nexstu/backend/api/v1/profile/update.php', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData,
      });

      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.status === 'success') {
          Alert.alert("Success", "Profile Updated!");
          // FIX: Simply go back to the previous screen
          navigation.goBack();
      } else {
          Alert.alert("Error", data.message);
      }
    } catch (e) { Alert.alert("Error", e.message); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {displayImage ? ( <Image source={{ uri: displayImage }} style={styles.avatar} /> ) : ( <View style={styles.placeholder}><Ionicons name="camera" size={40} color="#666" /></View> )}
        <Text style={styles.changeText}>Change Photo</Text>
      </TouchableOpacity>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#555" />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder="Bio" placeholderTextColor="#555" />
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  placeholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  changeText: { color: '#007AFF', marginTop: 10, fontSize: 16 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#888', marginBottom: 5, marginLeft: 5 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelText: { color: '#FF3B30' }
});
