export interface Storage {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: Record<string, any>): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export type StorageType = 'local' | 'session' | 'cookie';
