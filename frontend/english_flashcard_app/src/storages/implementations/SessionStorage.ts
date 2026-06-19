import { Storage } from '../interfaces/Storage';

export class SessionStorage implements Storage {
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    window.sessionStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    window.sessionStorage.clear();
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k) keys.push(k);
    }
    return keys;
  }
}

export default SessionStorage;
