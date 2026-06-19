export * from './interfaces/Storage';
export { default as createStorage } from './StorageFactory';
export { default as LocalStorage } from './implementations/LocalStorage';
export { default as SessionStorage } from './implementations/SessionStorage';
export { default as CookieStorage } from './implementations/CookieStorage';
