import AuthManager from "./AuthManager";

let authManagerInstance: AuthManager | null = null;

export const getAuthManager = (): AuthManager => {
  if (!authManagerInstance) {
    authManagerInstance = new AuthManager();
  }

  return authManagerInstance;
};

export default getAuthManager;