import { AISettings } from '@common/ai/types';
import { Connection } from '@common/db/types';

export type StoreSchema = {
  ai_settings: AISettings;
  saved_connections: Connection[];
};
