import * as authApi from "../services/authApi";
import * as jwtUtils from "../commons/jwt";
import type { ITokenStorage } from "./TokenStorage";
import type { TokenPayload, UserInfo, Token, RefreshTokenResponse, VerifyTokenResponse } from "./types";

export class TokenManager {
  private repo: ITokenStorage;

  constructor(repo: ITokenStorage) {
    this.repo = repo;
  }

  async setRefreshTokenKey(key: string | null): Promise<void> {
    await this.repo.setRefreshTokenKey(key);
  }

  async getRefreshTokenKey(): Promise<string | null> {
    return await this.repo.getRefreshTokenKey();
  }

  async clearRefreshTokenKey(): Promise<void> {
    await this.repo.clearRefreshTokenKey();
  }

  async setAccessToken(token: Token): Promise<void> {
    await this.repo.setAccessToken(token);
  }

  async getAccessToken(): Promise<Token> {
    return await this.repo.getAccessToken();
  }

  async clearAccessToken(): Promise<void> {
    await this.repo.clearAccessToken();
  }

  async getVerifyCache(token: Token): Promise<boolean | null> {
    return await this.repo.getVerifyCache(token);
  }

  async setVerifyCache(
    token: Token,
    verified: boolean
  ): Promise<boolean | null> {
    await this.repo.setVerifyCache(token, verified);
    return await this.repo.getVerifyCache(token);
  }

  async clearVerifyCache(): Promise<void> {
    await this.repo.clearVerifyCache();
  }

  async refreshNewToken(): Promise<string | false> {
    const refreshTokenKey = await this.repo.getRefreshTokenKey();

    if (!refreshTokenKey) {
      await this.repo.clearAccessToken();
      return false;
    }

    const resp: RefreshTokenResponse = await authApi.refreshToken({
      refresh_token_key: refreshTokenKey,
    });

    if (resp.status === "error") {
      await this.repo.clearAccessToken();
      await this.repo.clearRefreshTokenKey();
      return false;
    }

    const accessToken = resp.data?.access;

    if (accessToken) {
      await this.repo.setAccessToken(accessToken);
    }

    return accessToken || false;
  }

  async verifyToken(token: Token): Promise<boolean> {
    try {
      const cached = await this.repo.getVerifyCache(token);

      if (cached !== null) {
        return cached;
      }

      if (token) {
        const resp: VerifyTokenResponse = await authApi.verifyToken(token);

        if (resp.status === "success") {
          await this.repo.setVerifyCache(token, true);
          return true;
        }
      }

      const accessToken = await this.refreshNewToken();
      const verified = !!accessToken;

      await this.repo.setVerifyCache(
        verified && typeof accessToken === "string"
          ? (accessToken as Token)
          : null,
        verified
      );

      return verified;
    } catch (e) {
      // Log error to aid debugging; return false to indicate not verified
      // eslint-disable-next-line no-console
      console.error("TokenManager.verifyToken error", e);
      return false;
    }
  }

  async localVerifyToken(token?: Token): Promise<boolean> {
    if (token && !jwtUtils.checkTokenExpired(token, 120)) {
      return true;
    }

    const accessToken = await this.refreshNewToken();
    return !!accessToken;
  }

  getTokenClaim(token?: Token): UserInfo | null {
    if (!token) return null;

    const payload = jwtUtils.getTokenPayload(token) as TokenPayload | null;

    if (!payload) return null;

    return {
      id: payload.user_id,
      username: payload.username,
      email: payload.email,
      full_name: payload.full_name,
    };
  }
}

export default TokenManager;