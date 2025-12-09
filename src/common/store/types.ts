import { Connection } from '@common/db/types';
import { Settings } from '@common/settings/types';

export type StoreSchema = {
  settings: Settings;
  saved_connections: Connection[];
};
