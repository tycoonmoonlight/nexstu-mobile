import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Log In (Connect to Firebase)
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save minimal info to keep the app logged in when you restart
    const userData = {
      uid: user.uid,
      email: user.email,
      token: await user.getIdToken()
    };
    await saveUser(userData);
    return userData;
  } catch (error) {
    console.error("Firebase Login Error:", error);
    throw error;
  }
};

// 2. Log Out (Tell Firebase to end session)
export const logoutUser = async () => {
  try {
    await signOut(auth);
    await removeUser();
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// --- Helper Functions for Local Storage (Keeping you logged in) ---

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.log('Error saving user', error);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.log('Error getting user', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.log('Error removing user', error);
  }
};
