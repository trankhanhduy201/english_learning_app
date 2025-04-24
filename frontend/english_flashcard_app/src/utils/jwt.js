import { jwtDecode } from 'jwt-decode';

export const getTokenExp = (token: string): number | null => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000;
  } catch (error) {
    return null;
  }
}

export const checkTokenExpired = token => {
  const expiresAt = getTokenExp(token);
  return expiresAt && Date.now() >= expiresAt;
}