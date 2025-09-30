import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface SpeakEngDB extends DBSchema {
  conversations: {
    key: string;
    value: {
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
    indexes: {
      'by-timestamp': number;
      'by-synced': boolean;
    };
  };
  progress: {
    key: string;
    value: {
      id: string;
      date: string;
      conversationCount: number;
      totalTimeMinutes: number;
      topicsDiscussed: string[];
      averageFluency: number;
      synced: boolean;
    };
    indexes: {
      'by-date': string;
      'by-synced': boolean;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'speakeng-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SpeakEngDB> | null = null;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<SpeakEngDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SpeakEngDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create conversations store
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', {
          keyPath: 'id',
        });
        conversationStore.createIndex('by-timestamp', 'timestamp');
        conversationStore.createIndex('by-synced', 'synced');
      }

      // Create progress store
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', {
          keyPath: 'id',
        });
        progressStore.createIndex('by-date', 'date');
        progressStore.createIndex('by-synced', 'synced');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', {
          keyPath: 'key',
        });
      }
    },
  });

  return dbInstance;
}

// Conversation operations
export async function saveConversation(conversation: SpeakEngDB['conversations']['value']) {
  const db = await initDB();
  await db.put('conversations', conversation);
}

export async function getConversation(id: string) {
  const db = await initDB();
  return db.get('conversations', id);
}

export async function getAllConversations() {
  const db = await initDB();
  return db.getAll('conversations');
}

export async function getUnsyncedConversations() {
  const db = await initDB();
  return db.getAllFromIndex('conversations', 'by-synced', false);
}

export async function deleteConversation(id: string) {
  const db = await initDB();
  await db.delete('conversations', id);
}

export async function markConversationSynced(id: string) {
  const db = await initDB();
  const conversation = await db.get('conversations', id);
  if (conversation) {
    conversation.synced = true;
    await db.put('conversations', conversation);
  }
}

// Progress operations
export async function saveProgress(progress: SpeakEngDB['progress']['value']) {
  const db = await initDB();
  await db.put('progress', progress);
}

export async function getProgress(id: string) {
  const db = await initDB();
  return db.get('progress', id);
}

export async function getProgressByDate(date: string) {
  const db = await initDB();
  return db.getFromIndex('progress', 'by-date', date);
}

export async function getAllProgress() {
  const db = await initDB();
  return db.getAll('progress');
}

export async function getUnsyncedProgress() {
  const db = await initDB();
  return db.getAllFromIndex('progress', 'by-synced', false);
}

export async function markProgressSynced(id: string) {
  const db = await initDB();
  const progress = await db.get('progress', id);
  if (progress) {
    progress.synced = true;
    await db.put('progress', progress);
  }
}

// Settings operations
export async function saveSetting(key: string, value: unknown) {
  const db = await initDB();
  await db.put('settings', {
    key,
    value,
    updatedAt: Date.now(),
  });
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await initDB();
  const setting = await db.get('settings', key);
  return setting?.value as T | undefined;
}

export async function deleteSetting(key: string) {
  const db = await initDB();
  await db.delete('settings', key);
}

export async function getAllSettings() {
  const db = await initDB();
  return db.getAll('settings');
}

// Sync operations
export async function syncOfflineData() {
  const unsyncedConversations = await getUnsyncedConversations();
  const unsyncedProgress = await getUnsyncedProgress();

  console.log('[DB] Syncing offline data:', {
    conversations: unsyncedConversations.length,
    progress: unsyncedProgress.length,
  });

  // Here you would implement the actual sync logic with your backend
  // For now, we'll just mark them as synced
  for (const conversation of unsyncedConversations) {
    await markConversationSynced(conversation.id);
  }

  for (const progress of unsyncedProgress) {
    await markProgressSynced(progress.id);
  }

  return {
    conversationsSynced: unsyncedConversations.length,
    progressSynced: unsyncedProgress.length,
  };
}

// Clear all data (useful for testing)
export async function clearAllData() {
  const db = await initDB();
  await db.clear('conversations');
  await db.clear('progress');
  await db.clear('settings');
}

// Export database instance for advanced usage
export async function getDB() {
  return initDB();
}