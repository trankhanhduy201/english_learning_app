import { createStorage } from "../storages";
import TokenManager from "./TokenManager";
import TokenStorage from "./TokenStorage";
import UserManager from "./UserManager";
import UserStorage from "./UserStorage";
import type { Token, TokenKey, UserInfo } from "./types";

export class AuthManager {
  private tokenManager: TokenManager | null = null;
  private userManager: UserManager | null = null;

  getTokenManager(): TokenManager {
    if (!this.tokenManager) {
      const storage = createStorage("local");
      const tokenStorage = new TokenStorage(storage);
      this.tokenManager = new TokenManager(tokenStorage);
    }

    return this.tokenManager;
  }

  getUserManager(): UserManager {
    if (!this.userManager) {
      const storage = createStorage("local");
      const userStorage = new UserStorage(storage);
      this.userManager = new UserManager(userStorage);
    }

    return this.userManager;
  }

  async login(
    accessToken: Token,
    refreshTokenKey: TokenKey,
  ): Promise<UserInfo | null> {
    const tokenManager = this.getTokenManager();
    const userManager = this.getUserManager();
    const userInfo = tokenManager.getTokenClaim(accessToken);

    if (!userInfo) {
      return null;
    }

    await tokenManager.setAccessToken(accessToken);
    await tokenManager.setRefreshTokenKey(refreshTokenKey);
    await tokenManager.setVerifyCache(accessToken, true);
    await userManager.setUser(userInfo);

    return userInfo;
  }

  async logout(): Promise<void> {
    const tokenManager = this.getTokenManager();
    const userManager = this.getUserManager();

    await tokenManager.clearAccessToken();
    await tokenManager.clearRefreshTokenKey();
    await tokenManager.clearVerifyCache();
    await userManager.clearUser();
  }
}

export default AuthManager;