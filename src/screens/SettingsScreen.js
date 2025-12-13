import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext'; // Import Theme Context

export default function SettingsScreen({ navigation, route, user, logout }) {
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext); // Use Global Theme
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => { /* Same logic as before */ };

  const Option = ({ icon, title, onPress, color, rightElement }) => (
    <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon} size={24} color={color || theme.text} style={styles.icon} />
      <Text style={[styles.text, { color: color || theme.text }]}>{title}</Text>
      {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color={theme.textSec} style={{marginLeft:'auto'}} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {/* DARK MODE SWITCH */}
        <Option 
            icon="moon-outline" 
            title="Dark Mode" 
            rightElement={
                <Switch 
                    value={isDarkMode} 
                    onValueChange={toggleTheme} 
                    trackColor={{ false: '#767577', true: theme.accent }}
                    thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                    style={{ marginLeft: 'auto' }}
                />
            }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Option icon="person-outline" title="Edit Profile" onPress={() => navigation.navigate('EditProfile', { token: user.token })} />
        <Option icon="bookmark-outline" title="Saved Posts" onPress={() => navigation.navigate('Saved')} />
        <Option icon="lock-closed-outline" title="Change Password" onPress={() => setModalVisible(true)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <Option icon="log-out-outline" title="Log Out" color="#FF3B30" onPress={logout} />
      </View>

      {/* Password Modal (Same as before) */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
                {/* Inputs ... */}
                <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:20}}>
                    <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{color:theme.textSec}}>Cancel</Text></TouchableOpacity>
                    <Text style={{color:theme.accent}}>Update</Text>
                </View>
            </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  section: { marginTop: 20, paddingHorizontal: 15 },
  sectionTitle: { color: '#666', fontSize: 14, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  icon: { marginRight: 15 },
  text: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});
