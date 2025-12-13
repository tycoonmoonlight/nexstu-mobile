import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'nexstu_user_data';

// Helper to decide which storage to use
const isWeb = Platform.OS === 'web';

// 1. Save User Data
export async function saveUser(userData) {
  try {
    const value = JSON.stringify(userData);
    if (isWeb) {
      // Use Browser Storage
      localStorage.setItem(KEY, value);
    } else {
      // Use Phone Secure Storage
      await SecureStore.setItemAsync(KEY, value);
    }
  } catch (error) {
    console.log("Error saving user:", error);
  }
}

// 2. Get User Data
export async function getUser() {
  try {
    if (isWeb) {
      // Get from Browser
      const value = localStorage.getItem(KEY);
      return value ? JSON.parse(value) : null;
    } else {
      // Get from Phone
      const value = await SecureStore.getItemAsync(KEY);
      return value ? JSON.parse(value) : null;
    }
  } catch (error) {
    console.log("Error getting user:", error);
    return null;
  }
}

// 3. Delete User Data
export async function removeUser() {
  try {
    if (isWeb) {
      localStorage.removeItem(KEY);
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  } catch (error) {
    console.log("Error removing user:", error);
  }
}
