import { useEffect, useState } from 'react';
import {
  initDB,
  saveConversation,
  getAllConversations,
  saveProgress,
  getAllProgress,
  saveSetting,
  getSetting,
  syncOfflineData,
} from '@/lib/db';

// Type definitions for our database records
type Conversation = {
  id: string;
  timestamp: number;
  topic: string;
  userMessage: string;
  aiResponse: string;
  analysis?: {
    grammar: string[];
    vocabulary: string[];
    fluency: number;
    suggestions: string[];
  };
  synced: boolean;
};

type Progress = {
  id: string;
  date: string;
  conversationCount: number;
  totalTimeMinutes: number;
  topicsDiscussed: string[];
  averageFluency: number;
  synced: boolean;
};

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initialize database
    initDB().catch(console.error);

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[Storage] Back online, syncing data...');
      setIsOnline(true);
      handleSync();
    };

    const handleOffline = () => {
      console.log('[Storage] Went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      const result = await syncOfflineData();
      console.log('[Storage] Sync complete:', result);
    } catch (error) {
      console.error('[Storage] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    saveConversation,
    getAllConversations,
    saveProgress,
    getAllProgress,
    saveSetting,
    getSetting,
    syncNow: handleSync,
  };
}

// Hook for managing conversations
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getAllConversations();
      setConversations(data);
    } catch (error) {
      console.error('[Storage] Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addConversation = async (conversation: Conversation) => {
    try {
      await saveConversation(conversation);
      await loadConversations();
    } catch (error) {
      console.error('[Storage] Failed to save conversation:', error);
      throw error;
    }
  };

  return {
    conversations,
    loading,
    addConversation,
    refresh: loadConversations,
  };
}

// Hook for managing progress
export function useProgress() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await getAllProgress();
      setProgress(data);
    } catch (error) {
      console.error('[Storage] Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProgress = async (newProgress: Progress) => {
    try {
      await saveProgress(newProgress);
      await loadProgress();
    } catch (error) {
      console.error('[Storage] Failed to save progress:', error);
      throw error;
    }
  };

  return {
    progress,
    loading,
    addProgress,
    refresh: loadProgress,
  };
}

// Hook for managing settings
export function useSettings<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting();
  }, [key]);

  const loadSetting = async () => {
    try {
      const storedValue = await getSetting<T>(key);
      if (storedValue !== undefined) {
        setValue(storedValue);
      }
    } catch (error) {
      console.error('[Storage] Failed to load setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (newValue: T) => {
    try {
      await saveSetting(key, newValue);
      setValue(newValue);
    } catch (error) {
      console.error('[Storage] Failed to save setting:', error);
      throw error;
    }
  };

  return {
    value,
    loading,
    updateSetting,
  };
}