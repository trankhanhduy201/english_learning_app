import { Storage, StorageType } from './interfaces/Storage';
import LocalStorage from './implementations/LocalStorage';
import SessionStorage from './implementations/SessionStorage';
import CookieStorage, { CookieOptions } from './implementations/CookieStorage';

export interface FactoryOptions {
  // cookie-specific options
  cookieOptions?: CookieOptions;
}

export function createStorage(type: StorageType, options?: FactoryOptions): Storage {
  switch (type) {
    case 'local':
      return new LocalStorage();
    case 'session':
      return new SessionStorage();
    case 'cookie':
      return new CookieStorage();
    default:
      return new LocalStorage();
  }
}

export default createStorage;
