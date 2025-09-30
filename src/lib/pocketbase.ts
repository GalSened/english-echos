import PocketBase from 'pocketbase';
import { config } from '@/config';

export const pb = new PocketBase(config.pocketbaseUrl);

// Disable auto-cancellation for better reliability
pb.autoCancellation(false);

// Types
export interface Conversation {
  id?: string;
  session_id: string;
  topic: string;
  user_name: string;
  user_level: 'beginner' | 'intermediate' | 'advanced';
  messages: Array<{
    id: string;
    text: string;
    isTeacher: boolean;
    timestamp: Date;
    correction?: any;
  }>;
  started_at: Date;
  ended_at?: Date;
  created?: string;
  updated?: string;
}

export interface Analysis {
  id?: string;
  conversation_id: string;
  analysis_data: any;
  created_at: Date;
  created?: string;
  updated?: string;
}

export interface Topic {
  id?: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_custom: boolean;
  created?: string;
  updated?: string;
}

// API Functions
export const conversationService = {
  create: async (data: Omit<Conversation, 'id' | 'created' | 'updated'>) => {
    try {
      return await pb.collection('conversations').create(data);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Conversation>) => {
    try {
      return await pb.collection('conversations').update(id, data);
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      return await pb.collection('conversations').getOne(id);
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  list: async (filter?: string, limit: number = 50) => {
    try {
      return await pb.collection('conversations').getList(1, limit, {
        filter: filter || '',
        sort: '-created',
      });
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      return await pb.collection('conversations').delete(id);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },
};

export const analysisService = {
  create: async (data: Omit<Analysis, 'id' | 'created' | 'updated'>) => {
    try {
      return await pb.collection('analyses').create(data);
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  },

  getByConversationId: async (conversationId: string) => {
    try {
      return await pb.collection('analyses').getFirstListItem(`conversation_id="${conversationId}"`);
    } catch (error) {
      console.error('Error getting analysis:', error);
      throw error;
    }
  },

  list: async (filter?: string) => {
    try {
      return await pb.collection('analyses').getList(1, 50, {
        filter: filter || '',
        sort: '-created',
      });
    } catch (error) {
      console.error('Error listing analyses:', error);
      throw error;
    }
  },
};

export const topicService = {
  list: async (level?: string) => {
    try {
      return await pb.collection('topics').getList(1, 100, {
        filter: level ? `level="${level}"` : '',
        sort: 'title',
      });
    } catch (error) {
      console.error('Error listing topics:', error);
      throw error;
    }
  },

  create: async (data: Omit<Topic, 'id' | 'created' | 'updated'>) => {
    try {
      return await pb.collection('topics').create(data);
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      return await pb.collection('topics').delete(id);
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  },
};

// Health check
export const checkPocketBaseConnection = async (): Promise<boolean> => {
  try {
    await pb.health.check();
    return true;
  } catch (error) {
    console.error('PocketBase health check failed:', error);
    return false;
  }
};

export default pb;