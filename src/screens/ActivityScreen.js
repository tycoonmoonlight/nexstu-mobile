import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, SectionList, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function ActivityScreen({ user }) {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/nexstu/backend/api/v1/notifications/get.php?t=${Date.now()}`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      });
      const data = await response.json();
      if (data.status === 'success') {
        const grouped = [
            { title: 'New', data: data.data.slice(0, 2) },
            { title: 'Today', data: data.data.slice(2, 5) },
            { title: 'This Week', data: data.data.slice(5) }
        ].filter(section => section.data.length > 0);
        
        setNotifications(grouped);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const handleItemPress = (item) => {
    if (item.type === 'follow') {
        navigation.navigate('PublicProfile', { userId: item.actor_id });
    }
    else if ((item.type === 'like' || item.type === 'comment') && item.post_id) {
        navigation.navigate('SinglePost', { postId: item.post_id });
    }
    else if (item.actor_id) {
        navigation.navigate('PublicProfile', { userId: item.actor_id });
    }
  };

  const renderFilterChip = (label) => {
    const isActive = activeFilter === label;
    return (
      <TouchableOpacity 
        style={[styles.chip, { backgroundColor: isActive ? '#fff' : theme.card, borderColor: isActive ? '#fff' : theme.border, borderWidth: 1 }]}
        onPress={() => setActiveFilter(label)}
      >
        <Text style={[styles.chipText, { color: isActive ? '#000' : theme.textSec, fontWeight: isActive ? 'bold' : '500' }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    let iconName = 'notifications';
    let iconColor = theme.accent;
    let rightContent = null;

    if (item.type === 'like') {
        iconName = 'heart'; iconColor = '#EF4444';
        rightContent = <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.postThumb} />;
    } else if (item.type === 'follow') {
        iconName = 'person-add'; iconColor = '#3B82F6';
        rightContent = (
            <TouchableOpacity style={[styles.followBtn, { backgroundColor: theme.accent }]}>
                <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
        );
    } else if (item.type === 'comment') {
        iconName = 'chatbubble'; iconColor = '#10B981';
        rightContent = <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.postThumb} />;
    }

    return (
      <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.itemContainer}>
        <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }} style={styles.avatar} />
            <View style={[styles.iconBadge, { backgroundColor: theme.bg }]}> 
                <View style={[styles.iconInner, { backgroundColor: iconColor }]}>
                    <Ionicons name={iconName} size={10} color="#fff" />
                </View>
            </View>
        </View>

        <View style={styles.textContainer}>
            <Text style={{color: theme.text, fontSize: 13}}>
                <Text style={{fontWeight: 'bold'}}>{item.display_name}</Text> {item.message}
            </Text>
            <Text style={{color: theme.textSec, fontSize: 11, marginTop: 2}}>{item.created_at}</Text>
        </View>

        <View style={styles.rightSide}>{rightContent}</View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={[styles.sectionTitle, { color: theme.textSec }]}>{title}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000000' ? "light-content" : "dark-content"} />
      
      {/* HEADER WITH BACK ARROW */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Feed')} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.text }]}>NOTIFICATIONS</Text>
        
        <View style={{flexDirection:'row', gap:15, marginLeft: 'auto'}}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.textSec} />
            <Ionicons name="notifications" size={22} color={theme.accent} />
        </View>
      </View>

      <View style={{ paddingVertical: 15, paddingHorizontal: 15 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
            {renderFilterChip('All')}
            {renderFilterChip('Mentions')}
            {renderFilterChip('System')}
        </View>
      </View>

      {loading ? <ActivityIndicator color={theme.accent} style={{marginTop: 50}} /> : (
        <SectionList
            sections={notifications}
            keyExtractor={(item, index) => item.id + index}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 15 }}
            ListEmptyComponent={<Text style={{color:theme.textSec, textAlign:'center', marginTop:50}}>No notifications yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: 40, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  
  chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12 },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  
  itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333' },
  
  iconBadge: { position: 'absolute', bottom: -2, right: -2, padding: 2, borderRadius: 10 },
  iconInner: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

  textContainer: { flex: 1, marginRight: 10 },
  
  rightSide: { marginLeft: 'auto' },
  postThumb: { width: 44, height: 44, borderRadius: 6, backgroundColor: '#333' },
  followBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  followText: { color: '#000', fontSize: 11, fontWeight: 'bold' }
});
