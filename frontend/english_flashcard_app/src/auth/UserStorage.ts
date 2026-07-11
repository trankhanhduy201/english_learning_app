import type { Storage } from "storages";
import type { UserInfo } from "./types";
import { USER_INFO_KEY } from "./constants";

export interface IUserStorage {
  setUser(user: UserInfo | null): Promise<void>;
  getUser(): Promise<UserInfo | null>;
  clearUser(): Promise<void>;
}

export class UserStorage implements IUserStorage {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async setUser(user: UserInfo | null): Promise<void> {
    if (user === null) {
      await this.storage.remove(USER_INFO_KEY);
      return;
    }

    await this.storage.set<UserInfo>(USER_INFO_KEY, user);
  }

  async getUser(): Promise<UserInfo | null> {
    const user = await this.storage.get<UserInfo>(USER_INFO_KEY);
    return user ?? null;
  }

  async clearUser(): Promise<void> {
    await this.storage.remove(USER_INFO_KEY);
  }
}

export default UserStorage;