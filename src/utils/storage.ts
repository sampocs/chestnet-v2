import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData } from '../types';

const STORAGE_KEY = '@chestnut/app-data';

const DEFAULT_APP_DATA: AppData = {
  weeks: {},
  defaultBudget: 400,
};

export async function loadAppData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_APP_DATA;
  return JSON.parse(raw) as AppData;
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
