import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/** Keychain on iPhone and Keystore on Android; the web preview falls back to browser storage. */
const web = Platform.OS === "web";

export const getSecure = (key: string) => (web ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key));

export const setSecure = (key: string, value: string) =>
  web ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);

export const deleteSecure = (key: string) => (web ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key));
