import type { Storage } from "../storages/interfaces/Storage";
import type { Token, VerifyCache } from "./types";
import {
  VERIFY_CACHE_KEY,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_VERIFY_EXPIRE,
} from "./constants";

export interface ITokenStorage {
  setRefreshTokenKey(value: string | null): Promise<void>;
  getRefreshTokenKey(): Promise<string | null>;
  clearRefreshTokenKey(): Promise<void>;

  setAccessToken(token: Token): Promise<void>;
  getAccessToken(): Promise<Token>;
  clearAccessToken(): Promise<void>;

  setVerifyCache(
    token: Token,
    verified: boolean
  ): Promise<void>;
  getVerifyCache(token: Token): Promise<boolean | null>;
  clearVerifyCache(): Promise<void>;
}

export class TokenStorage implements ITokenStorage {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async setRefreshTokenKey(value: string | null): Promise<void> {
    if (value === null) {
      await this.storage.remove(REFRESH_TOKEN_KEY);
    } else {
      await this.storage.set(REFRESH_TOKEN_KEY, value);
    }
  }

  async getRefreshTokenKey(): Promise<string | null> {
    const v = await this.storage.get<string>(REFRESH_TOKEN_KEY);
    return v ?? null;
  }

  async clearRefreshTokenKey(): Promise<void> {
    await this.storage.remove(REFRESH_TOKEN_KEY);
  }

  async setAccessToken(token: Token): Promise<void> {
    if (token === null) {
      await this.storage.remove(TOKEN_KEY);
    } else {
      await this.storage.set<Token>(TOKEN_KEY, token);
    }
  }

  async getAccessToken(): Promise<Token> {
    const v = await this.storage.get<Token>(TOKEN_KEY);
    return v ?? null;
  }

  async clearAccessToken(): Promise<void> {
    await this.storage.remove(TOKEN_KEY);
  }

  async getVerifyCache(
    token: Token
  ): Promise<boolean | null> {
    const parsed =
      await this.storage.get<VerifyCache>(VERIFY_CACHE_KEY);

    if (!parsed) return null;

    if (
      parsed.at &&
      parsed.token === token &&
      Date.now() - parsed.at < TOKEN_VERIFY_EXPIRE
    ) {
      return parsed.verified;
    }

    return null;
  }

  async setVerifyCache(
    token: Token,
    verified: boolean
  ): Promise<void> {
    const payload: VerifyCache = {
      at: Date.now(),
      verified,
      token,
    };

    await this.storage.set(VERIFY_CACHE_KEY, payload);
  }

  async clearVerifyCache(): Promise<void> {
    await this.storage.remove(VERIFY_CACHE_KEY);
  }
}

export default TokenStorage;
