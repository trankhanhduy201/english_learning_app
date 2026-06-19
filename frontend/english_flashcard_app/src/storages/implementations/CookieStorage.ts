import Cookies from "js-cookie";
import { Storage } from '../interfaces/Storage';

export interface CookieOptions {
  days?: number; // expiration in days
  path?: string;
  secure?: boolean;
}

export class CookieStorage implements Storage {
  private defaultPath = '/';

  async get<T = any>(key: string): Promise<T | null> {
    const raw = Cookies.get(key);
    if (raw === undefined) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return (raw as unknown) as T;
    }
  }

  async set<T = any>(key: string, value: T, options?: CookieOptions): Promise<void> {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    const attrs: any = {};
    if (options?.days !== undefined) attrs.expires = options.days;
    attrs.path = options?.path ?? this.defaultPath;
    if (options?.secure) attrs.secure = true;
    Cookies.set(key, String(raw), attrs);
  }

  async remove(key: string): Promise<void> {
    Cookies.remove(key, { path: this.defaultPath });
  }

  async clear(): Promise<void> {
    const all = Cookies.get();
    for (const name of Object.keys(all)) {
      Cookies.remove(name, { path: this.defaultPath });
    }
  }

  async keys(): Promise<string[]> {
    const all = Cookies.get();
    return Object.keys(all);
  }
}

export default CookieStorage;
