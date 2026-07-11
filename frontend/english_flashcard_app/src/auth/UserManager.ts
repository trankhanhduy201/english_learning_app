import type { IUserStorage } from "./UserStorage";
import type { UserInfo } from "./types";

export class UserManager {
  private repo: IUserStorage;

  constructor(repo: IUserStorage) {
    this.repo = repo;
  }

  async setUser(user: UserInfo | null): Promise<void> {
    await this.repo.setUser(user);
  }

  async getUser(): Promise<UserInfo | null> {
    return await this.repo.getUser();
  }

  async clearUser(): Promise<void> {
    await this.repo.clearUser();
  }
}

export default UserManager;